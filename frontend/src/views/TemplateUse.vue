<template>
  <MainLayout>
    <template #default="{ sidebarOpen }">
      <div class="consultation-outer" :class="{ 'sidebar-open': sidebarOpen }">

        <!-- Extracted Sidebar Component -->
        <PatientSidebar v-if="patient" :patient="patient" />

        <!-- Main Form Area -->
        <div class="templates-page">
          <h1 class="title">Patient Examination</h1>

          <p v-if="error" class="error-message">{{ error }}</p>

          <TemplateRenderer 
            v-if="currentTemplate" 
            :template="currentTemplate" 
            :initialData="currentInitialData"
            @update="updateFormData" 
          />
          <p v-else>Loading templates...</p>

          <div class="navigation-buttons">
            <button v-if="currentIndex > 0" class="back-btn" @click="previousTemplate">Back</button>

            <button 
              v-if="!isLastPage" 
              class="next-btn" 
              :class="{ disabled: !canGoNext }" 
              :disabled="!canGoNext"
              @click="nextTemplate"
            >
              Next
            </button>

            <button 
              v-else 
              class="save-btn" 
              :class="{ disabled: !canGoNext || isSaving }"
              :disabled="!canGoNext || isSaving" 
              @click="saveAllForms"
            >
              {{ isSaving ? "Saving..." : "Save Consultation" }}
            </button>

            <button v-if="isDoctor" class="save-draft-btn" @click="saveDraft">
              💾 Save & Continue Later
            </button>

            <button v-if="isDoctor" class="order-tests-btn" @click="showOrderTests = true">
              🧪 Order Tests
            </button>
          </div>

          <OrderTestsModal
            v-if="showOrderTests"
            :patientId="patientId"
            :patientName="patient ? `${patient.firstName} ${patient.lastName}` : ''"
            :patientDob="patient?.dateOfBirth || ''"
            :doctorName="doctorName"
            :alreadyOrderedIds="pendingTestIds"
            @close="onOrderTestsClose"
          />
        </div>

      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getTemplates, saveTemplateConsultation } from "@/api/template";
import TemplateRenderer from "@/components/templates/TemplateRenderer.vue";
import MainLayout from "@/components/MainLayout.vue";
import OrderTestsModal from "@/components/OrderTestsModal.vue";
import PatientSidebar from "./consultation/PatientSidebar.vue";
import { api } from "@/api/api.js";

const route = useRoute();
const router = useRouter();
const patientId = route.params.patientId;

// State
const serverTemplates = ref([]);
const isSaving = ref(false);
const error = ref("");
const currentIndex = ref(0);
const patient = ref(null);
const showOrderTests = ref(false);

const allForms = ref({});
const currentFormData = ref({});

// User identity
const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
const isDoctor = storedUser.role === 'doctor';
const doctorName = storedUser.firstName && storedUser.lastName
  ? `Dr. ${storedUser.firstName} ${storedUser.lastName}`
  : storedUser.username || '';

// Modal logic tracking
const pendingTestIds = computed(() => 
  (patient.value?.orderedTests || []).filter(t => t.status === 'pending').map(t => t.testId)
);

async function onOrderTestsClose() {
  showOrderTests.value = false;
  if (patientId) {
    try { patient.value = await api.getPatient(patientId); } catch {}
  }
}

const activeTemplates = computed(() => serverTemplates.value);

const currentTemplate = computed(() => activeTemplates.value[currentIndex.value]);
const isLastPage = computed(() => currentIndex.value === activeTemplates.value.length - 1);

// Cross-pollination Data Logic
const SOURCE_TEMPLATE = "basic_diagnosis";
const currentInitialData = computed(() => {
  if (!currentTemplate.value) return {};

  const savedCurrentPage = allForms.value[currentTemplate.value?.id] || {};

  if (currentTemplate.value?.id === "prescribe_medication") {
    const source = allForms.value[SOURCE_TEMPLATE] || {};
    return {
      ...savedCurrentPage,
      allergies: savedCurrentPage.allergies || source.allergies || "",
      current_medications: savedCurrentPage.current_medications?.length
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
    serverTemplates.value = await getTemplates();
  } catch (err) {
    error.value = err?.response?.data?.message || err?.response?.data?.error || "Unable to load templates.";
  }
}

async function loadPatient() {
  if (!patientId) return;
  try {
    patient.value = await api.getPatient(patientId);
    const draft = patient.value?.consultationDraft;
    if (draft?.savedAt && draft.forms && Object.keys(draft.forms).length > 0) {
      allForms.value = draft.forms;
      currentIndex.value = draft.currentIndex ?? 0;
    }
  } catch (err) {
    console.error("Failed to load patient", err);
  }
}

async function saveDraft() {
  if (currentTemplate.value) {
    allForms.value[currentTemplate.value.id] = { ...currentFormData.value };
  }
  try {
    await api.saveConsultationDraft(patientId, {
      forms: allForms.value,
      currentIndex: currentIndex.value,
    });
    router.push(`/patients/${patientId}`);
  } catch (err) {
    error.value = "Failed to save draft. Please try again.";
  }
}

function updateFormData(data) {
  currentFormData.value = { ...data };
}

// Field Validation Logic
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
    try { await api.clearConsultationDraft(patientId); } catch {}
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

/* 
  Vue 3 Deep Selector 
  Targets the scoping rules of the extracted PatientSidebar component 
  when the sidebar-open class wraps it.
*/
.consultation-outer.sidebar-open :deep(.patient-panel) {
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

.save-draft-btn {
  padding: 14px 34px;
  border: 2px solid #b45309;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  background: white;
  color: #b45309;
  transition: all 0.2s ease;
}

.save-draft-btn:hover {
  background: #b45309;
  color: white;
  transform: translateY(-1px);
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