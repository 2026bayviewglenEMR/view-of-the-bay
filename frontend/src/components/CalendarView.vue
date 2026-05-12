<script setup>
import { ref, onMounted } from 'vue';
import { Qalendar } from 'qalendar';
import 'qalendar/dist/style.css';

// Get today's date to send to the database
const today = new Date().toISOString().split('T')[0];

const config = ref({
  defaultMode: 'day', 
  showCurrentTime: true,
  colorScheme: 'light'
});

const events = ref([]);
const isLoading = ref(true);

// GET ROUTE: Fetch the schedule when the page loads
onMounted(async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/appointments?date=${today}`); 
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json(); 

    events.value = data; 
    
  } catch (error) {
    console.error("Failed to fetch schedule from database:", error);
  } finally {
    isLoading.value = false; 
  }
});

// PATCH ROUTE: let users change the status of an appointment
const updateAppointmentStatus = async (id, newStatus) => {
  try {
    const response = await fetch(`http://localhost:3000/api/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) {
      throw new Error('Failed to update status');
    }
    console.log("Status updated successfully!");
  } catch (error) {
    console.error("Error updating appointment status:", error);
  }
};
</script>

<template>
  <div class="box shadow-sm">
    <h2 class="title is-5 mb-4">Today's Schedule</h2>
    
    <div v-if="isLoading" class="has-text-centered p-6">
      <div class="button is-loading is-white is-large mb-3"></div>
      <p class="has-text-grey">Fetching schedule from database...</p>
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
</style>