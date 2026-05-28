<template>
  <MainLayout>
    <template #default="{ sidebarOpen }">
      <div class="consultation-outer" :class="{ 'sidebar-open': sidebarOpen }">

        <PatientSidebar v-if="patient" :patient="patient" />

        <div v-if="showBuilder" class="templates-page plan-builder">
          <div class="step-tracker" aria-label="Consultation steps">
            <div
              v-for="step in consultationPhaseItems"
              :key="step.id"
              class="step-chip"
              :class="{ active: step.active, complete: step.complete }"
            >
              <span>{{ step.number }}</span>
              <strong>{{ step.name }}</strong>
            </div>
          </div>

          <p class="step-count">Step {{ currentStepNumber }} of {{ totalStepCount }}</p>

          <div class="plan-sections">
            <template v-if="optionalTemplateGroups.length > 0">
              <div
                v-for="group in optionalTemplateGroups"
                :key="group.name"
                class="optional-section"
              >
                <h3>{{ group.name }}</h3>
                <div class="option-card-grid">
                  <label v-for="template in group.templates" :key="template.id" class="option-card">
                    <input type="checkbox" :value="template.id" v-model="selectedOptionalIds" />
                    <span class="option-card-number">{{ getOptionalDisplayNumber(template.id) }}</span>
                    <span>
                      <strong>{{ template.name }}</strong>
                      <small>{{ getOptionalDescription(template.id) }}</small>
                    </span>
                  </label>
                </div>
              </div>
            </template>
            <p v-else class="panel-empty">No optional templates available from server.</p>
          </div>

          <div class="navigation-buttons">
            <button class="back-btn" @click="backFromBuilder">Back to Examination</button>
            <button
              class="next-btn"
              :class="{ disabled: selectedOptionalIds.length === 0 }"
              :disabled="selectedOptionalIds.length === 0"
              @click="proceedFromBuilder"
            >
              Continue to Plan
            </button>
          </div>
        </div>

        <div v-else class="templates-page">
          <div class="step-tracker" aria-label="Consultation steps">
            <div
              v-for="step in consultationPhaseItems"
              :key="step.id"
              class="step-chip"
              :class="{ active: step.active, complete: step.complete }"
            >
              <span>{{ step.number }}</span>
              <strong>{{ step.name }}</strong>
            </div>
          </div>

          <p class="step-count">Step {{ currentStepNumber }} of {{ totalStepCount }}</p>
          <p v-if="error" class="error-message">{{ error }}</p>

          <div v-if="isInPlanOptions && selectedPlanSteps.length" class="selected-actions-strip">
            <span>Step 4 options</span>
            <strong>{{ currentOptionalPosition }}</strong>
          </div>

          <TemplateRenderer v-if="currentTemplate"
            :key="`${currentTemplate.id}-${quickFillKey}`"
            :template="currentTemplate"
            :initialData="currentInitialData"
            @update="updateFormData" />
          <p v-else>Loading templates...</p>

          <div v-if="saved" class="save-success">
            <div class="save-success-icon">✓</div>
            <h3 class="save-success-title">Consultation Saved</h3>
            <p class="save-success-sub">The SOAP note and examination data have been recorded.</p>
            <div class="save-success-actions">
              <button class="download-pdf-btn" @click="downloadSOAPPdf">
                📄 Download Summary PDF
              </button>
              <button class="go-record-btn" @click="router.push(`/patients/${patientId}`)">
                Go to Patient Record →
              </button>
            </div>
          </div>

          <div v-if="isLastPage && hasSeenBuilder && !saved" class="soap-preview">
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

          <div v-if="!saved" class="navigation-buttons">
            <button v-if="currentIndex > 0" class="back-btn" @click="previousTemplate">Back</button>

            <button v-if="!isLastPage || !hasSeenBuilder" class="next-btn" :class="{ disabled: !canGoNext }"
              :disabled="!canGoNext" @click="nextTemplate">
              Next
            </button>

            <button v-else class="save-btn" :class="{ disabled: !canGoNext || isSaving }"
              :disabled="!canGoNext || isSaving" @click="saveAllForms">
              {{ isSaving ? "Saving..." : "Save Consultation" }}
            </button>

            <button v-if="isDoctor" class="quick-fill-btn" @click="showQuickFill = true">
              ⚡ Quick Fill
            </button>

            <button v-if="isDoctor" class="save-draft-btn" @click="saveDraft">
              💾 Save & Continue Later
            </button>
            <button v-if="isDoctor" class="order-tests-btn" @click="router.push(`/order-tests/${patientId}`)">
              🧪 Order Tests
            </button>
          </div>
        </div>



      </div>
    </template>
  </MainLayout>

  <QuickFillModal
    v-if="showQuickFill"
    @apply="applyQuickFill"
    @close="showQuickFill = false"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { jsPDF } from "jspdf";
