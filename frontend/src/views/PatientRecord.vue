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
      <input v-model="patientForm.email" placeholder="Email" />
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

      <div v-else-if="isLoading" class="skeleton-page">
        <!-- header -->
        <div class="skeleton-header">
          <div class="skel skel-title"></div>
          <div class="skel skel-subtitle"></div>
          <div class="skeleton-header-btns">
            <div class="skel skel-btn"></div>
            <div class="skel skel-btn"></div>
          </div>
        </div>
        <!-- allergy banner placeholder -->
        <div class="skel skel-banner"></div>

        <div class="patient-layout">
          <main class="main-content">
            <section class="card">
              <div class="skel skel-card-title"></div>
              <div class="skel-row" v-for="n in 5" :key="'d'+n">
                <div class="skel skel-label"></div>
                <div class="skel skel-value"></div>
              </div>
            </section>
            <section class="card">
              <div class="skel skel-card-title"></div>
              <div class="skel-row" v-for="n in 4" :key="'c'+n">
                <div class="skel skel-label"></div>
                <div class="skel skel-value"></div>
              </div>
            </section>
            <section class="card">
              <div class="skel skel-card-title"></div>
              <div v-for="n in 2" :key="'t'+n" class="skeleton-timeline-item">
                <div class="skel skel-tl-title"></div>
                <div class="skel skel-tl-line"></div>
                <div class="skel skel-tl-line short"></div>
              </div>
            </section>
          </main>

          <aside class="summary-panel card">
            <div class="skel skel-card-title"></div>
            <div class="skel skel-photo"></div>
            <div class="skel skel-value" style="margin-bottom:16px"></div>
            <div class="skel skel-section-title"></div>
            <div class="skel skel-value short" v-for="n in 2" :key="'a'+n"></div>
            <div class="skel skel-section-title" style="margin-top:16px"></div>
            <div class="skel skel-value short" v-for="n in 3" :key="'m'+n"></div>
          </aside>
        </div>
      </div>

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
                <p><strong>Email:</strong> {{ patient.email || "-" }}</p>
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

                  <div v-if="visit.soapNote" class="soap-note-block">
                    <div class="soap-note-header">SOAP Note</div>
                    <div class="soap-note-grid">
                      <div class="soap-note-row">
                        <span class="soap-note-label">S</span>
                        <span class="soap-note-text">{{ visit.soapNote.subjective || "-" }}</span>
                      </div>
                      <div class="soap-note-row">
                        <span class="soap-note-label">O</span>
                        <span class="soap-note-text">{{ visit.soapNote.objective || "-" }}</span>
                      </div>
                      <div class="soap-note-row">
                        <span class="soap-note-label">A</span>
                        <span class="soap-note-text">{{ visit.soapNote.assessment || "-" }}</span>
                      </div>
                      <div class="soap-note-row">
                        <span class="soap-note-label">P</span>
                        <span class="soap-note-text">{{ visit.soapNote.plan || "-" }}</span>
                      </div>
                    </div>
                  </div>
                  <p v-else><strong>Notes:</strong> {{ visit.notes || "-" }}</p>
                </div>
              </div>
              <p v-else>No visits yet.</p>
            </section>

            <!-- Documents -->
            <section v-if="role === 'doctor' || role === 'admin'" class="card">
              <div class="doc-section-header">
                <h2>Documents</h2>
                <div class="doc-upload-controls" v-if="role === 'doctor' || role === 'admin'">
                  <select v-model="docUploadType" class="doc-type-select">
                    <option value="general">General</option>
                    <option value="lab-order">Lab Order</option>
                    <option value="lab-result">Lab Result</option>
                    <option value="referral">Referral</option>
                    <option value="imaging">Imaging</option>
                    <option value="prescription">Prescription</option>
                    <option value="consent">Consent Form</option>
                  </select>
                  <label class="upload-btn" :class="{ disabled: uploadingDoc }">
                    {{ uploadingDoc ? 'Uploading...' : '📎 Upload Document' }}
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" @change="handleDocumentUpload" :disabled="uploadingDoc" hidden />
                  </label>
                </div>
              </div>

              <div v-if="documents.length" class="doc-list">
                <div v-for="doc in documents" :key="doc._id" class="doc-item">
                  <div class="doc-info">
                    <span class="doc-icon">{{ doc.documentType === 'lab-order' ? '🧪' : doc.documentType === 'lab-result' ? '📊' : doc.documentType === 'imaging' ? '🩻' : doc.documentType === 'prescription' ? '💊' : '📄' }}</span>
                    <div>
                      <div class="doc-name">{{ doc.originalName || doc.fileName }}</div>
                      <div class="doc-meta">{{ doc.documentType }} · {{ new Date(doc.uploadDate).toLocaleDateString() }}</div>
                    </div>
                  </div>
                  <div class="doc-actions">
                    <a :href="import.meta.env.VITE_SERVER_URL || 'http://localhost:3000' + doc.fileUrl" target="_blank" class="doc-view-btn">View</a>
                    <button @click="deleteDocument(doc._id)" class="doc-delete-btn">✕</button>
                  </div>
                </div>
              </div>
              <p v-else class="doc-empty">No documents uploaded yet.</p>
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
        email: "",
        address: "",
        insurance: "",
      },
      consultationDraft: null,
      documents: [],
      uploadingDoc: false,
      docUploadType: "general",
      patient: {
        id: "",
        name: "",
        dob: "",
        gender: "",
        email: "",
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
        email: patient.demographics?.email || "-",
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
        soapNote: encounter.wizardData?.soapNote || null,
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

      try {
        this.documents = await api.getPatientDocuments(id);
      } catch {}
    },

    async handleDocumentUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      this.uploadingDoc = true;
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('patientId', this.patient.id);
        formData.append('documentType', this.docUploadType);
        formData.append('originalName', file.name);
        formData.append('scope', 'role');
        formData.append('roles', JSON.stringify(['doctor', 'admin']));
        formData.append('userIds', JSON.stringify([]));
        const doc = await api.uploadPatientDocument(formData);
        this.documents.unshift(doc);
      } catch (err) {
        alert('Upload failed. Please try again.');
      } finally {
        this.uploadingDoc = false;
        event.target.value = '';
      }
    },

    async deleteDocument(id) {
      if (!confirm('Delete this document?')) return;
      try {
        await api.deletePatientDocument(id);
        this.documents = this.documents.filter(d => d._id !== id);
      } catch {
        alert('Could not delete document.');
      }
    },

    docBaseUrl() {
      return import.meta.env.VITE_SERVER_URL || 'http://localhost:3000/api';
    },
    async startConsultation() {
      try {
        await api.startWaitingRoomConsultation(this.patient.id);
      } catch (err) {
        console.error("Failed to start waiting room consultation:", err);
      }
      this.$router.push(`/diagnose/${this.patient.id}`)
    },
    openAddPatient() {
      this.isEditingPatient = false
      this.patientForm = {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        email: "",
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
    email: this.patient.email || "",
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
        email: this.patientForm.email,
        address: this.patientForm.address,
        insurance: this.patientForm.insurance,
      },
    }

    if (this.isEditingPatient) {
      const updated = this.role === 'patient'
        ? await api.updateOwnPatient(payload)
        : await api.updatePatient(this.patient.id, payload);
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

.soap-note-block {
  margin-top: 10px;
  background: #f8fdf9;
  border: 1px solid #b7dfc8;
  border-radius: 8px;
  overflow: hidden;
}

.soap-note-header {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #2d6a4f;
  padding: 8px 12px;
  background: #e8f3ed;
  border-bottom: 1px solid #b7dfc8;
}

.soap-note-grid {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.soap-note-row {
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 10px;
  align-items: baseline;
}

.soap-note-label {
  font-size: 12px;
  font-weight: 700;
  color: #2d6a4f;
}

.soap-note-text {
  font-size: 13px;
  color: #333;
  white-space: pre-line;
  line-height: 1.5;
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
/* ── Skeleton loading ─────────────────────────────── */
.skeleton-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skel {
  background: linear-gradient(90deg, #e8e8e8 25%, #f4f4f4 50%, #e8e8e8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.skeleton-header-btns {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.skel-title    { width: 220px; height: 28px; }
.skel-subtitle { width: 140px; height: 16px; }
.skel-btn      { width: 130px; height: 36px; border-radius: 8px; }
.skel-banner   { width: 200px; height: 32px; border-radius: 8px; }
.skel-card-title    { width: 140px; height: 20px; margin-bottom: 14px; }
.skel-section-title { width: 110px; height: 14px; margin-bottom: 8px; }
.skel-photo    { width: 72px; height: 72px; border-radius: 50%; margin: 8px auto 16px; }

.skel-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}
.skel-row:last-child { border-bottom: none; }
.skel-label { width: 110px; height: 13px; flex-shrink: 0; }
.skel-value { flex: 1; height: 13px; }
.skel-value.short { flex: none; width: 120px; margin-bottom: 6px; }

.skeleton-timeline-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.skeleton-timeline-item:last-child { border-bottom: none; }
.skel-tl-title { width: 60%; height: 15px; }
.skel-tl-line  { width: 85%; height: 12px; }
.skel-tl-line.short { width: 55%; }

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

.doc-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.doc-section-header h2 {
  margin: 0;
}

.doc-upload-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.doc-type-select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.upload-btn {
  padding: 8px 16px;
  background: #2d6a4f;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.upload-btn:hover {
  background: #1e4d38;
}

.upload-btn.disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.doc-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.doc-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  gap: 12px;
}

.doc-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.doc-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.doc-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.doc-meta {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  text-transform: capitalize;
}

.doc-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.doc-view-btn {
  padding: 6px 14px;
  background: white;
  border: 1px solid #2d6a4f;
  color: #2d6a4f;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.doc-view-btn:hover {
  background: #2d6a4f;
  color: white;
}

.doc-delete-btn {
  padding: 6px 10px;
  background: white;
  border: 1px solid #e5e7eb;
  color: #9ca3af;
  border-radius: 7px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.doc-delete-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.doc-empty {
  color: #9ca3af;
  font-style: italic;
  font-size: 14px;
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