<template>
  <MainLayout>
    <template #default="{ sidebarOpen }">
      <div class="consultation-outer" :class="{ 'sidebar-open': sidebarOpen }">

        <!-- Patient Summary Panel (RIGHT) -->
        <div class="patient-panel" v-if="patient">
          <h2 class="panel-title">🏥 Patient Summary</h2>
          <div class="panel-section">
            <div class="patient-name">{{ patient.firstName }} {{ patient.lastName }}</div>
            <div class="patient-meta" v-if="patient.dateOfBirth">DOB: {{ new
              Date(patient.dateOfBirth).toLocaleDateString() }}</div>
            <div class="patient-meta" v-if="patient.gender">Gender: {{ patient.gender }}</div>
          </div>
          <div class="panel-section">
            <h3 class="panel-section-title">⚠️ Allergies</h3>
            <ul class="panel-list" v-if="patient.executiveSummary?.allergies?.length">
              <li v-for="a in patient.executiveSummary.allergies" :key="a" class="allergy-item">{{ a }}</li>
            </ul>
            <p class="panel-empty" v-else>None listed</p>
          </div>
          <div class="panel-section">
            <h3 class="panel-section-title">💊 Medications</h3>
            <ul class="panel-list" v-if="patient.executiveSummary?.activeMedications?.length">
              <li v-for="med in patient.executiveSummary.activeMedications" :key="med.name">{{ med.name }} {{ med.dosage
                }}</li>
            </ul>
            <p class="panel-empty" v-else>None listed</p>
          </div>
          <div class="panel-section" v-if="patient.clinicalHistory?.conditions?.length">
            <h3 class="panel-section-title">🩺 Conditions</h3>
            <ul class="panel-list">
              <li v-for="c in patient.clinicalHistory.conditions" :key="c">{{ c }}</li>
            </ul>
          </div>
          <div class="panel-section" v-if="patient.clinicalHistory?.surgeries?.length">
            <h3 class="panel-section-title">🔪 Surgeries</h3>
            <ul class="panel-list">
              <li v-for="s in patient.clinicalHistory.surgeries" :key="s">{{ s }}</li>
            </ul>
          </div>
        </div>

        <!-- Main Form Area -->
        <div class="templates-page">
          <h1 class="title">Patient Examination</h1>

          <p v-if="error" class="error-message">{{ error }}</p>

          <TemplateRenderer v-if="currentTemplate" :template="currentTemplate" :initialData="currentInitialData"
            @update="updateFormData" />

          <p v-else>Loading templates...</p>

          <div class="navigation-buttons">
            <button v-if="currentIndex > 0" class="back-btn" @click="previousTemplate">Back</button>

            <button v-if="!isLastPage" class="next-btn" :class="{ disabled: !canGoNext }" :disabled="!canGoNext"
              @click="nextTemplate">
              Next
            </button>

            <button v-else class="save-btn" :class="{ disabled: !canGoNext || isSaving }"
              :disabled="!canGoNext || isSaving" @click="saveAllForms">
              {{ isSaving ? "Saving..." : "Save Consultation" }}
            </button>

            <button class="order-tests-btn" @click="showOrderTests = true">
              🧪 Order Tests
            </button>
          </div>

          <!-- Order Tests Modal -->
          <OrderTestsModal
            v-if="showOrderTests"
            :patientName="patient ? `${patient.firstName} ${patient.lastName}` : ''"
            :patientDob="patient?.dateOfBirth || ''"
            :doctorName="doctorName"
            @close="showOrderTests = false"
          />
        </div>

      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { getTemplates, saveTemplateConsultation } from "@/api/template";
import TemplateRenderer from "@/components/templates/TemplateRenderer.vue";
import MainLayout from "@/components/MainLayout.vue";
import OrderTestsModal from "@/components/OrderTestsModal.vue";
import { api } from "@/api/api.js";

const route = useRoute();
const patientId = route.params.patientId;

const templates = ref([]);
const isSaving = ref(false);
const error = ref("");
const currentIndex = ref(0);
const patient = ref(null);
const showOrderTests = ref(false);

// Pull doctor name from the JWT stored in localStorage
const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
const doctorName = storedUser.firstName && storedUser.lastName
  ? `Dr. ${storedUser.firstName} ${storedUser.lastName}`
  : storedUser.username || ''

const currentTemplate = computed(() => templates.value[currentIndex.value]);
const isLastPage = computed(() => currentIndex.value === templates.value.length - 1);

const allForms = ref({});
const currentFormData = ref({});
const SOURCE_TEMPLATE = "basic_diagnosis";