import { getTemplates, saveTemplateConsultation } from "@/api/template";
import { api } from "@/api/api.js";
import { formsConfig } from "./consultation/formsConfig.js";

import MainLayout from "@/components/MainLayout.vue";
import TemplateRenderer from "@/components/templates/TemplateRenderer.vue";
import QuickFillModal from "@/components/QuickFillModal.vue";

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
const saved = ref(false);
const error = ref("");


const allForms = ref({});
const currentFormData = ref({});
const showQuickFill = ref(false);
const quickFillKey = ref(0);

// Authentication & Profile Parsing
const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
const isDoctor = storedUser.role === 'doctor';
const doctorName = storedUser.firstName && storedUser.lastName
  ? `Dr. ${storedUser.firstName} ${storedUser.lastName}`
  : storedUser.username || '';



// -------------------------------------------------------------
// DYNAMIC WORKFLOW & BUILDER LOGIC
// -------------------------------------------------------------
const mandatoryTemplates = computed(() => serverTemplates.value.filter(t => t.isMandatory === true));
const optionalTemplates = computed(() => serverTemplates.value.filter(t => t.isMandatory === false));

const currentTemplate = computed(() => workflowTemplates.value[currentIndex.value]);
const isLastPage = computed(() => currentIndex.value === workflowTemplates.value.length - 1);
const planStepNumber = computed(() => mandatoryTemplates.value.length + 1);
const isInPlanOptions = computed(() =>
  showBuilder.value || currentIndex.value >= mandatoryTemplates.value.length
);
const selectedPlanSteps = computed(() =>
  workflowTemplates.value.slice(mandatoryTemplates.value.length)
);
const consultationPhaseItems = computed(() => [
  ...mandatoryTemplates.value.map((template, index) => ({
    id: template.id,
    name: template.name,
    number: index + 1,
    active: !showBuilder.value && currentIndex.value === index,
    complete: showBuilder.value || currentIndex.value > index
  })),
  {
    id: "plan-options",
    name: "Plan & Options",
    number: planStepNumber.value,
    active: isInPlanOptions.value,
    complete: false
  }
]);
const currentStepNumber = computed(() =>
  isInPlanOptions.value ? planStepNumber.value : currentIndex.value + 1
);
const totalStepCount = computed(() => planStepNumber.value);
const pageTitle = computed(() =>
  isInPlanOptions.value ? "Plan & Options" : "Patient Examination"
);
const currentPhaseSubtitle = computed(() => {
  if (showBuilder.value) {
    return "Choose the additional care actions for this visit.";
  }

  if (isInPlanOptions.value) {
    return currentTemplate.value?.name
      ? `Complete ${currentTemplate.value.name} as part of step 4.`
      : "";
  }

  return currentTemplate.value?.name || "";
});
const currentOptionalPosition = computed(() => {
  const optionIndex = currentIndex.value - mandatoryTemplates.value.length + 1;
  const optionTotal = selectedPlanSteps.value.length;

  if (optionTotal <= 0 || optionIndex < 1) {
    return "No options selected";
  }

  return `Option ${optionIndex} of ${optionTotal}`;
});
const optionalDescriptions = {
  mental_health: "Mood, stress, sleep, and support.",
  prescribe_medication: "Prescriptions and interaction checks.",
  clinical_assessment: "Working diagnosis and severity.",
  diagnostic_orders: "Labs, imaging, or other tests.",
  surgery_request: "Procedure request and urgency.",
  referral_request: "Specialist or service referral.",
  patient_instructions: "Home care and return precautions.",
  follow_up_plan: "Timeline and monitoring plan.",
  clinical_notes: "Additional care-team notes."
};
const optionalTemplateGroups = computed(() => {
  const groups = [
    { name: "Assessment", ids: ["clinical_assessment", "mental_health"], templates: [] },
    { name: "Orders & Requests", ids: ["diagnostic_orders", "surgery_request", "referral_request"], templates: [] },
    { name: "Treatment & Follow-up", ids: ["prescribe_medication", "patient_instructions", "follow_up_plan"], templates: [] },
    { name: "Notes", ids: ["clinical_notes"], templates: [] }
  ];

  optionalTemplates.value.forEach(template => {
    const group = groups.find(item => item.ids.includes(template.id)) || groups[groups.length - 1];
    group.templates.push(template);
  });

  return groups.filter(group => group.templates.length > 0);
});
const getOptionalDescription = (templateId) =>
  optionalDescriptions[templateId] || "Additional visit form.";
