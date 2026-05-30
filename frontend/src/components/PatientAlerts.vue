<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { api } from '@/api/api.js'; // Ensure this path is correct for your project

const isDropdownOpen = ref(false);
const patientAlerts = ref([]);
const unreadMessages = ref(parseInt(localStorage.getItem('unreadMessages') || '0'));
let pollInterval = null;

const currentUserObj = JSON.parse(localStorage.getItem("user") || "{}");
const currentUser = currentUserObj?.id;

const componentRef = ref(null);

const closeOnClickOutside = (event) => {
  if (componentRef.value && !componentRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

const fetchUnreadMessages = async () => {
  if (!currentUser) return;
  
  try {
    // Replaced raw fetch with your existing api.js messaging method
    const conversations = await api.getConversations(currentUser);
    unreadMessages.value = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    localStorage.setItem('unreadMessages', unreadMessages.value);
  } catch (error) {
    console.error("Error fetching unread messages:", error);
  }
};

onMounted(async () => {
  document.addEventListener('mousedown', closeOnClickOutside);

  try {
    // patientAlerts.value = await api.getAlerts(); 
  } catch (error) {
    console.error("Error fetching alerts from database:", error);
  }

  await fetchUnreadMessages();
  pollInterval = setInterval(fetchUnreadMessages, 3000);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', closeOnClickOutside);
  if (pollInterval) clearInterval(pollInterval);
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const dismissAlert = async (id) => {
  patientAlerts.value = patientAlerts.value.filter(alert => alert.id !== id);
  
  try {
    await api.deleteAlert(id);
  } catch (error) {
    console.error("Error deleting the alert:", error);
  }
};
</script>

<template>
  <div ref="componentRef" style="position: relative; display: inline-block;">
    
    <button @click="toggleDropdown" style="background: transparent; border: none; cursor: pointer; padding: 0; position: relative;">
      <span style="font-size: 1.5rem;">🔔</span>
      <span v-if="patientAlerts.length > 0 || unreadMessages > 0" style="position: absolute; top: -5px; right: -5px; background-color: #f14668; color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.75rem; font-weight: bold;">
        {{ patientAlerts.length + unreadMessages }}
      </span>
    </button>

    <div v-show="isDropdownOpen" style="position: absolute; top: 120%; right: 0; width: 320px; background-color: white; border: 2px solid #48c774; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); z-index: 9999; padding: 1rem; text-align: left;">
      <h3 style="margin: 0 0 10px 0; font-size: 1.1rem; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 8px;">Patient Alerts</h3>
      
      <div v-if="unreadMessages > 0" style="margin-bottom: 10px; padding: 8px; background: #e6f4ee; border-radius: 4px; font-size: 0.9rem; color: #333;">
        📬 You have {{ unreadMessages }} unread message{{ unreadMessages > 1 ? 's' : '' }} — 
        <a href="/messaging" style="color: #2D6A4F; font-weight: bold;">View</a>
      </div>

      <div v-if="patientAlerts.length > 0" style="display: flex; flex-direction: column; gap: 10px;">
        <div v-for="alert in patientAlerts" :key="alert.id" style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 8px; border-radius: 4px;">
          <span style="font-size: 0.9rem; color: #333;">{{ alert.text }}</span>
          <button @click.stop="dismissAlert(alert.id)" style="background: #effaf3; border: 1px solid #48c774; color: #48c774; border-radius: 4px; cursor: pointer;">✔️</button>
        </div>
      </div>
      
      <div v-else-if="unreadMessages === 0" style="text-align: center; color: #888; font-size: 0.9rem; padding: 10px 0;">
        <p>No active alerts.</p>
      </div>
    </div>
    
  </div>
</template>