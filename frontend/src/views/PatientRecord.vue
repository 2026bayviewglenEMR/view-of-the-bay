<template>
  <MainLayout>
    <div class="patient-record-page">
      <section v-if="accessDenied" class="card access-denied">
        <h1>Access Denied</h1>
        <p>You can only view your own patient record.</p>
      </section>

      <p v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

      <p v-else-if="isLoading" class="loading-message">
        Loading patient record...
      </p>

      <template v-else>
        <div class="patient-header">
          <div>
            <h1>{{ patient.name || "Patient Record" }}</h1>
            <p v-if="patient.id">Patient ID: {{ patient.id }}</p>
          </div>

          <div class="action-buttons">
            <template v-if="role === 'doctor'">
              <button class="consultation-btn" @click="startConsultation">
                Start Consultation
              </button>
              <button class="secondary-action-btn">Add Diagnosis</button>
              <button class="secondary-action-btn">Update Medications</button>
              <button class="secondary-action-btn">Edit Clinical History</button>
            </template>

            <template v-else-if="role === 'admin'">
              <button class="secondary-action-btn">Edit Demographics</button>
            </template>
          </div>
        </div>

        <div class="risk-banner-container">
          <div v-for="allergy in allergies" :key="allergy" class="risk-banner critical">
            Allergy: {{ allergy }}
          </div>
          <div v-if="!allergies.length" class="risk-banner info">
            No allergies listed
          </div>
        </div>

        <div class="patient-layout">
          <main class="main-content">
            <section class="card">
              <h2>Demographics</h2>
              <div class="grid">
                <p><strong>Date of Birth:</strong> {{ patient.dob || "-" }}</p>
                <p><strong>Gender:</strong> {{ patient.gender || "-" }}</p>
                <p><strong>Phone:</strong> {{ patient.phone || "-" }}</p>
                <p><strong>Address:</strong> {{ patient.address || "-" }}</p>
                <p><strong>Insurance:</strong> {{ patient.insurance || "-" }}</p>
              </div>
            </section>

            <section class="card">
              <h2>Clinical History</h2>
              <div v-if="role !== 'doctor'" class="readonly-note">
                Clinical history is read-only for this account.
              </div>
              <p><strong>Conditions:</strong> {{ clinicalHistory.conditions || "-" }}</p>
              <p><strong>Surgeries:</strong> {{ clinicalHistory.surgeries || "-" }}</p>
              <p><strong>Family History:</strong> {{ clinicalHistory.familyHistory || "-" }}</p>
              <p><strong>Social History:</strong> {{ clinicalHistory.socialHistory || "-" }}</p>
            </section>

            <section class="card">
              <h2>Visit Timeline</h2>
              <div v-if="timeline.length">
                <div v-for="visit in timeline" :key="visit.id" class="timeline-item">
                  <h3>{{ visit.date }} - {{ visit.reason }}</h3>
                  <p><strong>Doctor:</strong> {{ visit.doctor }}</p>
                  <p><strong>Diagnosis:</strong> {{ visit.diagnosis || "-" }}</p>
                  <p><strong>Notes:</strong> {{ visit.notes || "-" }}</p>
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

            <p><strong>Name:</strong> {{ patient.name || "-" }}</p>

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
      </template>
    </div>
  </MainLayout>
</template>

<script>
import MainLayout from "../components/MainLayout.vue";
import { api } from "../api/api.js";