const getOptionalDisplayNumber = (templateId) => {
  const index = optionalTemplates.value.findIndex(template => template.id === templateId);
  return `${planStepNumber.value}.${index + 1}`;
};
const syncCurrentForm = () => {
  if (!currentTemplate.value) return;

  allForms.value = {
    ...allForms.value,

    [currentTemplate.value.id]: {
      ...currentFormData.value
    }
  };
};

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
    currentIndex.value = workflowTemplates.value.length - 1;
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
  [currentTemplate],
  () => {
    if (!currentTemplate.value) return;

    // 1. Get the existing data from allForms
    const savedData = allForms.value[currentTemplate.value.id] || {};

    // 2. Get the defaults from formsConfig
    const defaults = currentInitialData.value;

    // 3. Merge them: Defaults first, then override with saved data
    currentFormData.value = {
      ...defaults,
      ...savedData
    };
  },
  { immediate: true }
);

// Patient loads AFTER templates, so the initial watch above runs with patient = null.
// When patient finishes loading, re-sync the current form so allergies and
// current medications auto-populate from executiveSummary.
watch(patient, (newPatient, oldPatient) => {
  if (!newPatient || oldPatient) return; // only fire once on initial load
  if (!currentTemplate.value) return;

  const savedData = allForms.value[currentTemplate.value.id] || {};
  const defaults = currentInitialData.value; // patient is now available
  currentFormData.value = { ...defaults, ...savedData };
  quickFillKey.value++; // force TemplateRenderer to remount with patient data
});

const canGoNext = computed(() =>
  formsConfig.validateStep(currentTemplate.value, currentFormData.value)
);

function updateFormData(data) {
  currentFormData.value = { ...data };
}

function nextTemplate() {
  if (!canGoNext.value) return;
  syncCurrentForm();

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
  syncCurrentForm();

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
  syncCurrentForm();
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
  syncCurrentForm();

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
    saved.value = true;
  } catch (err) {
    error.value = err?.response?.data?.message || err?.response?.data?.error || "Unable to save consultation.";
  } finally {
    isSaving.value = false;
  }
}

