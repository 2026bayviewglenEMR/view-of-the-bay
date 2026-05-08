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

              <p class="doctor-name">{{ appointment.doctor }}</p>
              <p class="appointment-meta">
                {{ formatDate(appointment.date) }} at {{ formatTime(appointment.time) }}
              </p>
              <p v-if="appointment.notes" class="appointment-notes">
                {{ appointment.notes }}
              </p>
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
import { computed, reactive, ref } from 'vue'

const filter = ref('upcoming')
const confirmationMessage = ref('')

const newAppointment = reactive({
  doctor: '',
  date: '',
  time: '',
  reason: '',
  notes: ''
})

const appointments = ref([
  {
    id: 1,
    doctor: 'Dr. Sarah Chen',
    date: '2026-05-14',
    time: '10:30',
    reason: 'Annual checkup',
    notes: 'Bring recent blood pressure readings.',
    status: 'Confirmed'
  },
  {
    id: 2,
    doctor: 'Dr. Michael Patel',
    date: '2026-05-22',
    time: '14:00',
    reason: 'Prescription refill',
    notes: 'Review current medication dosage.',
    status: 'Pending'
  },
  {
    id: 3,
    doctor: 'Dr. Emily Johnson',
    date: '2026-04-18',
    time: '09:15',
    reason: 'Follow-up visit',
    notes: 'Discuss recovery progress.',
    status: 'Completed'
  }
])

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

function scheduleAppointment() {
  appointments.value.unshift({
    id: Date.now(),
    doctor: newAppointment.doctor,
    date: newAppointment.date,
    time: newAppointment.time,
    reason: newAppointment.reason,
    notes: newAppointment.notes,
    status: 'Pending'
  })

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
  background: #f4f7fb;
  color: #172033;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.hero-card,
.card {
  background: #ffffff;
  border: 1px solid #e4e9f2;
  border-radius: 24px;
  box-shadow: 0 18px 45px rgba(23, 32, 51, 0.08);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 32px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #ffffff, #eef6ff);
}

.eyebrow {
  margin: 0 0 6px;
  color: #3b82f6;
  font-size: 0.78rem;
  font-weight: 700;
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
  line-height: 1.1;
}

h2 {
  margin-bottom: 0;
  font-size: 1.35rem;
}

.subtitle {
  max-width: 620px;
  margin-bottom: 0;
  color: #5b667a;
  font-size: 1rem;
}

.hero-stats {
  display: flex;
  gap: 16px;
}

.hero-stats div {
  min-width: 110px;
  padding: 18px;
  border-radius: 18px;
  background: #ffffff;
  text-align: center;
  border: 1px solid #dce6f5;
}

.hero-stats span {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: #2563eb;
}

.hero-stats p {
  margin-bottom: 0;
  color: #667085;
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
  color: #344054;
  font-size: 0.92rem;
  font-weight: 700;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid #d0d7e2;
  border-radius: 14px;
  padding: 12px 14px;
  background: #ffffff;
  color: #172033;
  font: inherit;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

textarea {
  resize: vertical;
}

.primary-btn {
  border: none;
  border-radius: 16px;
  padding: 13px 18px;
  background: #2563eb;
  color: white;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.primary-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.success-message {
  margin-bottom: 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: #ecfdf3;
  color: #027a48;
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
  border: 1px solid #e4e9f2;
  border-radius: 20px;
  background: #fbfcff;
}

.date-box {
  display: grid;
  place-items: center;
  align-self: start;
  padding: 12px 8px;
  border-radius: 18px;
  background: #eff6ff;
  color: #1d4ed8;
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
}

.doctor-name {
  margin-bottom: 4px;
  color: #344054;
  font-weight: 700;
}

.appointment-meta,
.appointment-notes {
  margin-bottom: 0;
  color: #667085;
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
  background: #ecfdf3;
  color: #027a48;
}

.status-pill.pending {
  background: #fffaeb;
  color: #b54708;
}

.status-pill.completed {
  background: #f2f4f7;
  color: #475467;
}

.empty-state {
  padding: 42px 20px;
  border: 1px dashed #cbd5e1;
  border-radius: 20px;
  text-align: center;
  color: #667085;
}

.empty-state h3 {
  margin-bottom: 6px;
  color: #172033;
}

.empty-state p {
  margin-bottom: 0;
}

@media (max-width: 900px) {
  .layout-grid,
  .hero-card {
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
    border-radius: 20px;
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