export default {
  name: "PatientRecord",
  components: { MainLayout },
  data() {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    return {
      role: currentUser.role?.toLowerCase() || "doctor",
      currentUser,
      isLoading: false,
      accessDenied: false,
      errorMessage: "",
      patient: {
        id: "",
        name: "",
        dob: "",
        gender: "",
        phone: "",
        address: "",
        insurance: "",
        photo: "",
      },
      clinicalHistory: {
        conditions: "",
        surgeries: "",
        familyHistory: "",
        socialHistory: "",
      },
      allergies: [],
      medications: [],
      timeline: [],
    };
  },
  async mounted() {
    const id = this.getRequestedPatientId();

    if (!id) {
      this.errorMessage = "No patient record is linked to this account.";
      return;
    }

    if (this.role === "patient" && this.currentUser.patientId !== id) {
      this.accessDenied = true;
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = "";

      if (this.role === "patient") {
        await this.loadPatientOwnRecord(id);
      } else {
        await this.loadStaffPatientRecord(id);
      }
    } catch (err) {
      console.error("Failed to load patient", err);
      this.errorMessage = "Unable to load patient record.";
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    getRequestedPatientId() {
      if (this.role === "patient") {
        return this.currentUser.patientId;
      }

      return this.$route.params.id;
    },
    mapPatient(patient) {
      this.patient = {
        id: patient._id,
        name: `${patient.firstName} ${patient.lastName}`,
        dob: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toLocaleDateString()
          : "-",
        gender: patient.gender || "-",
        phone: patient.demographics?.phone || "-",
        address: patient.demographics?.address || "-",
        insurance: patient.demographics?.insurance || "-",
        photo: patient.photoUrl || "",
      };

      this.clinicalHistory = {
        conditions: patient.clinicalHistory?.conditions?.join(", ") || "-",
        surgeries: patient.clinicalHistory?.surgeries?.join(", ") || "-",
        familyHistory: patient.clinicalHistory?.familyHistory || "-",
        socialHistory: patient.clinicalHistory?.socialHistory || "-",
      };

      this.allergies = patient.executiveSummary?.allergies || [];
      this.medications = (patient.executiveSummary?.activeMedications || []).map((med) =>
        `${med.name} ${med.dosage} ${med.frequency || ""}`.trim()
      );
    },
    mapTimeline(encounters) {
      this.timeline = (encounters || []).map((encounter) => ({
        id: encounter._id,
        date: new Date(encounter.dateOfVisit || encounter.createdAt).toLocaleDateString(),
        reason: encounter.reason || encounter.treatmentPlan || "Visit",
        doctor: encounter.doctorId?.firstName
          ? `Dr. ${encounter.doctorId.firstName} ${encounter.doctorId.lastName}`
          : "-",
        diagnosis: Array.isArray(encounter.diagnoses)
          ? encounter.diagnoses.join(", ")
          : encounter.diagnosis || "-",
        notes: encounter.notes || encounter.examFindings || "-",
      }));
    },
    async loadPatientOwnRecord(id) {
      const data = await api.getPortalData(id);
      this.mapPatient(data.patient);
      this.mapTimeline(data.consultations);
    },
    async loadStaffPatientRecord(id) {
      const patient = await api.getPatient(id);
      this.mapPatient(patient);

      const encounters = await api.getPatientEncounters(id);
      this.mapTimeline(encounters);
    },
    startConsultation() {
      this.$router.push(`/consultation/${this.patient.id}`);
    },
  },
};
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

.consultation-btn,
.secondary-action-btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.consultation-btn {
  background-color: #2d6a4f;
  color: white;
  border: none;
}

.secondary-action-btn {
  background-color: white;
  color: #2d6a4f;
  border: 2px solid #2d6a4f;
}

.consultation-btn:hover,
.secondary-action-btn:hover {
  transform: translateY(-1px);
}

.consultation-btn:hover {
  background-color: #1e4d38;
}

.secondary-action-btn:hover {
  background-color: #e8f3ed;
}

.risk-banner-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.risk-banner {
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 700;
}

.risk-banner.critical {
  background: #fee2e2;
  color: #991b1b;
}

.risk-banner.info {
  background: #dbeafe;
  color: #1e3a8a;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
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

.access-denied {
  max-width: 720px;
  margin: 60px auto;
  text-align: center;
}

.access-denied h1 {
  color: #b91c1c;
}

.error-message,
.loading-message {
  padding: 14px 18px;
  border-radius: 10px;
  background: white;
  font-weight: 700;
}

.error-message {
  color: #b91c1c;
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
