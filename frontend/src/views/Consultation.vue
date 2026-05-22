<template>
    <MainLayout title="Patient Consultation">
        <div class="consultation-wrapper">
            
            <!-- 1. Dynamic Stepper -->
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

            <!-- 2. Dynamic Content Area -->
            <el-card shadow="never" class="content-card">
                <el-form label-position="top" :model="formData">
                    
                    <div class="step-pane">
                        <h2>{{ currentStepConfig.title }}</h2>
                        <p class="step-description">{{ currentStepConfig.description }}</p>
                        
                        <!-- The Grid System loops through the config fields -->
                        <el-row :gutter="20">
                            <el-col 
                                v-for="field in currentStepConfig.fields" 
                                :key="field.modelKey" 
                                :span="field.span || 24"
                            >
                                <el-form-item :label="field.label">
                                    
                                    <!-- TYPE: TEXT INPUT -->
                                    <el-input 
                                        v-if="field.type === 'text-input'" 
                                        v-model="formData[field.modelKey]" 
                                        :placeholder="field.placeholder" 
                                    />

                                    <!-- TYPE: TEXTAREA -->
                                    <el-input 
                                        v-else-if="field.type === 'textarea'" 
                                        type="textarea"
                                        :rows="field.rows || 4"
                                        v-model="formData[field.modelKey]" 
                                        :placeholder="field.placeholder" 
                                    />

                                    <!-- TYPE: NUMBER INPUT -->
                                    <el-input-number 
                                        v-else-if="field.type === 'number-input'" 
                                        v-model="formData[field.modelKey]" 
                                        :min="field.min" 
                                        :max="field.max"
                                        style="width: 100%"
                                    />

                                    <!-- TYPE: MULTI-SELECT -->
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

                                    <!-- TYPE: SCALE (Slider) -->
                                    <div v-else-if="field.type === 'scale'" class="scale-wrapper">
                                        <el-slider 
                                            v-model="formData[field.modelKey]" 
                                            :min="field.min || 0" 
                                            :max="field.max || 10" 
                                            show-stops
                                        />
                                        <div class="scale-labels">
                                            <span>{{ field.minLabel || 'Min' }}</span>
                                            <span>{{ field.maxLabel || 'Max' }}</span>
                                        </div>
                                    </div>

                                    <!-- TYPE: DRAW (Canvas Placeholder) -->
                                    <div v-else-if="field.type === 'draw'" class="draw-canvas-placeholder">
                                        <span class="icon">🖌️</span>
                                        <p>Interactive Drawing Canvas Area</p>
                                        <small>(Hook up a library like Fabric.js here, saving the image base64 to formData.{{field.modelKey}})</small>
                                        <el-button size="small" plain style="margin-top: 10px;">Clear Canvas</el-button>
                                    </div>

                                </el-form-item>
                            </el-col>
                        </el-row>
                    </div>

                </el-form>

                <!-- 3. Navigation Buttons -->
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
                            @click="submitConsultation"
                        >
                            Complete Consultation
                        </el-button>
                    </div>
                </div>
            </el-card>

        </div>
    </MainLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import MainLayout from '../components/MainLayout.vue';

// ==========================================
// 1. THE CONFIGURATION ENGINE
// This could easily be fetched from your database via Axios!
// ==========================================
const consultationConfig = [
    {
        title: 'Symptoms',
        description: 'Gather patient history and complaints.',
        fields: [
            { 
                type: 'multi-select', 
                modelKey: 'reportedSymptoms', 
                label: 'Reported Symptoms', 
                options: ['Cough', 'Fever', 'Headache', 'Sore Throat', 'Fatigue', 'Nausea'] 
            },
            { 
                type: 'scale', 
                modelKey: 'painLevel', 
                label: 'Pain Level (1-10)', 
                min: 1, 
                max: 10,
                minLabel: 'No Pain',
                maxLabel: 'Severe Pain'
            },
            { 
                type: 'textarea', 
                modelKey: 'history', 
                label: 'Detailed History', 
                placeholder: 'Describe the onset and duration of symptoms...',
                rows: 5
            }
        ]
    },
    {
        title: 'Examination',
        description: 'Record vitals and physical findings.',
        fields: [
            { type: 'number-input', modelKey: 'systolicBP', label: 'Systolic BP', span: 12 },
            { type: 'number-input', modelKey: 'diastolicBP', label: 'Diastolic BP', span: 12 },
            { type: 'number-input', modelKey: 'temperature', label: 'Temperature (°C)', span: 12 },
            { type: 'number-input', modelKey: 'heartRate', label: 'Heart Rate (bpm)', span: 12 },
            { type: 'textarea', modelKey: 'physicalFindings', label: 'Physical Findings', rows: 4 }
        ]
    },
    {
        title: 'Diagnose & Plan',
        description: 'Finalize the visit.',
        fields: [
            { type: 'text-input', modelKey: 'diagnosis', label: 'Primary Diagnosis', placeholder: 'e.g., Acute Pharyngitis' },
            { type: 'textarea', modelKey: 'prescriptions', label: 'Prescriptions', rows: 3 },
            { type: 'textarea', modelKey: 'plan', label: 'Treatment Plan & Follow-up', rows: 3 }
        ]
    }
];

// ==========================================
// 2. COMPONENT STATE & LOGIC
// ==========================================
const currentStep = ref(1);

// A single reactive object that stores all the data the user types/selects
const formData = ref({});

// Automatically grab the configuration for the step we are currently viewing
const currentStepConfig = computed(() => {
    return consultationConfig[currentStep.value - 1];
});

const nextStep = () => {
    if (currentStep.value < consultationConfig.length) currentStep.value++;
};

const prevStep = () => {
    if (currentStep.value > 1) currentStep.value--;
};

const submitConsultation = () => {
    console.log("Final payload ready for the database:", formData.value);
    alert("Consultation completed! Check the console to see the JSON payload.");
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

/* Custom UI for the Scale/Slider type */
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

/* Custom UI for the Draw type placeholder */
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
    font-size: 2rem;
    margin-bottom: 10px;
}

.navigation-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
}
</style>