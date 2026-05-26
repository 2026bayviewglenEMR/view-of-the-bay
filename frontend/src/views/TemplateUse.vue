<template>
  <MainLayout>
    <template #default="{ sidebarOpen }">
      <div class="consultation-outer" :class="{ 'sidebar-open': sidebarOpen }">

        <PatientSidebar v-if="patient" :patient="patient" />

        <div v-if="showBuilder" class="templates-page plan-builder">
          <div class="step-tracker" aria-label="Consultation steps">
            <div
              v-for="step in visibleStepItems"
              :key="step.id"
              class="step-chip"
              :class="{ active: step.active, complete: step.complete }"
            >
              <span>{{ step.number }}</span>
              <strong>{{ step.name }}</strong>
            </div>
          </div>

          <p class="step-count">Step {{ currentStepNumber }} of {{ totalStepCount }}</p>
          <h1 class="title">Treatment Plan Setup</h1>
          <p class="subtitle">Mandatory examination complete. Select any additional actions needed for this patient's
            disposition.</p>

          <div class="plan-sections">
            <div class="optional-section" v-if="optionalTemplates.length > 0">
              <h3>Available Actions & Forms</h3>
              <div class="checkbox-grid">
                <label v-for="t in optionalTemplates" :key="t.id" class="opt-label">
                  <input type="checkbox" :value="t.id" v-model="selectedOptionalIds" />
                  {{ t.name }}
                </label>
              </div>
            </div>
            <p v-else class="panel-empty">No optional templates available from server.</p>
          </div>

          <div class="navigation-buttons">
            <button class="back-btn" @click="backFromBuilder">Back to Examination</button>
            <button class="next-btn" @click="proceedFromBuilder">Continue to Plan ➔</button>
          </div>
        </div>

        <div v-else class="templates-page">
          <div class="step-tracker" aria-label="Consultation steps">
            <div
              v-for="step in visibleStepItems"
              :key="step.id"
              class="step-chip"
              :class="{ active: step.active, complete: step.complete }"
            >
              <span>{{ step.number }}</span>
              <strong>{{ step.name }}</strong>
            </div>
          </div>

          <p class="step-count">Step {{ currentStepNumber }} of {{ totalStepCount }}</p>
          <h1 class="title">Patient Examination</h1>
          <p v-if="error" class="error-message">{{ error }}</p>

          <TemplateRenderer v-if="currentTemplate" :template="currentTemplate" :initialData="currentInitialData"
            @update="updateFormData" />
          <p v-else>Loading templates...</p>

          <div v-if="isLastPage && hasSeenBuilder" class="soap-preview">
            <h3 class="soap-title">SOAP Note Preview</h3>
            <p class="soap-subtitle">Auto-generated from your entries. Saved with this consultation.</p>
            <div class="soap-sections">
              <div class="soap-section">
                <div class="soap-label">S — Subjective</div>
                <div class="soap-content">{{ soapNote.subjective || 'No subjective data entered.' }}</div>
              </div>
              <div class="soap-section">
                <div class="soap-label">O — Objective</div>
                <div class="soap-content">{{ soapNote.objective || 'No objective data entered.' }}</div>
              </div>
              <div class="soap-section">
                <div class="soap-label">A — Assessment</div>
                <div class="soap-content">{{ soapNote.assessment || 'No assessment entered.' }}</div>
              </div>
              <div class="soap-section">
                <div class="soap-label">P — Plan</div>
                <div class="soap-content">{{ soapNote.plan || 'No plan entered.' }}</div>
              </div>
            </div>
          </div>

          <div class="navigation-buttons">
            <button v-if="currentIndex > 0" class="back-btn" @click="previousTemplate">Back</button>

            <button v-if="!isLastPage || !hasSeenBuilder" class="next-btn" :class="{ disabled: !canGoNext }"
              :disabled="!canGoNext" @click="nextTemplate">
              Next
            </button>

            <button v-else class="save-btn" :class="{ disabled: !canGoNext || isSaving }"
              :disabled="!canGoNext || isSaving" @click="saveAllForms">
              {{ isSaving ? "Saving..." : "Save Consultation" }}
            </button>

            <button v-if="isDoctor" class="save-draft-btn" @click="saveDraft">
              💾 Save & Continue Later
            </button>
            <button v-if="isDoctor" class="order-tests-btn" @click="showOrderTests = true">
              🧪 Order Tests
            </button>
          </div>
        </div>

        <OrderTestsModal v-if="showOrderTests" :patientId="patientId"
          :patientName="patient ? `${patient.firstName} ${patient.lastName}` : ''"
          :patientDob="patient?.dateOfBirth || ''" :doctorName="doctorName" :alreadyOrderedIds="pendingTestIds"
          @close="onOrderTestsClose" />

      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getTemplates, saveTemplateConsultation } from "@/api/template";
