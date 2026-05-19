<template>
  <MainLayout>
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
              <select id="doctor" v-model="newAppointment.doctor" required>
                <option disabled value="">Select a doctor</option>
                <option>Dr. Sarah Chen</option>
                <option>Dr. Michael Patel</option>
                <option>Dr. Emily Johnson</option>
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
              <input id="reason" type="text" v-model="newAppointment.reason"
                placeholder="Example: Follow-up, checkup, prescription refill" required />
            </div>

            <div class="form-group">
              <label for="notes">Additional notes</label>
              <textarea id="notes" v-model="newAppointment.notes" rows="4"
                placeholder="Optional symptoms, concerns, or details for the doctor"></textarea>
            </div>

            <button type="submit" class="primary-btn">
              {{ editingAppointmentId ? 'Update Appointment' : 'Schedule Appointment' }}
            </button>

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
              <option value="all">All</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>

          <div v-if="filteredAppointments.length" class="appointment-list">
            <article v-for="appointment in filteredAppointments" :key="appointment.id" class="appointment-item">
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

                <p class="doctor-name">{{ appointment.doctor }}</p>
                <p class="appointment-meta">
                  {{ formatDate(appointment.date) }} at {{ formatTime(appointment.time) }}
                </p>
                <p v-if="appointment.notes" class="appointment-notes">
                  {{ appointment.notes }}
                </p>
                <div class="appointment-actions">
                  <button v-if="canReschedule(appointment)" type="button" class="secondary-btn"
                    @click="startReschedule(appointment)">
                    Reschedule
                  </button>

                  <button type="button" class="delete-btn" @click="deleteAppointment(appointment.id)">
                    Delete
                  </button>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            <h3>No appointments found</h3>
            <p>Appointments you schedule will appear here.</p>
          </div>
        </div>
      </section>
  </MainLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import MainLayout from '../components/MainLayout.vue';

const PATIENT_ID = '69d84d5bee928eae07281c9c'
const API_URL = `http://localhost:3000/api/patient-portal/${PATIENT_ID}`

const filter = ref('all')
const confirmationMessage = ref('')
const loading = ref(true)
const errorMessage = ref('')

const patient = ref(null)
const consultations = ref([])
const appointments = ref([])
const editingAppointmentId = ref(null)

const newAppointment = reactive({
  doctor: '',
  date: '',
  time: '',
  reason: '',
  notes: ''
})

onMounted(async () => {
  await loadPatientPortalData()
})

async function loadPatientPortalData() {
  try {
    loading.value = true
    errorMessage.value = ''

    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const data = await response.json()

    patient.value = data.patient
    consultations.value = data.consultations || []

    appointments.value = (data.appointments || []).map((appointment) => {
      const startDate = new Date(appointment.scheduledStartTime)

      return {
        id: appointment._id,
        doctor: appointment.doctorId || 'Doctor assigned',
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
function canReschedule(appointment) {
  return appointment.status !== 'Completed' &&
    new Date(appointment.date) >= today
}

function deleteAppointment(id) {
  appointments.value = appointments.value.filter(
    app => app.id !== id
  )
}

function startReschedule(appointment) {
  if (!canReschedule(appointment)) {
    return
  }

  editingAppointmentId.value = appointment.id

  newAppointment.doctor = appointment.doctor
  newAppointment.date = appointment.date
  newAppointment.time = appointment.time
  newAppointment.reason = appointment.reason
  newAppointment.notes = appointment.notes
}
function scheduleAppointment() {

  if (editingAppointmentId.value) {
    appointments.value = appointments.value.map(app =>
      app.id === editingAppointmentId.value
        ? {
          ...app,
          doctor: newAppointment.doctor,
          date: newAppointment.date,
          time: newAppointment.time,
          reason: newAppointment.reason,
          notes: newAppointment.notes
        }
        : app
    )

    editingAppointmentId.value = null
  } else {
    appointments.value.unshift({
      id: Date.now(),
      doctor: newAppointment.doctor,
      date: newAppointment.date,
      time: newAppointment.time,
      reason: newAppointment.reason,
      notes: newAppointment.notes,
      status: getAppointmentStatus(newAppointment.date)
    })
  }

  confirmationMessage.value = 'Appointment request submitted successfully.'
  filter.value = 'upcoming'

  newAppointment.doctor = ''
  newAppointment.date = ''
  newAppointment.time = ''
  newAppointment.reason = ''
  newAppointment.notes = ''

  setTimeout(() => {
    confirmationMessage.value = ''
  }, 3000)
}

function formatStatus(status) {
  if (!status) return 'Scheduled'

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
function getAppointmentStatus(dateString) {
  const appointmentDate = new Date(dateString)
  appointmentDate.setHours(0, 0, 0, 0)

  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  if (appointmentDate < currentDate) {
    return 'Completed'
  }

  return 'Scheduled'
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes))

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
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

.appointment-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.secondary-btn {
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  background: var(--color-secondary);
  cursor: pointer;
  font-weight: 700;
}

.delete-btn {
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  background: #dc3545;
  color: white;
  cursor: pointer;
  font-weight: 700;
}

.patient-page {
  width: 100%;
}

.patient-portal {
  min-height: 100vh;
  margin-left: 20vw;
  width: calc(100vw - 20vw);
  padding: 92px 32px 32px;
  box-sizing: border-box;
  background: var(--color-bg);
  color: var(--color-text-1);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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