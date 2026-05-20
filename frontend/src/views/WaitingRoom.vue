<template>
  <div class="page">

    <!-- Header -->
    <div class="header">
      <h1>Waiting Room</h1>

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
                <span :class="['status', patient.status.toLowerCase()]">
                  {{ patient.status }}
                </span>
              </td>

              <td>{{ patient.wait }} min</td>

              <td>
                <span v-if="patient.flag" class="flag">⚠</span>
                {{ patient.note }}
              </td>

              <td>
                <button class="open-btn">Open</button>
              </td>
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
          <button>Master Calendar</button>
          <button>Book Appointment</button>
          <button>Reschedule</button>
          <button>Open Patient Tabs</button>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const search = ref('')
const activeFilter = ref('All')

const filters = ['All', 'Checked-in', 'Waiting', 'In consultation']

const patients = ref([
  {
    id: 1,
    name: 'Sarah Chen',
    doctor: 'Dr. Patel',
    time: '10:30',
    status: 'Waiting',
    wait: 12,
    note: 'Follow-up visit',
    flag: true
  },
  {
    id: 2,
    name: 'James Lee',
    doctor: 'Dr. Williams',
    time: '10:00',
    status: 'In consultation',
    wait: 0,
    note: '',
    flag: false
  },
  {
    id: 3,
    name: 'Ava Singh',
    doctor: 'Dr. Patel',
    time: '10:15',
    status: 'Checked-in',
    wait: 5,
    note: 'New patient',
    flag: false
  }
])

const doctors = ref([
  {
    id: 1,
    name: 'Dr. Patel',
    status: 'Busy',
    current: 'Sarah Chen',
    queue: 3
  },
  {
    id: 2,
    name: 'Dr. Williams',
    status: 'Free',
    current: null,
    queue: 0
  }
])

const filteredPatients = computed(() => {
  return patients.value.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.value.toLowerCase())

    const matchesFilter =
      activeFilter.value === 'All' ||
      p.status === activeFilter.value

    return matchesSearch && matchesFilter
  })
})
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

/* Status colors */
.status {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.waiting {
  background: #71b141;
  color: white;
}

.in\ consultation {
  background: #3a5814;
  color: white;
}

.checked-in {
  background: #dcd8b5;
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
}

/* Flag */
.flag {
  color: #8e5d35;
  margin-right: 5px;
}

/* Open button */
.open-btn {
  padding: 6px 10px;
  border: none;
  background: #10260a;
  color: white;
  cursor: pointer;
}
</style>