import { api } from "@/api/api.js";
import { formsConfig } from "./consultation/formsConfig.js";

import MainLayout from "@/components/MainLayout.vue";
import TemplateRenderer from "@/components/templates/TemplateRenderer.vue";
import OrderTestsModal from "./consultation/OrderTestsModal.vue";
import PatientSidebar from "./consultation/PatientSidebar.vue";

const route = useRoute();
const router = useRouter();
const patientId = route.params.patientId;

const soapNote = computed(() => {
  const sym = allForms.value.symptoms_checklist || {};
  const diag = allForms.value.basic_diagnosis || {};
  const vit = allForms.value.vitals_check || {};
  const med = allForms.value.prescribe_medication || {};

  const vitalsStr = [
    vit.temperature ? `Temp: ${vit.temperature}°C` : null,
    vit.heart_rate ? `HR: ${vit.heart_rate} bpm` : null,
    vit.blood_pressure ? `BP: ${vit.blood_pressure}` : null,
    vit.respiratory_rate ? `RR: ${vit.respiratory_rate}` : null,
    vit.height ? `Height: ${vit.height}` : null,
    vit.weight ? `Weight: ${vit.weight}` : null,
    vit.bmi ? `BMI: ${vit.bmi}` : null,
  ].filter(Boolean).join(' · ');

  const medName = med.medication?.name || (typeof med.medication === 'string' ? med.medication : null);
  const medStr = medName
    ? [medName, med.dosage, med.frequency, med.instructions].filter(Boolean).join(', ')
    : null;

  return {
    subjective: [
      sym.symptoms?.length ? `Symptoms: ${sym.symptoms.join(', ')}` : null,
      sym.additional_notes ? `Notes: ${sym.additional_notes}` : null,
      diag.chief_complaint ? `Chief complaint: ${diag.chief_complaint}` : null,
      diag.pain_level ? `Pain level: ${diag.pain_level}/10` : null,
      diag.symptom_duration ? `Duration: ${diag.symptom_duration}` : null,
    ].filter(Boolean).join('\n'),

    objective: [
      vitalsStr || null,
      vit.additional_notes ? `Notes: ${vit.additional_notes}` : null,
      diag.physical_exam ? `Physical exam: ${diag.physical_exam}` : null,
    ].filter(Boolean).join('\n'),

    assessment: [
      diag.diagnosis ? `Diagnosis: ${diag.diagnosis}` : null,
      diag.allergies ? `Allergies: ${diag.allergies}` : null,
    ].filter(Boolean).join('\n'),

    plan: [
      diag.treatment_plan ? `Treatment: ${diag.treatment_plan}` : null,
      diag.follow_up !== '' && diag.follow_up !== undefined ? `Follow-up needed: ${diag.follow_up ? 'Yes' : 'No'}` : null,
      medStr ? `Medication: ${medStr}` : null,
      diag.additional_notes ? `Notes: ${diag.additional_notes}` : null,
    ].filter(Boolean).join('\n'),
  };
});

// State Tracking
const serverTemplates = ref([]);
const workflowTemplates = ref([]);
const currentIndex = ref(0);

// Builder State
const showBuilder = ref(false);
const hasSeenBuilder = ref(false);
const selectedOptionalIds = ref([]);

const patient = ref(null);
const isSaving = ref(false);
const error = ref("");
const showOrderTests = ref(false);

const allForms = ref({});
const currentFormData = ref({});

// Authentication & Profile Parsing
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
    try { patient.value = await api.getPatient(patientId); } catch { }
  }
}

// -------------------------------------------------------------
// DYNAMIC WORKFLOW & BUILDER LOGIC
// -------------------------------------------------------------
const mandatoryTemplates = computed(() => serverTemplates.value.filter(t => t.isMandatory === true));
const optionalTemplates = computed(() => serverTemplates.value.filter(t => t.isMandatory === false));

