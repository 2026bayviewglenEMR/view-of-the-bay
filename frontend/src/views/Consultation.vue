<template>
  <MainLayout title="Patient Consultation">
    <div v-if="isAdmin" class="access-denied">
      <h2>Access Denied</h2>
      <p>Administrators cannot perform clinical consultations.</p>
    </div>

    <div v-else class="consultation-outer">
      <div class="consultation-wrapper">
        <el-card shadow="never" class="stepper-card">
          <el-steps :active="currentStep - 1" finish-status="success" align-center>
            <el-step
              v-for="(step, index) in numberedConsultationSteps"
              :key="index"
              :title="step.title"
              :description="step.description"
            />
          </el-steps>
        </el-card>

        <el-card shadow="never" class="content-card">
          <el-form label-position="top" :model="formData">
            <div class="step-pane">
              <p class="step-count">Step {{ currentStep }} of {{ consultationSteps.length }}</p>
              <h2>{{ currentStepConfig.title }}</h2>
              <p class="step-description">{{ currentStepConfig.description }}</p>

              <div v-if="currentStepConfig.key === 'chooseNextSteps'" class="step-choice-panel">
                <el-checkbox-group v-model="selectedActionKeys" class="step-choice-grid">
                  <el-checkbox
                    v-for="step in optionalActionSteps"
                    :key="step.key"
                    :label="step.key"
                    border
                  >
                    <strong>{{ step.title }}</strong>
                    <span>{{ step.description }}</span>
                  </el-checkbox>
                </el-checkbox-group>
              </div>

              <el-row :gutter="20">
                <el-col
                  v-for="field in currentStepConfig.fields"
                  :key="field.modelKey"
                  :span="field.span || 24"
                >
                  <el-form-item :label="field.label">
                    <el-input
                      v-if="field.type === 'text-input'"
                      v-model="formData[field.modelKey]"
                      :placeholder="field.placeholder"
                    />

                    <el-input
                      v-else-if="field.type === 'textarea'"
                      v-model="formData[field.modelKey]"
                      type="textarea"
                      :rows="field.rows || 4"
                      :placeholder="field.placeholder"
                    />

                    <el-input-number
                      v-else-if="field.type === 'number-input'"
                      v-model="formData[field.modelKey]"
                      :min="field.min"
                      :max="field.max"
                      style="width: 100%"
                    />

                    <el-select
                      v-else-if="field.type === 'multi-select'"
                      v-model="formData[field.modelKey]"
                      multiple
                      placeholder="Select all that apply"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="opt in field.options"
                        :key="opt"
                        :label="opt"
                        :value="opt"
                      />
                    </el-select>

                    <el-select
                      v-else-if="field.type === 'single-select'"
                      v-model="formData[field.modelKey]"
                      :placeholder="field.placeholder || 'Select an option'"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="opt in field.options"
                        :key="opt"
                        :label="opt"
                        :value="opt"
                      />
                    </el-select>

                    <div v-else-if="field.type === 'scale'" class="scale-wrapper">
                      <el-slider
                        v-model="formData[field.modelKey]"
                        :min="field.min || 0"
                        :max="field.max || 10"
                        show-stops
                      />
                      <div class="scale-labels">
                        <span>{{ field.minLabel || "Min" }}</span>
                        <span>{{ field.maxLabel || "Max" }}</span>
                      </div>
                    </div>

                    <div v-else-if="field.type === 'draw'" class="draw-canvas-placeholder">
                      <span class="icon">Draw</span>
                      <p>Interactive Drawing Canvas Area</p>
                      <small>
                        Save the image base64 to formData.{{ field.modelKey }}
                      </small>
                      <el-button size="small" plain style="margin-top: 10px;">
                        Clear Canvas
                      </el-button>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>

              <div v-if="currentStepConfig.key === 'complete'" class="soap-preview">
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

              <div
                v-if="currentStepConfig.key === 'prescribeMedication' && prescriptionTemplate"
                class="prescription-template"
              >
                <TemplateRenderer
                  :template="prescriptionTemplate"
                  :initialData="prescriptionData"
                  @update="updatePrescriptionData"
                />
              </div>
            </div>
          </el-form>

          <div class="navigation-buttons">
            <el-button @click="prevStep" :disabled="currentStep === 1">
              Previous
            </el-button>

            <div class="right-buttons">
              <el-button
                v-if="currentStep < consultationSteps.length"
                type="primary"
                @click="nextStep"
              >
                Next Step
              </el-button>

              <el-button
                v-else
                type="success"
                :loading="isSubmitting"
                @click="submitConsultation"
              >
                Save & Complete Visit
              </el-button>
            </div>
          </div>
        </el-card>

        <p v-if="error" class="error-message">
          {{ error }}
        </p>
      </div>

      <div class="patient-panel" v-if="patient">
        <h2 class="panel-title">Patient Summary</h2>
        <div class="panel-section">
          <div class="patient-name">{{ patient.firstName }} {{ patient.lastName }}</div>
          <div class="patient-meta" v-if="patient.dateOfBirth">
            DOB: {{ new Date(patient.dateOfBirth).toLocaleDateString() }}
          </div>
          <div class="patient-meta" v-if="patient.gender">Gender: {{ patient.gender }}</div>
        </div>
        <div class="panel-section">
          <h3 class="panel-section-title">Allergies</h3>
          <ul class="panel-list" v-if="patient.executiveSummary?.allergies?.length">
            <li
              v-for="allergy in patient.executiveSummary.allergies"
              :key="allergy"
              class="allergy-item"
            >
              {{ allergy }}
            </li>
          </ul>
          <p class="panel-empty" v-else>None listed</p>
        </div>
        <div class="panel-section">
          <h3 class="panel-section-title">Medications</h3>
          <ul class="panel-list" v-if="patient.executiveSummary?.activeMedications?.length">
            <li v-for="med in patient.executiveSummary.activeMedications" :key="med.name">
              {{ med.name }} {{ med.dosage }}
            </li>
          </ul>
          <p class="panel-empty" v-else>None listed</p>
        </div>
        <div class="panel-section" v-if="patient.clinicalHistory?.conditions?.length">
          <h3 class="panel-section-title">Conditions</h3>
          <ul class="panel-list">
            <li v-for="condition in patient.clinicalHistory.conditions" :key="condition">
              {{ condition }}
            </li>
          </ul>
        </div>
        <div class="panel-section" v-if="patient.clinicalHistory?.surgeries?.length">
          <h3 class="panel-section-title">Surgeries</h3>
          <ul class="panel-list">
            <li v-for="surgery in patient.clinicalHistory.surgeries" :key="surgery">
              {{ surgery }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import MainLayout from "../components/MainLayout.vue";
import TemplateRenderer from "../components/templates/TemplateRenderer.vue";
import { consultationsApi } from "../api/consultations";
import { getTemplates } from "../templates/templateSystem";
import { api } from "../api/api.js";

const route = useRoute();
const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
const userRole = storedUser.role?.toLowerCase();
const isAdmin = computed(() => userRole === "admin");
const patientId = computed(() => route.params.patientId || route.query.patientId);

const patient = ref(null);

const loadPatient = async () => {
  if (!patientId.value) return;

  try {
    patient.value = await api.getPatient(patientId.value);
    try {
      await api.startWaitingRoomConsultation(patientId.value);
    } catch (err) {
      console.error("Failed to update waiting room status:", err);
    }
  } catch (err) {
    console.error("Failed to load patient", err);
  }
};

loadPatient();

const requiredSteps = [
  {
    key: "symptoms",
    title: "Symptoms",
    description: "Start with complaint, duration, and patient history.",
    fields: [
      {
        type: "text-input",
        modelKey: "chiefComplaint",
        label: "Chief Complaint",
        placeholder: "e.g., Chest pain, persistent cough, abdominal pain",
      },
      {
        type: "text-input",
        modelKey: "symptomDuration",
        label: "Duration",
        placeholder: "e.g., 3 days, since this morning, 2 weeks",
      },
      {
        type: "multi-select",
        modelKey: "reportedSymptoms",
        label: "Reported Symptoms",
        options: [
          "Cough",
          "Fever",
          "Headache",
          "Sore Throat",
          "Fatigue",
          "Nausea",
          "Chest Pain",
          "Shortness of Breath",
          "Abdominal Pain",
          "Dizziness",
          "Rash",
          "Vomiting",
        ],
      },
      {
        type: "scale",
        modelKey: "painLevel",
        label: "Pain Level (1-10)",
        min: 1,
        max: 10,
        minLabel: "No Pain",
        maxLabel: "Severe Pain",
      },
      {
        type: "textarea",
        modelKey: "history",
        label: "Detailed History",
        placeholder: "Onset, progression, triggers, relieving factors, relevant history...",
        rows: 5,
      },
    ],
  },
  {
    key: "physicalExam",
    title: "Physical Exam",
    description: "Record vitals and examination findings.",
    fields: [
      { type: "number-input", modelKey: "systolicBP", label: "Systolic BP", span: 12 },
      { type: "number-input", modelKey: "diastolicBP", label: "Diastolic BP", span: 12 },
      { type: "number-input", modelKey: "temperature", label: "Temperature (C)", span: 12 },
      { type: "number-input", modelKey: "heartRate", label: "Heart Rate (bpm)", span: 12 },
      { type: "number-input", modelKey: "respiratoryRate", label: "Respiratory Rate", span: 12 },
      { type: "number-input", modelKey: "oxygenSaturation", label: "Oxygen Saturation (%)", span: 12 },
      {
        type: "textarea",
        modelKey: "physicalFindings",
        label: "Physical Examination Findings",
        rows: 5,
      },
    ],
  },
  {
    key: "chooseNextSteps",
    title: "Choose Care Path",
    description: "Select the next clinical actions for this visit.",
    fields: [],
  },
];

const optionalActionSteps = [
  {
    key: "assessment",
    title: "Assessment",
    description: "Diagnosis and clinical impression.",
    fields: [
      {
        type: "text-input",
        modelKey: "workingDiagnosis",
        label: "Working Diagnosis",
        placeholder: "e.g., Acute Pharyngitis",
      },
      {
        type: "textarea",
        modelKey: "differentialDiagnosis",
        label: "Differential Diagnosis",
        rows: 3,
      },
    ],
  },
  {
    key: "orderTests",
    title: "Order Tests",
    description: "Labs, imaging, or diagnostic studies.",
    fields: [
      {
        type: "text-input",
        modelKey: "testOrderTitle",
        label: "Order Title",
        placeholder: "e.g., Chest X-ray and CBC",
      },
      {
        type: "single-select",
        modelKey: "testType",
        label: "Test Type",
        options: ["Laboratory", "Imaging", "Pathology", "Cardiology", "Other"],
      },
      {
        type: "single-select",
        modelKey: "testPriority",
        label: "Priority",
        options: ["routine", "urgent", "stat"],
      },
      {
        type: "textarea",
        modelKey: "testInstructions",
        label: "Instructions / Clinical Question",
        rows: 4,
      },
    ],
  },
  {
    key: "prescribeMedication",
    title: "Prescribe Medication",
    description: "Medication, dosage, and interaction check.",
    fields: [],
  },
  {
    key: "surgeryRequest",
    title: "Surgery Request",
    description: "Procedure request or surgical consult.",
    fields: [
      {
        type: "text-input",
        modelKey: "surgeryProcedure",
        label: "Procedure / Service",
        placeholder: "e.g., Appendectomy consult, wound debridement",
      },
      {
        type: "single-select",
        modelKey: "surgeryUrgency",
        label: "Urgency",
        options: ["elective", "semi-urgent", "urgent", "emergency"],
      },
      {
        type: "textarea",
        modelKey: "surgeryReason",
        label: "Reason / Relevant Findings",
        rows: 4,
      },
    ],
  },
  {
    key: "referral",
    title: "Referral",
    description: "Specialist or allied health referral.",
    fields: [
      {
        type: "text-input",
        modelKey: "referralTo",
        label: "Refer To",
        placeholder: "e.g., Cardiology, physiotherapy, dermatology",
      },
      {
        type: "textarea",
        modelKey: "referralReason",
        label: "Referral Reason",
        rows: 4,
      },
    ],
  },
  {
    key: "patientInstructions",
    title: "Instructions",
    description: "Patient education and home care.",
    fields: [
      {
        type: "textarea",
        modelKey: "patientInstructions",
        label: "Patient Instructions",
        rows: 5,
      },
    ],
  },
  {
    key: "followUp",
    title: "Follow-up",
    description: "Timeline and return precautions.",
    fields: [
      {
        type: "text-input",
        modelKey: "followUpTimeline",
        label: "Follow-up Timeline",
        placeholder: "e.g., 1 week, 48 hours, after results return",
      },
      {
        type: "textarea",
        modelKey: "returnPrecautions",
        label: "Return Precautions",
        rows: 4,
      },
    ],
  },
  {
    key: "clinicalNotes",
    title: "Clinical Notes",
    description: "Additional notes for the record.",
    fields: [
      { type: "textarea", modelKey: "additionalNotes", label: "Additional Notes", rows: 5 },
    ],
  },
];

const finalStep = {
  key: "complete",
  title: "Complete",
  description: "Review and save the visit.",
  fields: [
    {
      type: "textarea",
      modelKey: "plan",
      label: "Final Treatment Plan",
      rows: 5,
    },
  ],
};

const currentStep = ref(1);
const selectedActionKeys = ref(["assessment"]);
const formData = ref({});
const prescriptionData = ref({});
const isSubmitting = ref(false);
const error = ref("");

const consultationSteps = computed(() => [
  ...requiredSteps,
  ...optionalActionSteps.filter((step) => selectedActionKeys.value.includes(step.key)),
  finalStep,
]);
const numberedConsultationSteps = computed(() =>
  consultationSteps.value.map((step, index) => ({
    ...step,
    title: `${index + 1}. ${step.title}`,
  }))
);

const currentStepConfig = computed(() => {
  return consultationSteps.value[currentStep.value - 1] || finalStep;
});

const selectedStepTitles = computed(() =>
  consultationSteps.value.map((step) => step.title).join(", ")
);

const testOrderDocuments = computed(() => {
  if (!selectedActionKeys.value.includes("orderTests")) {
    return [];
  }

  if (!formData.value.testOrderTitle || !formData.value.testType) {
    return [];
  }

  return [
    {
      title: formData.value.testOrderTitle,
      testType: formData.value.testType,
      priority: formData.value.testPriority || "routine",
      instructions: formData.value.testInstructions || "",
      documentText: [
        formData.value.testOrderTitle,
        formData.value.testInstructions,
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
  ];
});

const treatmentPlanSummary = computed(() =>
  [
    formData.value.plan,
    formData.value.patientInstructions
      ? `Patient instructions: ${formData.value.patientInstructions}`
      : "",
    formData.value.followUpTimeline
      ? `Follow-up: ${formData.value.followUpTimeline}`
      : "",
    formData.value.returnPrecautions
      ? `Return precautions: ${formData.value.returnPrecautions}`
      : "",
    formData.value.surgeryProcedure
      ? `Surgery request: ${formData.value.surgeryProcedure} (${formData.value.surgeryUrgency || "not specified"})`
      : "",
    formData.value.referralTo ? `Referral: ${formData.value.referralTo}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
);

const prescriptionTemplate = computed(() =>
  getTemplates().find((template) => template.id === "prescribe_medication")
);

const prescriptionSummary = computed(() => {
  const data = prescriptionData.value;

  return [
    data.medication ? `Medication: ${data.medication}` : "",
    data.dosage ? `Dosage: ${data.dosage}` : "",
    data.frequency ? `Frequency: ${data.frequency}` : "",
    data.instructions ? `Instructions: ${data.instructions}` : "",
    data.drug_interactions ? `Drug Interactions:\n${data.drug_interactions}` : "",
  ]
    .filter(Boolean)
    .join("\n");
});

const prescribedMedications = computed(() => {
  if (!prescriptionData.value.medication) {
    return [];
  }

  return [
    {
      medicationName: prescriptionData.value.medication,
      dosage: prescriptionData.value.dosage || "",
      instructions: [
        prescriptionData.value.frequency,
        prescriptionData.value.instructions,
        prescriptionData.value.drug_interactions,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];
});

const updatePrescriptionData = (data) => {
  prescriptionData.value = { ...data };
  formData.value.prescriptionData = { ...data };
  formData.value.prescriptions = prescriptionSummary.value;
};

const soapNote = computed(() => {
  const f = formData.value;

  const vitals = [
    f.systolicBP && f.diastolicBP ? `BP: ${f.systolicBP}/${f.diastolicBP} mmHg` : null,
    f.heartRate ? `HR: ${f.heartRate} bpm` : null,
    f.temperature ? `Temp: ${f.temperature}°C` : null,
    f.respiratoryRate ? `RR: ${f.respiratoryRate} breaths/min` : null,
    f.oxygenSaturation ? `O2 Sat: ${f.oxygenSaturation}%` : null,
  ].filter(Boolean).join(' · ');

  return {
    subjective: [
      f.chiefComplaint ? `Chief complaint: ${f.chiefComplaint}` : null,
      f.symptomDuration ? `Duration: ${f.symptomDuration}` : null,
      f.reportedSymptoms?.length ? `Symptoms: ${f.reportedSymptoms.join(', ')}` : null,
      f.painLevel !== undefined ? `Pain level: ${f.painLevel}/10` : null,
      f.history ? `History: ${f.history}` : null,
    ].filter(Boolean).join('\n'),

    objective: [
      vitals || null,
      f.physicalFindings ? `Findings: ${f.physicalFindings}` : null,
    ].filter(Boolean).join('\n'),

    assessment: [
      f.workingDiagnosis ? `Diagnosis: ${f.workingDiagnosis}` : null,
      f.differentialDiagnosis ? `Differential: ${f.differentialDiagnosis}` : null,
    ].filter(Boolean).join('\n'),

    plan: [
      f.plan || null,
      f.patientInstructions ? `Instructions: ${f.patientInstructions}` : null,
      f.followUpTimeline ? `Follow-up: ${f.followUpTimeline}` : null,
      f.returnPrecautions ? `Return precautions: ${f.returnPrecautions}` : null,
      f.referralTo ? `Referral: ${f.referralTo}` : null,
      f.surgeryProcedure ? `Surgery: ${f.surgeryProcedure} (${f.surgeryUrgency || 'unspecified'})` : null,
      prescriptionSummary.value ? `Medication: ${prescriptionSummary.value}` : null,
    ].filter(Boolean).join('\n'),
  };
});

const nextStep = () => {
  formData.value.selectedConsultationSteps = [...selectedActionKeys.value];
  if (currentStep.value < consultationSteps.value.length) currentStep.value++;
};

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

const submitConsultation = async () => {
  if (!patientId.value) {
    error.value = "Missing patient id for this consultation.";
    return;
  }

  isSubmitting.value = true;
  error.value = "";

  try {
    const createResult = await consultationsApi.createConsultation({
      patientId: patientId.value,
      formData: {
        ...formData.value,
        selectedConsultationSteps: selectedActionKeys.value,
        completedStepTitles: selectedStepTitles.value,
        soapNote: soapNote.value,
      },
      prescriptions: prescribedMedications.value,
      testOrderDocuments: testOrderDocuments.value,
      templateForms: {
        prescribe_medication: prescriptionData.value,
      },
    });

    const consultationId = createResult?.consultation?._id;

    if (consultationId) {
      await consultationsApi.saveTreatmentPlan(consultationId, {
        diagnosis: formData.value.workingDiagnosis,
        prescriptions: prescriptionSummary.value,
        plan: treatmentPlanSummary.value,
        followUp: formData.value.followUpTimeline,
      });

      await consultationsApi.completeConsultation(consultationId);
    }

    alert("Consultation completed successfully.");
  } catch (err) {
    error.value =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Unable to complete consultation.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.consultation-outer {
  display: flex;
  flex-direction: row;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
}

.consultation-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.patient-panel {
  width: 220px;
  flex-shrink: 0;
  background: white;
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #2d6a4f;
  align-self: flex-start;
  position: sticky;
  top: 0;
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

.stepper-card {
  padding: 10px 0;
  overflow-x: auto;
}

.content-card {
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.step-pane h2 {
  margin-top: 0;
  margin-bottom: 5px;
  color: var(--color-text-1-dark, #333);
}

.step-count {
  margin: 0 0 8px;
  color: #2d6a4f;
  font-size: 14px;
  font-weight: 800;
}

.step-description {
  color: #666;
  margin-bottom: 30px;
  font-size: 0.95rem;
}

.step-choice-panel {
  margin-bottom: 28px;
}

.step-choice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.step-choice-grid :deep(.el-checkbox) {
  height: auto;
  min-height: 86px;
  margin: 0;
  padding: 14px;
  white-space: normal;
  align-items: flex-start;
}

.step-choice-grid :deep(.el-checkbox__label) {
  display: flex;
  flex-direction: column;
  gap: 6px;
  line-height: 1.35;
}

.step-choice-grid span {
  color: #666;
  font-weight: 400;
}

.scale-wrapper {
  width: 100%;
  padding: 0 10px;
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 0.85rem;
  margin-top: -5px;
}

.draw-canvas-placeholder {
  width: 100%;
  height: 250px;
  background-color: #f8f9fa;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.draw-canvas-placeholder .icon {
  font-size: 1rem;
  margin-bottom: 10px;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.access-denied {
  max-width: 720px;
  margin: 80px auto;
  padding: 40px;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #fff;
}

.access-denied h2 {
  margin-top: 0;
  color: #b91c1c;
}

.error-message {
  color: #b91c1c;
  font-weight: 700;
  margin-top: 16px;
}

.soap-preview {
  margin-top: 28px;
  padding: 20px;
  background: #f8fdf9;
  border: 1px solid #b7dfc8;
  border-radius: 10px;
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

.prescription-template {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.prescription-template :deep(.form) {
  width: 100%;
  padding: 0;
  box-shadow: none;
}
</style>
