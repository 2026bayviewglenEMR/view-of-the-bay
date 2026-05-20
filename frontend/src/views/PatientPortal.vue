<template>
  <main class="patient-portal">
    <section class="hero-card">
      <div>
        <p class="eyebrow">Patient Portal</p>
        <h1>Appointments</h1>
        <p class="subtitle">
          Schedule new appointments and view upcoming or past visits from one simple dashboard.
        </p>
      </div>

      <div class="hero-stats">
        <div>
          <span>{{ upcomingAppointments.length }}</span>
          <p>Upcoming</p>
        </div>
        <div>
          <span>{{ pastAppointments.length }}</span>
          <p>Past</p>
        </div>
      </div>
    </section>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <section class="layout-grid">
      <!-- Schedule Appointment -->
      <div class="card schedule-card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Schedule</p>
            <h2>Book an appointment</h2>
          </div>
        </div>

        <form @submit.prevent="scheduleAppointment" class="appointment-form">
          <div class="form-group">
            <label for="doctor">Doctor</label>
            <select id="doctor" v-model="newAppointment.doctorId" required>
              <option disabled value="">Select a doctor</option>
              <option v-for="doc in doctors" :key="doc._id" :value="doc._id">
                Dr. {{ doc.firstName }} {{ doc.lastName }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="date">Date</label>
              <input id="date" type="date" v-model="newAppointment.date" required />
            </div>

            <div class="form-group">
              <label for="time">Time</label>
              <input id="time" type="time" v-model="newAppointment.time" required />
            </div>
          </div>

          <div class="form-group">
            <label for="reason">Reason for visit</label>
            <input
              id="reason"
              type="text"
              v-model="newAppointment.reason"
              placeholder="Example: Follow-up, checkup, prescription refill"
              required
            />
          </div>

          <div class="form-group">
            <label for="notes">Additional notes</label>
            <textarea
              id="notes"
              v-model="newAppointment.notes"
              rows="4"
              placeholder="Optional symptoms, concerns, or details for the doctor"
            ></textarea>
          </div>

          <button type="submit" class="primary-btn">Schedule Appointment</button>

          <p v-if="confirmationMessage" class="success-message">
            {{ confirmationMessage }}
          </p>
        </form>
      </div>

      <!-- View Appointments -->
      <div class="card appointments-card">
        <div class="card-header appointments-header">
          <div>
            <p class="eyebrow">View</p>
            <h2>Your appointments</h2>
          </div>

          <select v-model="filter" class="filter-select" aria-label="Filter appointments">
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="all">All</option>
          </select>
        </div>

        <div v-if="filteredAppointments.length" class="appointment-list">
          <article
            v-for="appointment in filteredAppointments"
            :key="appointment.id"
            class="appointment-item"
          >
            <div class="date-box">
              <span>{{ getMonth(appointment.date) }}</span>
              <strong>{{ getDay(appointment.date) }}</strong>
            </div>

            <div class="appointment-details">
              <div class="appointment-topline">
                <h3>{{ appointment.reason }}</h3>
                <span :class="['status-pill', appointment.status.toLowerCase()]">
                  {{ appointment.status }}
                </span>
              </div>

              <p class="doctor-name">{{ getDoctorName(appointment.doctorId) }}</p>
              <p class="appointment-meta">
                {{ formatDate(appointment.date) }} at {{ formatTime(appointment.time) }}
              </p>
              <p v-if="appointment.notes" class="appointment-notes">
                {{ appointment.notes }}
              </p>
              <button
                v-if="appointment.status.toLowerCase() !== 'completed'"
                class="delete-btn"
                @click="deleteAppointment(appointment.id)"
              >Cancel</button>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <h3>No appointments found</h3>
          <p>Appointments you schedule will appear here.</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from '../api/api'

const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
const patientId = storedUser.patientId ?? null

const filter = ref('all')
const confirmationMessage = ref('')
const loading = ref(true)
const errorMessage = ref('')

const patient = ref(null)
const consultations = ref([])
const appointments = ref([])
const doctors = ref([])

const newAppointment = reactive({
  doctorId: '',
  date: '',
  time: '',
  reason: '',
  notes: ''
})

onMounted(async () => {
  await Promise.all([loadPatientPortalData(), loadDoctors()])
})

async function loadDoctors() {
  try {
    doctors.value = await api.getDoctors()
  } catch (error) {
    console.error('Error loading doctors:', error)
  }
}

async function loadPatientPortalData() {
  if (!patientId) {
    errorMessage.value = 'No patient record linked to your account. Please contact your clinic.'
    loading.value = false
    return
  }
  try {
    loading.value = true
    errorMessage.value = ''

    const data = await api.getPortalData(patientId)

    patient.value = data.patient
    consultations.value = data.consultations || []

    appointments.value = (data.appointments || []).map((appointment) => {
      const startDate = new Date(appointment.scheduledStartTime)
      return {
        id: appointment._id,
        doctorId: appointment.doctorId,
        date: startDate.toISOString().split('T')[0],
        time: startDate.toTimeString().slice(0, 5),
        reason: appointment.reasonForVisit || 'Appointment',
        notes: appointment.notes || '',
        status: formatStatus(appointment.status)
      }
    })
  } catch (error) {
    console.error('Error loading patient portal data:', error)
    errorMessage.value = 'Unable to load patient portal data.'
  } finally {
    loading.value = false
  }
}

const today = new Date()
today.setHours(0, 0, 0, 0)

const upcomingAppointments = computed(() =>
  appointments.value.filter((appointment) => new Date(appointment.date) >= today)
)

const pastAppointments = computed(() =>
  appointments.value.filter((appointment) => new Date(appointment.date) < today)
)

const filteredAppointments = computed(() => {
  if (filter.value === 'upcoming') return upcomingAppointments.value
  if (filter.value === 'past') return pastAppointments.value
  return appointments.value
})

async function scheduleAppointment() {
  try {
    const startDateTime = new Date(`${newAppointment.date}T${newAppointment.time}`)
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000)

    const created = await api.createAppointment(patientId, {
      doctorId: newAppointment.doctorId,
      scheduledStartTime: startDateTime.toISOString(),
      scheduledEndTime: endDateTime.toISOString(),
      reasonForVisit: newAppointment.reason,
      notes: newAppointment.notes || ''
    })

    appointments.value.unshift({
      id: created._id,
      doctorId: created.doctorId,
      date: newAppointment.date,
      time: newAppointment.time,
      reason: created.reasonForVisit,
      notes: created.notes,
      status: formatStatus(created.status)
    })

    confirmationMessage.value = 'Appointment scheduled successfully.'
    filter.value = 'upcoming'

    newAppointment.doctorId = ''
    newAppointment.date = ''
    newAppointment.time = ''
    newAppointment.reason = ''
    newAppointment.notes = ''

    setTimeout(() => { confirmationMessage.value = '' }, 3000)
  } catch (error) {
    console.error('Error creating appointment:', error)
    errorMessage.value = 'Failed to schedule appointment. Please try again.'
  }
}

