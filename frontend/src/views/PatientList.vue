<template>
  <MainLayout>
    <div class="patient-list-page">
      <div class="page-header">
        <h1>Patients</h1>
        <button class="add-patient-btn" @click="openAddPatientModal">
          + Add Patient
        </button>
      </div>

      <div class="patient-list">
        <div
          v-for="patient in filteredPatients"
          :key="patient._id"
          class="patient-card"
          @click="goToPatient(patient._id)"
        >
          <div class="patient-name">{{ patient.firstName }} {{ patient.lastName }}</div>
          <div class="patient-info">
            <span>DOB: {{ new Date(patient.dateOfBirth).toLocaleDateString() }}</span>
            <span>Phone: {{ patient.demographics?.phone || '—' }}</span>
          </div>
        </div>

        <p v-if="filteredPatients.length === 0">No patients found.</p>
      </div>

      <div v-if="showAddPatientModal" class="modal-overlay">
        <div class="modal-card">
          <h2>Add Patient</h2>

          <div class="modal-grid">
            <input v-model="newPatient.firstName" placeholder="First Name" />
            <input v-model="newPatient.lastName" placeholder="Last Name" />
            <input v-model="newPatient.dateOfBirth" type="date" />
            <input v-model="newPatient.gender" placeholder="Gender" />
            <input v-model="newPatient.phone" placeholder="Phone" />
            <input v-model="newPatient.address" placeholder="Address" />
            <input v-model="newPatient.insurance" placeholder="Insurance" />
          </div>

          <div class="modal-actions">
            <button @click="savePatient">Save Patient</button>
            <button class="secondary-modal-btn" @click="closeAddPatientModal">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MainLayout from '../components/MainLayout.vue'
import { api } from '../api/api.js'

const router = useRouter()
const route = useRoute()
const patients = ref([])
const showAddPatientModal = ref(false)

const newPatient = ref({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  address: '',
  insurance: ''
})

const searchQuery = computed(() => route.query.search || "")

const filteredPatients = computed(() => {
  if (!searchQuery.value) return patients.value
  const q = searchQuery.value.toLowerCase()
  return patients.value.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(q)
  )
})

const goToPatient = (id) => {
  router.push(`/patients/${id}`)
}

const openAddPatientModal = () => {
  showAddPatientModal.value = true
}

const closeAddPatientModal = () => {
  showAddPatientModal.value = false
}

const resetNewPatientForm = () => {
  newPatient.value = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
    insurance: ''
  }
}

const savePatient = async () => {
  try {
    const patientData = {
      firstName: newPatient.value.firstName,
      lastName: newPatient.value.lastName,
      dateOfBirth: newPatient.value.dateOfBirth,
      gender: newPatient.value.gender,
      demographics: {
        phone: newPatient.value.phone,
        address: newPatient.value.address,
        insurance: newPatient.value.insurance
      }
    }
    const createdPatient = await api.createPatient(patientData)
    patients.value.unshift(createdPatient)
    resetNewPatientForm()
    closeAddPatientModal()
  } catch (err) {
    console.error('Failed to create patient', err)
    alert(err?.response?.data?.message || 'Failed to create patient.')
  }
}

onMounted(async () => {
  try {
    patients.value = await api.getAllPatients()
  } catch (err) {
    console.error('Failed to load patients', err)
  }
})
</script>

<style scoped>
.patient-list-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.add-patient-btn {
  background: #2d6a4f;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-patient-btn:hover {
  background: #1e4d38;
  transform: translateY(-1px);
}

.patient-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.patient-card {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: all 0.2s ease;
}

.patient-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.patient-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 6px;
}

.patient-info {
  display: flex;
  gap: 24px;
  color: #666;
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-card {
  width: 600px;
  max-width: 90%;
  background: white;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.25);
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 20px 0;
}

.modal-grid input {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-actions button {
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.modal-actions button:first-child {
  background: #2d6a4f;
  color: white;
}

.secondary-modal-btn {
  background: #e5e7eb;
  color: #111827;
}

@media (max-width: 700px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .modal-grid {
    grid-template-columns: 1fr;
  }

  .patient-info {
    flex-direction: column;
    gap: 6px;
  }
}
</style>