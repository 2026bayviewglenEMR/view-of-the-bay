<!-- // node node_modules/vite/bin/vite.js -->
<script setup>
import { ref, onMounted } from 'vue';
import { Qalendar } from 'qalendar';
import 'qalendar/dist/style.css';

const today = new Date().toISOString().split('T')[0];

const config = ref({
  defaultMode: 'day', 
  showCurrentTime: true,
  colorScheme: 'dark'
});

const events = ref([]);

const isLoading = ref(true);

const mockDatabaseResponse = [
  {
    title: "Edna Jane (In-Person)",
    with: "Dr. Smith",
    time: { start: `${today} 09:00`, end: `${today} 09:30` },
    color: "blue",
    isEditable: true,
    id: "1",
    description: "Status: Checked-in (10 min late)"
  },
  {
    title: "Brian Smithers (Telehealth)",
    with: "Dr. Smith",
    time: { start: `${today} 09:30`, end: `${today} 10:00` },
    color: "green",
    isEditable: true,
    id: "2",
    description: "Status: Waiting (On time)"
  },
  {
    title: "Lawrence Jones (In-Person)",
    with: "Dr. Smith",
    time: { start: `${today} 10:00`, end: `${today} 10:45` },
    color: "yellow",
    isEditable: true,
    id: "3",
    description: "Status: In Progress (On time)"
  }
];

onMounted(async () => {
  
  setTimeout(() => {
    events.value = mockDatabaseResponse; // Inject the JSON
    isLoading.value = false;             // Turn off the loading screen
  }, 1000);

  /* === THE REAL CODE FOR LATER ===

  try {
    // 1. Knock on the database door
    const response = await fetch('http://localhost:3000/api/appointments'); 
    
    // 2. Convert the response to JSON
    const data = await response.json(); 
    
    // 3. Feed the JSON into Qalendar
    events.value = data; 
    
    // 4. Turn off loading screen
    isLoading.value = false; 
  } catch (error) {
    console.error("Failed to fetch schedule from database!", error);
    isLoading.value = false;
  }
  */
});
</script>

<template>
  <div class="box shadow-sm">
    <h2 class="schedule-title">Today's Schedule</h2>
    
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">Fetching schedule from database...</p>
    </div>

    <div v-else class="calendar-wrapper fade-in">
      <Qalendar 
        :events="events" 
        :config="config" 
      />
    </div>
    
  </div>
</template>

<style scoped>
.shadow-sm {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.schedule-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--color-text-1-dark);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: var(--color-text-1-dark);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.calendar-wrapper {
  height: 600px; 
  width: 100%;
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

:deep(.calendar-root) {
  font-family: inherit;
}

:deep(.calendar-root .date),
:deep(.calendar-root .calendar-date),
:deep(.calendar-root [class*="date"]) {
  color: var(--color-text-1-dark);
}

:deep(.calendar-root .icon),
:deep(.calendar-root [class*="icon"]) {
  color: var(--color-text-1-dark);
}
</style>