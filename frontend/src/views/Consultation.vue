<template>
  <MainLayout title="Patient Consultation">
    <div v-if="isAdmin" class="access-denied">
      <h2>Access Denied</h2>
      <p>Administrators cannot perform clinical consultations.</p>
    </div>

    <div v-else class="consultation-wrapper">
      <el-card shadow="never" class="stepper-card">
        <el-steps :active="currentStep - 1" finish-status="success" align-center>
          <el-step
            v-for="(step, index) in consultationConfig"
            :key="index"
            :title="step.title"
            :description="step.description"
          />
        </el-steps>
      </el-card>

      <el-card shadow="never" class="content-card">
        <el-form label-position="top" :model="formData">
          <div class="step-pane">
            <h2>{{ currentStepConfig.title }}</h2>
            <p class="step-description">{{ currentStepConfig.description }}</p>

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
          </div>
        </el-form>

        <div class="navigation-buttons">
          <el-button @click="prevStep" :disabled="currentStep === 1">
            Previous
          </el-button>

          <div class="right-buttons">
            <el-button
              v-if="currentStep < consultationConfig.length"
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
  </MainLayout>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import MainLayout from "../components/MainLayout.vue";
import { consultationsApi } from "../api/consultations";

const route = useRoute();
const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
const userRole = storedUser.role?.toLowerCase();
const isAdmin = computed(() => userRole === "admin");
const patientId = computed(() => route.params.patientId || route.query.patientId);

const consultationConfig = [
  {
    title: "Symptoms",
    description: "Gather patient history and complaints.",
    fields: [
      {
        type: "multi-select",
        modelKey: "reportedSymptoms",
        label: "Reported Symptoms",
        options: ["Cough", "Fever", "Headache", "Sore Throat", "Fatigue", "Nausea"],
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
        placeholder: "Describe the onset and duration of symptoms...",
        rows: 5,
      },
    ],
  },
  {
    title: "Vitals",
    description: "Record vitals and physical findings.",
    fields: [
      { type: "number-input", modelKey: "systolicBP", label: "Systolic BP", span: 12 },
      { type: "number-input", modelKey: "diastolicBP", label: "Diastolic BP", span: 12 },
      { type: "number-input", modelKey: "temperature", label: "Temperature (C)", span: 12 },
      { type: "number-input", modelKey: "heartRate", label: "Heart Rate (bpm)", span: 12 },
      { type: "textarea", modelKey: "physicalFindings", label: "Physical Findings", rows: 4 },
    ],
  },
  {
    title: "Diagnose/Prescribe",
    description: "Record diagnosis and prescriptions.",
    fields: [
      {
        type: "text-input",
        modelKey: "diagnosis",
        label: "Primary Diagnosis",
        placeholder: "e.g., Acute Pharyngitis",
      },
      { type: "textarea", modelKey: "prescriptions", label: "Prescriptions", rows: 3 },
    ],
  },
  {
    title: "Plan",
    description: "Finalize treatment plan and follow-up.",
    fields: [
      { type: "textarea", modelKey: "plan", label: "Treatment Plan & Follow-up", rows: 3 },
    ],
  },
];

const currentStep = ref(1);
const formData = ref({});
const isSubmitting = ref(false);
const error = ref("");

const currentStepConfig = computed(() => consultationConfig[currentStep.value - 1]);

const nextStep = () => {
  if (currentStep.value < consultationConfig.length) currentStep.value++;
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
      formData: formData.value,
    });

    const consultationId = createResult?.consultation?._id;

    if (consultationId) {
      await consultationsApi.saveTreatmentPlan(consultationId, {
        diagnosis: formData.value.diagnosis,
        prescriptions: formData.value.prescriptions,
        plan: formData.value.plan,
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
.consultation-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stepper-card {
  padding: 10px 0;
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

.step-description {
  color: #666;
  margin-bottom: 30px;
  font-size: 0.95rem;
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
</style>
