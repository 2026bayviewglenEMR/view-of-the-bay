<template>
  <MainLayout>
    <div class="page">

      <!-- Header -->
      <div class="header">
        <div class="header-top">
          <h1>Waiting Room</h1>
          <button class="check-in-btn" @click="openCheckIn">+ Check In Patient</button>
        </div>

        <input
          v-model="search"
          placeholder="Search patient..."
          class="search"
        />

        <div class="filters">
          <button
            v-for="f in filters"
            :key="f"
            @click="activeFilter = f"
            :class="{ active: activeFilter === f }"
          >
            {{ f }}
          </button>
        </div>
      </div>

      <div class="content">

        <!-- LEFT: Global Waiting Room -->
        <div class="waiting-room">
          <h2>Global Waiting Room</h2>
          <p v-if="loadError" class="load-error">{{ loadError }}</p>

          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Time</th>
                <th>Status</th>
                <th>Wait</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="patient in filteredPatients"
                :key="patient.id"
              >
                <td>{{ patient.name }}</td>
                <td>{{ patient.doctor }}</td>
                <td>{{ patient.time }}</td>

                <td>
                  <select
                    :value="patient.status"
                    @change="changeStatus(patient, $event.target.value)"
                    :class="['status-select', patient.status.toLowerCase().replace(' ', '-')]"
                  >
                    <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
                  </select>
                </td>

                <td>{{ patient.wait }} min</td>

                <td>
                  <span v-if="patient.flag" class="flag">⚠</span>
                  {{ patient.note }}
                </td>

                <td class="actions-cell">
                  <button class="open-btn" @click="openPatient(patient)">Open</button>
                  <button class="remove-btn" @click="removeFromQueue(patient)" title="Remove from queue">✕</button>
                </td>
              </tr>

              <tr v-if="filteredPatients.length === 0">
                <td colspan="7" class="empty">No patients found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- RIGHT: Clinic Overview -->
        <div class="sidebar">

          <h2>Clinic Overview</h2>

          <div
            v-for="doc in doctors"
            :key="doc.id"
            class="doctor-card"
          >
            <h3>{{ doc.name }}</h3>
            <p>Status: <strong>{{ doc.status }}</strong></p>
            <p v-if="doc.current">Current: {{ doc.current }}</p>
            <p>Queue: {{ doc.queue }}</p>
          </div>

          <h2>Quick Actions</h2>

          <div class="actions">
            <button @click="router.push('/dashboard')">📅 Master Calendar</button>
            <button @click="openBooking">📝 Book Appointment</button>
            <button @click="router.push('/patientPortal')">🔄 Reschedule</button>
            <button @click="router.push('/patients')">📂 Open Patient Tabs</button>
          </div>

        </div>

      </div>

      <!-- Book Appointment Modal -->
      <div v-if="showBooking" class="modal-overlay" @click.self="closeBooking">
        <div class="modal">
          <h2>📝 Book Appointment</h2>

          <form @submit.prevent="submitBooking">

            <!-- Patient search -->
            <div class="form-group" style="position: relative">
              <label>Search Patient</label>
              <input
                v-model="bookingSearch"
                @input="onBookingSearch"
                placeholder="Start typing a name..."
                autocomplete="off"
                required
              />
              <div v-if="bookingSearchResults.length" class="search-dropdown">
                <div
                  v-for="result in bookingSearchResults"
                  :key="result.id"
                  class="search-result"
                  @mousedown.prevent="selectBookingPatient(result)"
                >
                  <strong>{{ result.firstName }} {{ result.lastName }}</strong>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Doctor</label>
              <select v-model="bookingDoctorId" required>
                <option disabled value="">Select a doctor</option>
                <option v-for="doc in doctors" :key="doc.id" :value="doc.id">
                  {{ doc.name }}
                </option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Date</label>
                <input type="date" v-model="bookingForm.date" required />
              </div>
              <div class="form-group">
                <label>Time</label>
                <input type="time" v-model="bookingForm.time" required />
              </div>
            </div>

            <div class="form-group">
              <label>Reason for Visit</label>
              <input v-model="bookingForm.reason" placeholder="e.g. Annual checkup" required />
            </div>

            <p v-if="bookingError" class="load-error">{{ bookingError }}</p>

            <div class="modal-actions">
              <button type="button" class="cancel-btn" @click="closeBooking">Cancel</button>
              <button type="submit" class="submit-btn">Book</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Check In Modal -->
      <div v-if="showCheckIn" class="modal-overlay" @click.self="closeCheckIn">
        <div class="modal">
          <h2>Check In Patient</h2>

          <form @submit.prevent="submitCheckIn">
            <!-- Patient search -->
            <div class="form-group" style="position: relative">
              <label>Search Patient</label>
              <input
                v-model="checkInSearch"
                @input="onCheckInSearch"
                placeholder="Start typing a name..."
                autocomplete="off"
                required
              />
              <div v-if="searchResults.length" class="search-dropdown">
                <div
                  v-for="result in searchResults"
                  :key="result.id"
                  class="search-result"
                  @mousedown.prevent="selectPatient(result)"
                >
                  <strong>{{ result.firstName }} {{ result.lastName }}</strong>
                  <span v-if="result.doctor"> — {{ result.doctor }}, {{ result.appointmentTime }}</span>
                  <span v-else> — No upcoming appointment</span>
                </div>
              </div>
            </div>

            <!-- Auto-filled fields -->
            <div class="form-group">
              <label>Assigned Doctor</label>
              <input
                v-model="checkInForm.doctor"
                placeholder="Auto-filled from appointment"
                required
              />
            </div>

            <div class="form-group">
              <label>Appointment Time</label>
              <input
                v-model="checkInForm.time"
                placeholder="Auto-filled from appointment"
              />
            </div>

            <div class="form-group">
              <label>Reason for Visit / Chief Complaint</label>
              <textarea
                v-model="checkInForm.note"
                rows="3"
                placeholder="What is the patient here for?"
                required
              ></textarea>
            </div>

            <p v-if="checkInError" class="load-error">{{ checkInError }}</p>

            <div class="modal-actions">
              <button type="button" class="cancel-btn" @click="closeCheckIn">Cancel</button>
              <button type="submit" class="submit-btn">Check In</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../components/MainLayout.vue'
