<!-- // node node_modules/vite/bin/vite.js -->
<script setup>
import { ref, onMounted } from 'vue';
import { Qalendar } from 'qalendar';

const events = ref([]);
const config = ref({
  defaultMode: 'week',
  // You can add more qalendar config options here
});
const baseURL = 'http://localhost:3000';

// 1. GET /api/appointments
onMounted(async () => {
  
  setTimeout(() => {
    events.value = mockDatabaseResponse; // Inject the JSON
    isLoading.value = false;             // Turn off the loading screen
  }, 1000);

  // === THE REAL CODE FOR LATER ===

  try {
    const response = await fetch(`${baseURL}/api/appointments`);
    if (response.ok) {
      events.value = await response.json();
    }
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
});

// 2. PATCH /api/appointments/:id
// This triggers automatically if someone drags/drops or resizes an event in Qalendar
const updateAppointment = async (updatedEvent) => {
  try {
    await fetch(`${baseURL}/api/appointments/${updatedEvent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent)
    });
  } catch (error) {
    console.error("Error updating appointment time:", error);
  }
};
</script>

<template>
  <div class="calendar-wrapper">
    <Qalendar 
      :events="events" 
      :config="config" 
      @event-was-updated="updateAppointment" 
    />
  </div>
</template>

<style scoped>
/* Includes the custom Portal colors we set up earlier */
.calendar-wrapper {
  background-color: #f5f3e6;
  border: 2px solid #2e6d4f;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

:deep(.qalendar-is-light-mode) {
  --qalendar-theme-color: #2e6d4f; 
  --qalendar-paper: #f5f3e6; 
  --qalendar-border-color: rgba(46, 109, 79, 0.2); 
  --qalendar-heading-color: #2e6d4f;
  --qalendar-base-color: #333333;
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