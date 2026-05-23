<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isDropdownOpen = ref(false);
const patientAlerts = ref([]);
const baseURL = 'http://localhost:3000'; // Change this if your backend port changes


const componentRef = ref(null);


const closeOnClickOutside = (event) => {
  if (componentRef.value && !componentRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

// 3. GET /alerts (and start watching for clicks)
onMounted(async () => {
  document.addEventListener('mousedown', closeOnClickOutside);

  try {
    const response = await fetch(`${baseURL}/alerts`);
    if (response.ok) {
      patientAlerts.value = await response.json(); 
    }
  } catch (error) {
    console.error("Error fetching alerts from database:", error);
  }
});

// 4. Stop watching for clicks if the component is removed
onUnmounted(() => {
  document.removeEventListener('mousedown', closeOnClickOutside);
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// 5. DELETE /alerts/:id
const dismissAlert = async (id) => {
  patientAlerts.value = patientAlerts.value.filter(alert => alert.id !== id);
  
  try {
    await fetch(`${baseURL}/alerts/${id}`, { 
      method: 'DELETE' 
    });
  } catch (error) {
    console.error("Error deleting the alert:", error);
  }
};
</script>

<template>
  <div ref="componentRef" style="position: relative; display: inline-block;">
    
    <button @click="toggleDropdown" style="background: transparent; border: none; cursor: pointer; padding: 0; position: relative;">
      <span style="font-size: 1.5rem;">🔔</span>
      <span v-if="patientAlerts.length > 0" style="position: absolute; top: -5px; right: -5px; background-color: #f14668; color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.75rem; font-weight: bold;">
        {{ patientAlerts.length }}
      </span>
    </button>

    <div v-show="isDropdownOpen" style="position: absolute; top: 120%; right: 0; width: 320px; background-color: white; border: 2px solid #48c774; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); z-index: 9999; padding: 1rem; text-align: left;">
      <h3 style="margin: 0 0 10px 0; font-size: 1.1rem; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 8px;">Patient Alerts</h3>
      
      <div v-if="patientAlerts.length > 0" style="display: flex; flex-direction: column; gap: 10px;">
        <div v-for="alert in patientAlerts" :key="alert.id" style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 8px; border-radius: 4px;">
          <span style="font-size: 0.9rem;">{{ alert.text }}</span>
          <button @click.stop="dismissAlert(alert.id)" style="background: #effaf3; border: 1px solid #48c774; color: #48c774; border-radius: 4px; cursor: pointer;">✔️</button>
        </div>
      </div>
      
      <div v-else style="text-align: center; color: #888; font-size: 0.9rem; padding: 10px 0;">
        <p>No active alerts.</p>
      </div>
    </div>
    
  </div>
</template>