import { api } from '../api/api'

const router = useRouter()

// ─── UI state ─────────────────────────────────────────────
const search = ref('')
const activeFilter = ref('All')
const loadError = ref('')

// ─── Check In state ───────────────────────────────────────
const showCheckIn = ref(false)
const checkInSearch = ref('')
const searchResults = ref([])
const checkInAppointmentId = ref('')
const checkInError = ref('')
let searchTimeout = null

// ─── Booking state ────────────────────────────────────────
const showBooking = ref(false)
const bookingSearch = ref('')
const bookingSearchResults = ref([])
const bookingPatientId = ref('')
const bookingDoctorId = ref('')
const bookingError = ref('')
let bookingSearchTimeout = null

const filters = ['All', 'Checked-in', 'Waiting', 'In consultation']
const statusOptions = ['Checked-in', 'Waiting', 'In consultation']

const checkInForm = reactive({
  name: '',
  doctor: '',
  time: '',
  note: ''
})

const bookingForm = reactive({
  date: '',
  time: '',
  reason: ''
})

// ─── Data ─────────────────────────────────────────────────
const patients = ref([])
const doctors = ref([])

onMounted(async () => {
  try {
    const [queueData, doctorsData] = await Promise.all([
      api.getWaitingRoom(),
      api.getDoctorsOverview()
    ])
    patients.value = queueData
    doctors.value = doctorsData
  } catch (err) {
    console.error('Failed to load waiting room:', err)
    loadError.value = 'Could not load waiting room data.'
  }
})

// ─── Filtering ────────────────────────────────────────────
const filteredPatients = computed(() => {
  return patients.value.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.value.toLowerCase())
    const matchesFilter = activeFilter.value === 'All' || p.status === activeFilter.value
    return matchesSearch && matchesFilter
  })
})

// ─── Row actions ──────────────────────────────────────────
function openPatient(patient) {
  router.push(`/patients/${patient.patientId}`)
}

async function changeStatus(patient, newStatus) {
  try {
    const updated = await api.updatePatientStatus(patient.id, newStatus)
    const idx = patients.value.findIndex(p => p.id === patient.id)
    if (idx !== -1) patients.value[idx] = updated
    doctors.value = await api.getDoctorsOverview()
  } catch (err) {
    console.error('Failed to update status:', err)
  }
}

async function removeFromQueue(patient) {
  try {
    await api.removePatient(patient.id)
    patients.value = patients.value.filter(p => p.id !== patient.id)
    doctors.value = await api.getDoctorsOverview()
  } catch (err) {
    console.error('Failed to remove patient:', err)
  }
}

// ─── Check In modal ───────────────────────────────────────
function openCheckIn() {
  checkInForm.name = ''
  checkInForm.doctor = ''
  checkInForm.time = ''
  checkInForm.note = ''
  checkInSearch.value = ''
  checkInAppointmentId.value = ''
  searchResults.value = []
  checkInError.value = ''
  showCheckIn.value = true
}

function closeCheckIn() {
  showCheckIn.value = false
  searchResults.value = []
  checkInError.value = ''
}

function onCheckInSearch() {
  clearTimeout(searchTimeout)
  if (checkInSearch.value.trim().length < 2) {
    searchResults.value = []
    return
  }
  searchTimeout = setTimeout(async () => {
    try {
      searchResults.value = await api.searchPatients(checkInSearch.value.trim())
    } catch {
      searchResults.value = []
    }
  }, 300)
}

function selectPatient(result) {
  checkInForm.name = `${result.firstName} ${result.lastName}`
  checkInForm.doctor = result.doctor || ''
  checkInForm.time = result.appointmentTime || ''
  checkInAppointmentId.value = result.appointmentId || ''
  checkInSearch.value = `${result.firstName} ${result.lastName}`
  searchResults.value = []
}