const currentTemplate = computed(() => workflowTemplates.value[currentIndex.value]);
const isLastPage = computed(() => currentIndex.value === workflowTemplates.value.length - 1);
const visibleStepItems = computed(() => {
  if (showBuilder.value) {
    return [
      ...mandatoryTemplates.value.map((template, index) => ({
        id: template.id,
        name: template.name,
        number: index + 1,
        active: false,
        complete: true
      })),
      {
        id: "plan-builder",
        name: "Plan Setup",
        number: mandatoryTemplates.value.length + 1,
        active: true,
        complete: false
      }
    ];
  }

  return workflowTemplates.value.map((template, index) => ({
    id: template.id,
    name: template.name,
    number: index + 1,
    active: index === currentIndex.value,
    complete: index < currentIndex.value
  }));
});
const currentStepNumber = computed(() =>
  showBuilder.value ? mandatoryTemplates.value.length + 1 : currentIndex.value + 1
);
const totalStepCount = computed(() =>
  showBuilder.value ? mandatoryTemplates.value.length + 1 : workflowTemplates.value.length
);

// Move out of the builder and assemble the final layout array
function proceedFromBuilder() {
  const selectedOptionals = optionalTemplates.value.filter(t => selectedOptionalIds.value.includes(t.id));

  // Re-assemble the workflow: Mandatory + User Selections
  workflowTemplates.value = [...mandatoryTemplates.value, ...selectedOptionals];

  hasSeenBuilder.value = true;
  showBuilder.value = false;

  // Jump index forward if they picked forms, otherwise stay on last mandatory form
  if (selectedOptionals.length > 0) {
    currentIndex.value = mandatoryTemplates.value.length;
  } else {
    currentIndex.value = mandatoryTemplates.value.length - 1;
  }
}

function backFromBuilder() {
  showBuilder.value = false;
  currentIndex.value = mandatoryTemplates.value.length - 1;
}

// -------------------------------------------------------------
// NAVIGATION PAGINATION
// -------------------------------------------------------------
const currentInitialData = computed(() =>
  formsConfig.getInitialData(
    currentTemplate.value,
    allForms.value,
    patient.value
  )
);

watch(
  [currentTemplate, currentInitialData],
  () => {
    currentFormData.value = {
      ...currentInitialData.value
    };
  },
  { immediate: true }
);
const canGoNext = computed(() =>
  formsConfig.validateStep(currentTemplate.value, currentFormData.value)
);

function updateFormData(data) {
  currentFormData.value = { ...data };
}

function nextTemplate() {
  if (!canGoNext.value) return;
  allForms.value = {
    ...allForms.value,

    [currentTemplate.value.id]: {
      ...currentFormData.value
    }
  };

  // If we haven't reached the end, go to next page
  if (!isLastPage.value) {
    currentIndex.value++;
  }
  // If we reached the end of the mandatory section and haven't seen the builder yet
  else if (!hasSeenBuilder.value) {
    showBuilder.value = true;
  }
}

function previousTemplate() {
  allForms.value = {
    ...allForms.value,

    [currentTemplate.value.id]: {
      ...currentFormData.value
    }
  };

  // If going back from the very first optional form, re-open the builder
  if (hasSeenBuilder.value && currentIndex.value === mandatoryTemplates.value.length) {
    showBuilder.value = true;
  }
  // Standard go back
  else if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}

// -------------------------------------------------------------
// API & SAVING
// -------------------------------------------------------------
async function loadTemplates() {
  try {
    const res = await getTemplates();
    serverTemplates.value = res.data || res; // Handle raw arrays or Axios wrappers

    // Initialize the workflow array with just the mandatory ones
    workflowTemplates.value = [...mandatoryTemplates.value];
  } catch (err) {
    error.value = "Unable to load template definitions from server.";
  }
}

async function loadPatient() {
  if (!patientId) return;
  try {
    patient.value = await api.getPatient(patientId);
    const draft = patient.value?.consultationDraft;

    if (draft?.savedAt && draft.forms && Object.keys(draft.forms).length > 0) {
      allForms.value = draft.forms;

      const draftKeys = Object.keys(draft.forms);
      const draftOptionals = optionalTemplates.value.filter(t => draftKeys.includes(t.id));
      selectedOptionalIds.value = draftOptionals.map(t => t.id);

      workflowTemplates.value = [...mandatoryTemplates.value, ...draftOptionals];
      currentIndex.value = draft.currentIndex ?? 0;

      if (draftOptionals.length > 0) {
        hasSeenBuilder.value = true;
      }
    }
  } catch (err) {
    console.error("Failed to load patient", err);
  }
}