function downloadSOAPPdf() {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const W = 215.9;
  const margin = 18;
  let y = 20;

  const green     = [46, 125, 50];
  const darkGreen = [16, 35, 11];
  const lightGray = [245, 245, 245];
  const midGray   = [180, 180, 180];
  const textDark  = [30, 30, 30];

  // Header bar
  doc.setFillColor(...green);
  doc.rect(0, 0, W, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('VIEW OF THE BAY CLINIC', margin, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Consultation Summary & SOAP Note', margin, 20);
  const todayStr = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Date: ${todayStr}`, W - margin, 20, { align: 'right' });
  y = 36;

  // Patient / Doctor info box
  const patientName = patient.value
    ? `${patient.value.firstName} ${patient.value.lastName}`
    : 'Unknown Patient';
  const patientDob = patient.value?.dateOfBirth
    ? new Date(patient.value.dateOfBirth).toLocaleDateString()
    : null;

  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, y, W - margin * 2, 22, 3, 3, 'F');
  doc.setTextColor(...textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PATIENT', margin + 4, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(patientName, margin + 4, y + 14);
  if (patientDob) {
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`DOB: ${patientDob}`, margin + 4, y + 20);
  }
  const midX = W / 2 + 4;
  doc.setTextColor(...textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PHYSICIAN', midX, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(doctorName || 'Attending Physician', midX, y + 14);
  y += 30;

  // Divider
  doc.setDrawColor(...midGray);
  doc.setLineWidth(0.3);
  doc.line(margin, y, W - margin, y);
  y += 8;

  const PAGE_H = 270;

  const sections = [
    { label: 'S — Subjective', content: soapNote.value.subjective || 'No subjective data entered.' },
    { label: 'O — Objective',  content: soapNote.value.objective  || 'No objective data entered.' },
    { label: 'A — Assessment', content: soapNote.value.assessment || 'No assessment entered.' },
    { label: 'P — Plan',       content: soapNote.value.plan       || 'No plan entered.' },
  ];

  sections.forEach(({ label, content }) => {
    // Section header
    if (y + 14 > PAGE_H) { doc.addPage(); y = 20; }
    doc.setFillColor(...darkGreen);
    doc.rect(margin, y, W - margin * 2, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(label.toUpperCase(), margin + 4, y + 6.2);
    y += 12;

    // Content — split by newline, wrap each line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textDark);
    const lines = content.split('\n');
    lines.forEach(line => {
      const wrapped = doc.splitTextToSize(line || ' ', W - margin * 2 - 8);
      wrapped.forEach(wl => {
        if (y + 6 > PAGE_H) { doc.addPage(); y = 20; }
        doc.text(wl, margin + 4, y);
        y += 6;
      });
    });
    y += 6;
  });

  // Footer
  if (y + 20 > PAGE_H) { doc.addPage(); y = 20; }
  doc.setDrawColor(...midGray);
  doc.setLineWidth(0.3);
  doc.line(margin, y, W - margin, y);
  y += 8;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'Generated by ClinicOS · View of the Bay Clinic · For authorized medical use only',
    W / 2, y, { align: 'center' }
  );

  const safeName = patientName.replace(/\s+/g, '_');
  doc.save(`soap_summary_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

function applyQuickFill(template) {
  // Merge the template fills into allForms without overwriting unrelated fields
  Object.entries(template.fills).forEach(([formId, fills]) => {
    allForms.value[formId] = { ...(allForms.value[formId] || {}), ...fills };
  });

  // Pre-check prescribe_medication in the builder so it's already selected when
  // the Plan & Options page appears. Do NOT add it to workflowTemplates directly
  // or set hasSeenBuilder — the builder must still show so the doctor can confirm.
  // Exception: if the doctor has already been through the builder and
  // prescribe_medication is already in the workflow, we just fill in the data.
  if (hasSeenBuilder.value) {
    // Builder already passed — add to workflow if not present
    if (!workflowTemplates.value.find(t => t.id === 'prescribe_medication')) {
      const prescribeTemplate = optionalTemplates.value.find(t => t.id === 'prescribe_medication');
      if (prescribeTemplate) {
        selectedOptionalIds.value = [...new Set([...selectedOptionalIds.value, 'prescribe_medication'])];
        workflowTemplates.value = [...workflowTemplates.value, prescribeTemplate];
      }
    }
  } else {
    // Builder not yet shown — just pre-select so it's checked when builder opens
    if (!selectedOptionalIds.value.includes('prescribe_medication')) {
      selectedOptionalIds.value.push('prescribe_medication');
    }
  }

  // Force TemplateRenderer to remount so it re-reads the updated initialData
  quickFillKey.value++;
  showQuickFill.value = false;
}

onMounted(async () => {
  await loadTemplates();
  await loadPatient();
  try {
    await api.startWaitingRoomConsultation(patientId);
  } catch (err) {
    console.error("Failed to update waiting room status:", err);
  }
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

.option-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}

.option-card {
  display: grid;
  grid-template-columns: auto 38px 1fr;
  align-items: center;
  gap: 12px;
  min-height: 78px;
  padding: 14px;
  border: 2px solid #dce7e0;
  border-radius: 8px;
  background: #fbfdf9;
  cursor: pointer;
}

.option-card:has(input:checked) {
  border-color: #2d6a4f;
  background: #eef7f1;
}

.option-card input {
  width: 18px;
  height: 18px;
}

.option-card-number {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #2d6a4f;
  color: white;
  font-size: 13px;
  font-weight: 800;
}

.option-card strong,
.option-card small {
  display: block;
}

.option-card strong {
  color: #10231b;
  font-size: 15px;
}

.option-card small {
  margin-top: 4px;
  color: #5f6f66;
  font-size: 12px;
  line-height: 1.35;
}

.selected-actions-strip {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #f8fdf9;
  border: 2px solid #b7dfc8;
  color: #1e4d38;
}

.selected-actions-strip span {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.selected-actions-strip strong {
  font-size: 14px;
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

.save-success {
  width: 100%;
  margin-top: 24px;
  padding: 32px 24px;
  background: #f0faf3;
  border: 1px solid #a3d9b1;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
}

.save-success-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #2d6a4f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
}

.save-success-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #10231b;
}

.save-success-sub {
  margin: 0;
  font-size: 13px;
  color: #4a7c60;
}

.save-success-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.download-pdf-btn {
  padding: 11px 22px;
  border: 2px solid #2d6a4f;
  border-radius: 10px;
  background: white;
  color: #2d6a4f;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.download-pdf-btn:hover {
  background: #2d6a4f;
  color: white;
}

.go-record-btn {
  padding: 11px 22px;
  border: none;
  border-radius: 10px;
  background: #2d6a4f;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.go-record-btn:hover {
  background: #1e4d38;
}

.quick-fill-btn {
  border: 2px solid #7c3aed;
  background: white;
  color: #7c3aed;
  padding: 14px 34px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-fill-btn:hover {
  background: #7c3aed;
  color: white;
  transform: translateY(-1px);
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