async function submitCheckIn() {
  checkInError.value = ''
  if (!checkInAppointmentId.value) {
    checkInError.value = 'Please select a patient who has an upcoming appointment.'
    return
  }
  try {
    const entry = await api.checkInPatient(checkInAppointmentId.value, checkInForm.note)
    patients.value.unshift(entry)
    doctors.value = await api.getDoctorsOverview()
    closeCheckIn()
  } catch (err) {
    checkInError.value = err?.response?.data?.message || 'Failed to check in patient.'
  }
}

// ─── Book Appointment modal ───────────────────────────────
function openBooking() {
  bookingForm.date = ''
  bookingForm.time = ''
  bookingForm.reason = ''
  bookingSearch.value = ''
  bookingSearchResults.value = []
  bookingPatientId.value = ''
  bookingDoctorId.value = ''
  bookingError.value = ''
  showBooking.value = true
}

function closeBooking() {
  showBooking.value = false
  bookingError.value = ''
}

function onBookingSearch() {
  clearTimeout(bookingSearchTimeout)
  if (bookingSearch.value.trim().length < 2) {
    bookingSearchResults.value = []
    return
  }
  bookingSearchTimeout = setTimeout(async () => {
    try {
      bookingSearchResults.value = await api.searchPatients(bookingSearch.value.trim())
    } catch {
      bookingSearchResults.value = []
    }
  }, 300)
}

function selectBookingPatient(result) {
  bookingSearch.value = `${result.firstName} ${result.lastName}`
  bookingPatientId.value = result.id
  bookingSearchResults.value = []
}

async function submitBooking() {
  bookingError.value = ''
  if (!bookingPatientId.value) {
    bookingError.value = 'Please select a patient from the search results.'
    return
  }
  try {
    const scheduledStartTime = new Date(`${bookingForm.date}T${bookingForm.time}`).toISOString()
    const scheduledEndTime = new Date(
      new Date(`${bookingForm.date}T${bookingForm.time}`).getTime() + 30 * 60 * 1000
    ).toISOString()

    await api.createAppointment(bookingPatientId.value, {
      doctorId: bookingDoctorId.value,
      scheduledStartTime,
      scheduledEndTime,
      reasonForVisit: bookingForm.reason,
    })
    closeBooking()
  } catch (err) {
    bookingError.value = err?.response?.data?.message || 'Failed to book appointment.'
  }
}
</script>

<style scoped>
.page {
  padding: 20px;
  background: #fcfcf8;
  font-family: Arial, sans-serif;
}

/* Header */
.header {
  margin-bottom: 20px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.check-in-btn {
  padding: 8px 16px;
  background: #3a5814;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}

.check-in-btn:hover {
  background: #2c4210;
}

.search {
  margin: 10px 0;
  padding: 8px;
  width: 250px;
}

.filters button {
  margin-right: 10px;
  padding: 6px 10px;
  border: none;
  background: #e5e5e5;
  cursor: pointer;
}

.filters .active {
  background: #3a5814;
  color: white;
}

/* Layout */
.content {
  display: flex;
  gap: 20px;
}

/* Waiting Room */
.waiting-room {
  flex: 3;
  background: white;
  padding: 15px;
  border-radius: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
}

tr:hover {
  background: #f2f2f2;
}

.empty {
  text-align: center;
  color: #999;
  padding: 24px;
}

/* Status select */
.status-select {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.status-select.waiting {
  background: #71b141;
  color: white;
}

.status-select.in-consultation {
  background: #3a5814;
  color: white;
}

.status-select.checked-in {
  background: #dcd8b5;
  color: #333;
}

/* Row actions */
.actions-cell {
  display: flex;
  gap: 6px;
  align-items: center;
}

.open-btn {
  padding: 6px 10px;
  border: none;
  background: #10260a;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}

.open-btn:hover {
  background: #1e4010;
}

.remove-btn {
  padding: 5px 8px;
  border: none;
  background: #c0392b;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 11px;
}

.remove-btn:hover {
  background: #a93226;
}

/* Sidebar */
.sidebar {
  flex: 1;
}

.doctor-card {
  background: white;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 10px;
}

.actions button {
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  border: none;
  background: #10260a;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}

.actions button:hover {
  background: #1e4010;
}

/* Flag */
.flag {
  color: #8e5d35;
  margin-right: 5px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: white;
  border-radius: 14px;
  padding: 32px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}

.modal h2 {
  margin: 0 0 20px;
  font-size: 1.3rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.form-group label {
  font-weight: 700;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font: inherit;
  resize: vertical;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3a5814;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.cancel-btn {
  padding: 9px 18px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 700;
}

.submit-btn {
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  background: #3a5814;
  color: white;
  cursor: pointer;
  font-weight: 700;
}

.submit-btn:hover {
  background: #2c4210;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #3a5814;
  border-radius: 8px;
  z-index: 200;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.search-result {
  padding: 10px 14px;
  cursor: pointer;
  font-size: 0.9rem;
  border-bottom: 1px solid #eee;
}

.search-result:last-child {
  border-bottom: none;
}

.search-result:hover {
  background: #f0f4ec;
}

.load-error {
  color: #b91c1c;
  font-size: 0.85rem;
  margin: 0 0 12px;
}
</style>
