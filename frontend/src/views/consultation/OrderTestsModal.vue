<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>🧪 Order Diagnostics & Laboratory Tests</h2>
      <p class="patient-sub">Patient: <strong>{{ patientName }}</strong> | DOB: {{ patientDob }}</p>

      <form @submit.prevent="handleSubmitOrder">
        <div class="form-group">
          <label>Select Lab Panel / Procedure</label>
          <select v-model="selectedTest" required>
            <option disabled value="">-- Choose a panel --</option>
            <option 
              v-for="test in testCatalog" 
              :key="test.id" 
              :value="test"
              :disabled="alreadyOrderedIds.includes(test.id)"
            >
              {{ test.name }} <span v-if="alreadyOrderedIds.includes(test.id)">(Already Pending)</span>
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Clinical Indications / Notes</label>
          <textarea 
            v-model="orderNotes" 
            placeholder="Provide context or instructions for laboratory technician..." 
            rows="3"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="$emit('close')">Cancel</button>
          <button type="submit" class="submit-btn" :disabled="isSubmitting || !selectedTest">
            {{ isSubmitting ? "Routing..." : "Authorize Order" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { api } from '@/api/api.js';

const props = defineProps({
  patientId: String,
  patientName: String,
  patientDob: String,
  doctorName: String,
  alreadyOrderedIds: Array
});

const emit = defineEmits(['close']);

const selectedTest = ref('');
const orderNotes = ref('');
const isSubmitting = ref(false);

const testCatalog = [
  { id: 'CBC_001', name: 'Complete Blood Count (CBC)' },
  { id: 'BMP_002', name: 'Basic Metabolic Panel (BMP)' },
  { id: 'TSH_003', name: 'Thyroid Stimulating Hormone (TSH)' }
];

async function handleSubmitOrder() {
  isSubmitting.value = true;
  try {
    await api.orderPatientTest(props.patientId, {
      testId: selectedTest.value.id,
      testName: selectedTest.value.name,
      orderedBy: props.doctorName,
      notes: orderNotes.value,
      orderedAt: new Date().toISOString()
    });
    emit('close');
  } catch (err) {
    alert("Failed to submit lab order.");
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 460px;
}
.patient-sub {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.form-group label {
  font-weight: bold;
}
.form-group select, .form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font: inherit;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.cancel-btn, .submit-btn {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.cancel-btn { border: 1px solid #ddd; background: white; }
.submit-btn { border: none; background: #2e7d32; color: white; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>