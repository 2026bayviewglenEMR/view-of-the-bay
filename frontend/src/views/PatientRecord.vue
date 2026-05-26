<template>
  <div v-if="showPatientModal" class="modal-overlay">
  <div class="modal-card">
    <h2>
      {{ isEditingPatient ? "Edit Patient" : "Add Patient" }}
    </h2>

    <div class="modal-grid">
      <input v-model="patientForm.firstName" placeholder="First Name" />
      <input v-model="patientForm.lastName" placeholder="Last Name" />
      <input v-model="patientForm.dateOfBirth" type="date" />
      <input v-model="patientForm.gender" placeholder="Gender" />
      <input v-model="patientForm.phone" placeholder="Phone" />
      <input v-model="patientForm.address" placeholder="Address" />
      <input v-model="patientForm.insurance" placeholder="Insurance" />
    </div>

    <div class="modal-actions">
      <button @click="savePatient">
        Save Patient
      </button>

      <button
        class="secondary-modal-btn"
        @click="closePatientModal"
      >
        Cancel
      </button>
    </div>
  </div>
</div>
  <MainLayout>
    <div class="patient-record-page">

      <button v-if="role === 'doctor' || role === 'admin'" class="back-btn" @click="$router.push('/patients')">
        ← Back to Patients
      </button>

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

        <!-- Resume consultation banner (doctors only) -->
        <div v-if="role === 'doctor' && consultationDraft" class="draft-banner">
          <div class="draft-banner-left">
            <span class="draft-icon">📋</span>
            <div>
              <strong>In-progress consultation</strong>
              <span class="draft-meta">
                Saved by {{ consultationDraft.savedBy }} on {{ new Date(consultationDraft.savedAt).toLocaleDateString() }}
              </span>
            </div>
          </div>
          <button class="resume-btn" @click="startConsultation">Resume Consultation →</button>
        </div>

        <div class="patient-header">
          <div>
            <h1>{{ patient.name || "Patient Record" }}</h1>
            <p v-if="patient.id">Patient ID: {{ patient.id }}</p>
          </div>

          <div class="action-buttons">
            <template v-if="role === 'doctor' || role === 'admin' || role === 'patient'">
              <button v-if="role === 'doctor'" class="consultation-btn" @click="startConsultation">
                Start Consultation
              </button>
              <button v-if="role !== 'patient'" class="secondary-action-btn" @click="openAddPatient">
                Add Patient
              </button>
              <button class="secondary-action-btn" @click="openEditPatient">
                Edit Demographics
              </button>
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
      showPatientModal: false,
      isEditingPatient: false,
      patientForm: {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        phone: "",
        address: "",
        insurance: "",
      },
      consultationDraft: null,
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
  watch: {
    '$route.params.id': {
      handler(newId) {
        if (newId && this.role !== 'patient') {
          this.isLoading = true
          this.errorMessage = ""
          this.loadStaffPatientRecord(newId).finally(() => {
            this.isLoading = false
          })
        }
      }
    }
  },
  async mounted() {
    const id = this.getRequestedPatientId();

    if (!id) {
      this.errorMessage = "No patient record is linked to this account.";
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
        return "me";
      }
      return this.$route.params.id;
    },
    formatMedication(medication) {
      if (!medication) {
        return "";
      }

      if (typeof medication === "string") {
        return medication;
      }

      return [
        medication.name || medication.medicationName || medication.drugName || medication.label || medication.id,
        medication.dosage || medication.dose,
        medication.frequency,
        medication.instructions,
      ]
        .filter(Boolean)
        .join(" ");
    },
    formatTimelineText(value) {
      if (Array.isArray(value)) {
        return value
          .map(this.formatTimelineText)
          .filter(Boolean)
          .join(", ");
      }

      if (value && typeof value === "object") {
        return this.formatMedication(value);
      }

      return value || "";
    },
    getEncounterCurrentMedications(encounter) {
      return (
        encounter.templateForms?.basic_diagnosis?.current_medications ||
        encounter.templateForms?.prescribe_medication?.current_medications ||
        []
      );
    },
    formatEncounterNotes(encounter) {
      const notes = this.formatTimelineText(encounter.notes || encounter.examFindings);
      const currentMedications = this.formatTimelineText(
        this.getEncounterCurrentMedications(encounter)
      );

      if (!notes || !currentMedications) {
        return notes || "-";
      }

      return notes.replace(
        /Current medications:\s*(?:\[object Object\]\s*,?\s*)+/g,
        `Current medications: ${currentMedications} `
      ).trim();
    },
    mapPatient(patient) {
      this.patient = {
        id: patient._id,
        name: `${patient.firstName} ${patient.lastName}`,
        dob: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toLocaleDateString()
          : "-",
        rawDob: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
          : "",
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
      this.medications = (patient.executiveSummary?.activeMedications || [])
        .map(this.formatMedication)
        .filter(Boolean);

      const draft = patient.consultationDraft;
      this.consultationDraft = (draft?.savedAt && draft.forms && Object.keys(draft.forms).length > 0)
        ? draft
        : null;
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
        notes: this.formatEncounterNotes(encounter),
      }));
    },
    async loadPatientOwnRecord(id) {
      const data = await api.getOwnPortalData();
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
      this.$router.push(`/diagnose/${this.patient.id}`)
    },
    openAddPatient() {
      this.isEditingPatient = false
      this.patientForm = {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        phone: "",
        address: "",
        insurance: "",
      }
      this.showPatientModal = true
    },

openEditPatient() {
  this.isEditingPatient = true

  const [firstName = "", lastName = ""] =
    this.patient.name.split(" ")

  this.patientForm = {
    firstName,
    lastName,
    dateOfBirth: this.patient.rawDob || "",
    gender: this.patient.gender || "",
    phone: this.patient.phone || "",
    address: this.patient.address || "",
    insurance: this.patient.insurance || "",
  }

  this.showPatientModal = true
},

closePatientModal() {
  this.showPatientModal = false
},

async savePatient() {
  try {
    const payload = {
      firstName: this.patientForm.firstName,
      lastName: this.patientForm.lastName,
      dateOfBirth: this.patientForm.dateOfBirth,
      gender: this.patientForm.gender,
      demographics: {
        phone: this.patientForm.phone,
        address: this.patientForm.address,
        insurance: this.patientForm.insurance,
      },
    }

    if (this.isEditingPatient) {
      const updated = await api.updatePatient(this.patient.id, payload);
      this.mapPatient(updated);
    } else {
      const created = await api.createPatient(payload);
      this.$router.push(`/patients/${created._id}`);
    }

    this.showPatientModal = false
  } catch (err) {
    console.error(err)
    alert(err?.response?.data?.message || "Failed to save patient.")
  }
},
  },
};
</script>

<style scoped>
.patient-record-page {
  padding: 24px;
}

.back-btn {
  background: none;
  border: none;
  color: #2d6a4f;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-bottom: 16px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.back-btn:hover {
  text-decoration: underline;
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

.draft-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #fffbeb;
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 14px 20px;
  margin-bottom: 18px;
}

.draft-banner-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.draft-icon {
  font-size: 22px;
}

.draft-banner strong {
  display: block;
  font-size: 15px;
  color: #92400e;
}

.draft-meta {
  font-size: 13px;
  color: #b45309;
}

.resume-btn {
  padding: 10px 22px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.resume-btn:hover {
  background: #d97706;
  transform: translateY(-1px);
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