async function saveDraft() {
  if (currentTemplate.value) {
    allForms.value = {
      ...allForms.value,

      [currentTemplate.value.id]: {
        ...currentFormData.value
      }
    };
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
async function syncExecutiveSummaryFromForms() {
  const diagnosisForm =
    allForms.value.basic_diagnosis || {};

  const prescribeForm =
    allForms.value.prescribe_medication || {};

  const allergies =
    prescribeForm.allergies ||
    diagnosisForm.allergies ||
    "";

  const currentMedications =
    prescribeForm.current_medications?.length
      ? prescribeForm.current_medications
      : diagnosisForm.current_medications || [];

  const prescribedMedications =
    prescribeForm.medications || [];

  const formattedCurrentMedications =
    currentMedications.map(med => ({
      name: med.name || med,
      dosage: med.dosage || "Not specified",
      frequency: med.frequency || "Not specified"
    }));

  const formattedPrescribedMedications =
    prescribedMedications.map(med => ({
      name: med.name || med,
      dosage: prescribeForm.dosage || "Not specified",
      frequency: prescribeForm.frequency || "Not specified"
    }));

  const combinedMedications = [
    ...formattedCurrentMedications,
    ...formattedPrescribedMedications
  ];

  const activeMedications =
    combinedMedications.filter(
      (med, index, arr) =>
        arr.findIndex(
          item =>
            item.name?.toLowerCase() ===
            med.name?.toLowerCase()
        ) === index
    );

  await api.updateExecutiveSummary(
    patientId,
    {
      allergies,
      activeMedications
    }
  );
}
async function saveAllForms() {
  if (!canGoNext.value) return;
  allForms.value = {
    ...allForms.value,

    [currentTemplate.value.id]: {
      ...currentFormData.value
    }
  };

  isSaving.value = true;
  error.value = "";

  try {
    await syncExecutiveSummaryFromForms();

    await saveTemplateConsultation({
      patientId,
      forms: allForms.value,
      soapNote: soapNote.value,
    });
    try { await api.clearConsultationDraft(patientId); } catch { }
    alert("Patient examination saved successfully");
    router.push(`/patients/${patientId}`);
  } catch (err) {
    error.value = err?.response?.data?.message || err?.response?.data?.error || "Unable to save consultation.";
  } finally {
    isSaving.value = false;
  }
}

onMounted(async () => {
  await loadTemplates();
  await loadPatient();
});
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

.step-tracker {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.step-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 220px;
  padding: 9px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  border: 2px solid #d6d0b6;
  color: #4b5563;
}

.step-chip span {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #f3f4f6;
  color: #10231b;
  font-size: 13px;
  font-weight: 800;
}

.step-chip strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.step-chip.active {
  border-color: #2d6a4f;
  background: #ffffff;
  color: #10231b;
}

.step-chip.active span,
.step-chip.complete span {
  background: #2d6a4f;
  color: white;
}

.step-chip.complete {
  border-color: #94bfa5;
}

.step-count {
  align-self: flex-start;
  margin: 0 0 8px;
  color: #2d6a4f;
  font-size: 15px;
  font-weight: 800;
}

.title {
  font-size: 52px;
  font-weight: 700;
  color: #10231b;
  margin: 0 0 28px;
}

/* Plan Builder Styles */
.plan-builder {
  align-items: stretch;
}

.subtitle {
  color: #555;
  margin-top: -16px;
  margin-bottom: 32px;
  font-size: 1.1rem;
  text-align: center;
}

.plan-sections {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.optional-section {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.optional-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #2D6A4F;
  border-bottom: 2px solid #e8e4cf;
  padding-bottom: 8px;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.opt-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #333;
}

/* Navigation Buttons */
.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 26px;
  margin-bottom: 20px;
}

.back-btn,
.next-btn,
.save-btn,
.save-draft-btn,
.order-tests-btn {
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

.next-btn,
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

.soap-preview {
  width: 100%;
  margin-top: 24px;
  padding: 20px;
  background: #f8fdf9;
  border: 1px solid #b7dfc8;
  border-radius: 10px;
  box-sizing: border-box;
}

.soap-title {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 700;
  color: #1e4d38;
}

.soap-subtitle {
  margin: 0 0 16px 0;
  font-size: 12px;
  color: #6b8f7a;
}

.soap-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.soap-section {
  background: white;
  border-radius: 8px;
  padding: 12px 14px;
  border-left: 3px solid #2d6a4f;
}

.soap-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #2d6a4f;
  margin-bottom: 6px;
}

.soap-content {
  font-size: 13px;
  color: #333;
  white-space: pre-line;
  line-height: 1.5;
}

.save-draft-btn {
  border: 2px solid #b45309;
  background: white;
  color: #b45309;
}

.save-draft-btn:hover {
  background: #b45309;
  color: white;
  transform: translateY(-1px);
}

.order-tests-btn {
  border: 2px solid #2e7d32;
  background: white;
  color: #2e7d32;
}

.order-tests-btn:hover {
  background: #2e7d32;
  color: white;
  transform: translateY(-1px);
}
</style>