async function deleteAppointment(id) {
  try {
    await api.deleteAppointment(patientId, id)
    appointments.value = appointments.value.filter(app => app.id !== id)
  } catch (error) {
    console.error('Error deleting appointment:', error)
    errorMessage.value = 'Failed to cancel appointment.'
  }
}

function getDoctorName(doctorId) {
  const doc = doctors.value.find(d => d._id === doctorId || d.id === doctorId)
  if (!doc) return 'Doctor assigned'
  return `Dr. ${doc.firstName} ${doc.lastName}`
}

function formatStatus(status) {
  if (!status) return 'Pending'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes))
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function getMonth(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short' })
}

function getDay(dateString) {
  return new Date(dateString).getDate()
}
</script>

<style scoped>
.patient-portal {
  min-height: 100vh;
  padding: 32px;
  background: var(--color-bg);
  color: var(--color-text-1);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.hero-card,
.card {
  background: var(--color-paper);
  border: 2px solid var(--color-border);
  border-radius: 18px;
  box-shadow: 0 10px 25px rgba(22, 38, 26, 0.12);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 32px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, var(--color-paper), var(--color-secondary));
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--color-primary);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 8px;
  font-size: 2.4rem;
  color: var(--color-text-1);
}

h2 {
  margin-bottom: 0;
  font-size: 1.35rem;
  color: var(--color-text-1);
}

