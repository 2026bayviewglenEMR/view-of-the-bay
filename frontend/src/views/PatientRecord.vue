<template>
  <MainLayout>
    <div class="patient-record-page">
      <div class="patient-header">
        <div>
          <h1>{{ patient.name || 'Patient Record' }}</h1>
          <p v-if="patient.id">Patient ID: {{ patient.id }}</p>
        </div>

        <div class="action-buttons">
          <template v-if="role === 'doctor'">
            <button class="consultation-btn" @click="startConsultation">Start Consultation</button>
          </template>
        </div>
      </div>

      <div class="risk-banner-container">
        <div class="risk-banner critical">
          ⚠ Penicillin Allergy
        </div>

        <div class="risk-banner warning">
          ⚠ High Fall Risk
        </div>

        <div class="risk-banner info">
          ℹ Diabetic Patient
        </div>
      </div>

      <div class="patient-layout">
        <main class="main-content">
          <section class="card">
            <h2>Demographics</h2>
            <div class="grid">
              <p><strong>Date of Birth:</strong> {{ patient.dob || '—' }}</p>
              <p><strong>Gender:</strong> {{ patient.gender || '—' }}</p>
              <p><strong>Phone:</strong> {{ patient.phone || '—' }}</p>
              <p><strong>Address:</strong> {{ patient.address || '—' }}</p>
              <p><strong>Insurance:</strong> {{ patient.insurance || '—' }}</p>
            </div>
          </section>

          <section class="card">
            <h2>Clinical History</h2>
            <div v-if="role === 'admin'" class="readonly-note">
              Read-only for administrators
            </div>
            <p><strong>Conditions:</strong> {{ clinicalHistory.conditions || '—' }}</p>
            <p><strong>Surgeries:</strong> {{ clinicalHistory.surgeries || '—' }}</p>
            <p><strong>Family History:</strong> {{ clinicalHistory.familyHistory || '—' }}</p>
            <p><strong>Social History:</strong> {{ clinicalHistory.socialHistory || '—' }}</p>
          </section>

          <section class="card">
            <h2>Visit Timeline</h2>
            <div v-if="timeline.length">
              <div v-for="visit in timeline" :key="visit.id" class="timeline-item">
                <h3>{{ visit.date }} — {{ visit.reason }}</h3>
                <p><strong>Doctor:</strong> {{ visit.doctor }}</p>
                <p><strong>Diagnosis:</strong> {{ visit.diagnosis || '—' }}</p>
                <p><strong>Notes:</strong> {{ visit.notes || '—' }}</p>
              </div>
            </div>
            <p v-else>No visits yet.</p>
          </section>
        </main>

        <aside class="summary-panel card">
          <h2>Executive Summary</h2>

          <div class="summary-photo-wrap">
            <img
              v-if="patient.photo"
              :src="patient.photo"
              alt="Patient photo"
              class="summary-photo"
            />
            <div v-else class="photo-placeholder">No Photo</div>
          </div>

          <p><strong>Name:</strong> {{ patient.name || '—' }}</p>

          <div class="summary-section">
            <h3>Allergies</h3>
            <ul v-if="allergies.length">
              <li v-for="allergy in allergies" :key="allergy">{{ allergy }}</li>
            </ul>
            <p v-else>None listed</p>
          </div>

          <div class="summary-section">
            <h3>Active Medications</h3>
            <ul v-if="medications.length">
              <li v-for="med in medications" :key="med">{{ med }}</li>
            </ul>
            <p v-else>None listed</p>
          </div>
        </aside>
      </div>
    </div>
  </MainLayout>
</template>

<script>
import MainLayout from '../components/MainLayout.vue';
import { api } from '../api/api.js';

export default {
  name: 'PatientRecord',
  components: { MainLayout },
  data() {
    return {
      role: JSON.parse(localStorage.getItem('user'))?.role || 'doctor',
      patient: {
        id: '',
        name: '',
        dob: '',
        gender: '',
        phone: '',
        address: '',
        insurance: '',
        photo: ''
      },
      clinicalHistory: {
        conditions: '',
        surgeries: '',
        familyHistory: '',
        socialHistory: ''
      },
      allergies: [],
      medications: [],
      timeline: []
    }
  },
  async mounted() {
    const id = this.$route.params.id
    if (!id) return

    try {
      const patient = await api.getPatient(id)

      this.patient = {
        id: patient._id,
        name: `${patient.firstName} ${patient.lastName}`,
        dob: patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '—',
        gender: patient.gender || '—',
        phone: patient.demographics?.phone || '—',
        address: patient.demographics?.address || '—',
        insurance: patient.demographics?.insurance || '—',
        photo: patient.photoUrl || ''
      }

      this.clinicalHistory = {
        conditions: patient.clinicalHistory?.conditions?.join(', ') || '—',
        surgeries: patient.clinicalHistory?.surgeries?.join(', ') || '—',
        familyHistory: patient.clinicalHistory?.familyHistory || '—',
        socialHistory: patient.clinicalHistory?.socialHistory || '—'
      }

      this.allergies = patient.executiveSummary?.allergies || []
      this.medications = (patient.executiveSummary?.activeMedications || []).map(
        m => `${m.name} ${m.dosage}`
      )

      const encounters = await api.getPatientEncounters(id)
      this.timeline = encounters.map(e => ({
        id: e._id,
        date: new Date(e.createdAt).toLocaleDateString(),
        reason: e.reason || '—',
        doctor: e.doctorId?.firstName ? `Dr. ${e.doctorId.firstName} ${e.doctorId.lastName}` : '—',
        diagnosis: e.diagnosis || '—',
        notes: e.notes || '—'
      }))

    } catch (err) {
      console.error('Failed to load patient', err)
    }
  },
  methods: {
    startConsultation() {
      this.$router.push(`/consultation/${this.patient.id}`)
    }
  }
}
</script>

<style scoped>
.patient-record-page {
  padding: 24px;
}

.patient-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.consultation-btn {
  padding: 10px 24px;
  background-color: #2D6A4F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.consultation-btn:hover {
  background-color: #1e4d38;
  transform: translateY(-1px);
}

.patient-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.summary-panel {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.summary-photo-wrap {
  margin-bottom: 16px;
}

.summary-photo,
.photo-placeholder {
  width: 100%;
  max-width: 180px;
  height: 180px;
  border-radius: 12px;
  object-fit: cover;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-section {
  margin-top: 18px;
}

.timeline-item {
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.timeline-item:last-child {
  border-bottom: none;
}

.readonly-note {
  margin-bottom: 10px;
  color: #666;
  font-style: italic;
}

@media (max-width: 900px) {
  .patient-layout {
    grid-template-columns: 1fr;
  }

  .summary-panel {
    position: static;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>