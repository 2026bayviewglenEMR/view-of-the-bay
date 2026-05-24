<template>
  <MainLayout>
    <div class="patient-list-page">
      <h1>Patients</h1>
      <div class="patient-list">
        <div
          v-for="patient in patients"
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
        <p v-if="patients.length === 0">No patients found.</p>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../components/MainLayout.vue'
import { api } from '../api/api.js'

const router = useRouter()
const patients = ref([])

const goToPatient = (id) => {
  router.push(`/patients/${id}`)
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
</style>