.subtitle {
  max-width: 620px;
  margin-bottom: 0;
  color: var(--color-text-2);
}

.hero-stats {
  display: flex;
  gap: 16px;
}

.hero-stats div {
  min-width: 110px;
  padding: 18px;
  border-radius: 16px;
  background: var(--color-bg);
  text-align: center;
  border: 2px solid var(--color-primary);
}

.hero-stats span {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary);
}

.hero-stats p {
  margin-bottom: 0;
  color: var(--color-text-2);
  font-size: 0.9rem;
}

.layout-grid {
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(420px, 1.1fr);
  gap: 24px;
}

.card {
  padding: 28px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.appointment-form {
  display: grid;
  gap: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: grid;
  gap: 8px;
}

label {
  color: var(--color-text-1);
  font-size: 0.92rem;
  font-weight: 700;
}

input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 12px 14px;
  background: #fffdf0;
  color: var(--color-text-1);
  font: inherit;
  outline: none;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--color-primary-hover);
  box-shadow: 0 0 0 4px rgba(45, 106, 79, 0.18);
}

textarea {
  resize: vertical;
}

.primary-btn {
  border: none;
  border-radius: 14px;
  padding: 13px 18px;
  background: var(--color-primary);
  color: white;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
}

.primary-btn:hover {
  background: var(--color-primary-hover);
}

.success-message {
  margin-bottom: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--color-success);
  color: var(--color-text-1);
  font-weight: 700;
}

.appointments-header {
  align-items: center;
}

.filter-select {
  width: auto;
  min-width: 140px;
}

.appointment-list {
  display: grid;
  gap: 16px;
}

.appointment-item {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 18px;
  padding: 18px;
  border: 2px solid var(--color-secondary);
  border-radius: 16px;
  background: #fffdf0;
}

.date-box {
  display: grid;
  place-items: center;
  align-self: start;
  padding: 12px 8px;
  border-radius: 14px;
  background: var(--color-primary);
  color: white;
}

.date-box span {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.date-box strong {
  font-size: 1.8rem;
  line-height: 1;
}

.appointment-topline {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 6px;
}

.appointment-topline h3 {
  margin-bottom: 0;
  font-size: 1.05rem;
  color: var(--color-text-1);
}

.doctor-name {
  margin-bottom: 4px;
  color: var(--color-text-1);
  font-weight: 700;
}

.appointment-meta,
.appointment-notes {
  margin-bottom: 0;
  color: var(--color-text-2);
  font-size: 0.92rem;
}

.appointment-notes {
  margin-top: 8px;
}

.status-pill {
  flex-shrink: 0;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
}

.status-pill.confirmed {
  background: var(--color-success);
  color: var(--color-text-1);
}

.status-pill.pending {
  background: var(--color-warning);
  color: var(--color-text-1);
}

.status-pill.scheduled {
  background: var(--color-warning);
  color: var(--color-text-1);
}

.status-pill.completed {
  background: var(--color-secondary);
  color: var(--color-text-1);
}

.error-message {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fde8e8;
  color: #b91c1c;
  font-weight: 700;
}

.delete-btn {
  margin-top: 10px;
  border: 2px solid var(--color-border);
  border-radius: 10px;
  padding: 6px 14px;
  background: transparent;
  color: var(--color-text-2);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.delete-btn:hover {
  border-color: #b91c1c;
  color: #b91c1c;
}

.empty-state {
  padding: 42px 20px;
  border: 2px dashed var(--color-border);
  border-radius: 16px;
  text-align: center;
  color: var(--color-text-2);
}

.empty-state h3 {
  margin-bottom: 6px;
  color: var(--color-text-1);
}

.empty-state p {
  margin-bottom: 0;
}

@media (max-width: 900px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }

  .hero-card {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-stats {
    width: 100%;
  }

  .hero-stats div {
    flex: 1;
  }
}

@media (max-width: 600px) {
  .patient-portal {
    padding: 18px;
  }

  .hero-card,
  .card {
    padding: 22px;
  }

  .form-row,
  .appointment-item {
    grid-template-columns: 1fr;
  }

  .date-box {
    width: 72px;
  }

  .appointments-header,
  .appointment-topline {
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }
}
</style>