const currentInitialData = computed(() => {
  if (!currentTemplate.value) return {};

  const savedCurrentPage = allForms.value[currentTemplate.value?.id] || {};

  if (currentTemplate.value?.id === "prescribe_medication") {
    const source = allForms.value[SOURCE_TEMPLATE] || {};
    return {
      ...savedCurrentPage,
      allergies: savedCurrentPage.allergies || source.allergies || "",
      current_medications:
        savedCurrentPage.current_medications?.length
          ? savedCurrentPage.current_medications
          : source.current_medications || []
    };
  }

  return savedCurrentPage;
});

watch(currentTemplate, () => {
  currentFormData.value = { ...currentInitialData.value };
}, { immediate: true });

async function loadTemplates() {
  error.value = "";
  try {
    templates.value = await getTemplates();
  } catch (err) {
    error.value = err?.response?.data?.message || err?.response?.data?.error || "Unable to load templates.";
  }
}

async function loadPatient() {
  if (!patientId) return;
  try {
    patient.value = await api.getPatient(patientId);
  } catch (err) {
    console.error("Failed to load patient", err);
  }
}

function updateFormData(data) {
  currentFormData.value = { ...data };
}

const canGoNext = computed(() => {
  if (!currentTemplate.value) return false;
  return currentTemplate.value.fields.some(field => {
    const value = currentFormData.value[field.id];
    if (Array.isArray(value)) return value.length > 0;
    if (field.type === "boolean") return value === true || value === false;
    return value !== "" && value !== null && value !== undefined;
  });
});

function nextTemplate() {
  if (!canGoNext.value) return;
  allForms.value[currentTemplate.value.id] = { ...currentFormData.value };
  currentIndex.value++;
}

function previousTemplate() {
  allForms.value[currentTemplate.value.id] = { ...currentFormData.value };
  if (currentIndex.value > 0) currentIndex.value--;
}

async function saveAllForms() {
  if (!canGoNext.value) return;
  allForms.value[currentTemplate.value.id] = { ...currentFormData.value };

  const payload = { patientId, forms: allForms.value };
  isSaving.value = true;
  error.value = "";

  try {
    await saveTemplateConsultation(payload);
    alert("Patient examination saved successfully");
  } catch (err) {
    error.value = err?.response?.data?.message || err?.response?.data?.error || "Unable to save consultation.";
  } finally {
    isSaving.value = false;
  }
}

loadTemplates();
loadPatient();
</script>

<style scoped>
.consultation-outer {
  display: flex;
  flex-direction: row;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
  transition: all 0.3s ease;
}

.patient-panel {
  width: 220px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #2D6A4F;
  align-self: flex-start;
  position: sticky;
  top: 0;
  transition: width 0.3s ease, padding 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}

.consultation-outer.sidebar-open .patient-panel {
  width: 0;
  padding: 0;
  border: none;
  box-shadow: none;
  opacity: 0;
}

.templates-page {
  flex: 1;
  min-width: 0;
  max-width: 65vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background: #e8e4cf;
  border-radius: 12px;
}

.panel-title {
  font-size: 15px;
  font-weight: 700;
  color: #10231b;
  margin: 0 0 14px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e4cf;
}

.panel-section {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.panel-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.patient-name {
  font-size: 14px;
  font-weight: 700;
  color: #10231b;
}

.patient-meta {
  font-size: 12px;
  color: #777;
  margin-top: 2px;
}

.panel-section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #555;
  margin: 0 0 6px 0;
}

.panel-list {
  padding-left: 14px;
  margin: 0;
  font-size: 12px;
  color: #333;
}

.panel-list li {
  margin-bottom: 3px;
}

.allergy-item {
  color: #b91c1c;
  font-weight: 600;
}

.panel-empty {
  font-size: 12px;
  color: #aaa;
  font-style: italic;
}

.title {
  font-size: 52px;
  font-weight: 700;
  color: #10231b;
  margin-bottom: 28px;
}

.navigation-buttons {
  display: flex;
  gap: 18px;
  margin-top: 26px;
  margin-bottom: 20px;
}

.back-btn,
.next-btn,
.save-btn {
  padding: 14px 34px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn {
  background: #d9d9d9;
  color: black;
}

.next-btn {
  background: #2e7d32;
  color: white;
}

.save-btn {
  background: #2e7d32;
  color: white;
}

.next-btn:hover,
.save-btn:hover,
.back-btn:hover {
  transform: translateY(-1px);
}

.disabled {
  background: #bdbdbd !important;
  cursor: not-allowed;
  opacity: 0.75;
  transform: none !important;
}

.error-message {
  color: #b91c1c;
  font-weight: 700;
  margin-bottom: 18px;
}

.order-tests-btn {
  padding: 14px 34px;
  border: 2px solid #2e7d32;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  background: white;
  color: #2e7d32;
  transition: all 0.2s ease;
}

.order-tests-btn:hover {
  background: #2e7d32;
  color: white;
  transform: translateY(-1px);
}
</style>