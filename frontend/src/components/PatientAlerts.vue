<script setup>
import { ref } from 'vue';

const isDropdownOpen = ref(false);

const patientAlerts = ref([
  { id: 1, type: 'screening', text: 'Total Cholesterol test overdue (1 Jun 2017)', done: false },
  { id: 2, type: 'screening', text: 'Colonoscopy overdue (4 May 2015)', done: false },
  { id: 3, type: 'alert', text: 'Speak about stress & work', done: false }
]);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const dismissAlert = (id) => {
  patientAlerts.value = patientAlerts.value.filter(alert => alert.id !== id);
};
</script>

<template>
  <div class="dropdown is-right" :class="{ 'is-active': isDropdownOpen }">
    
    <div class="dropdown-trigger">
      <button class="button is-white" @click="toggleDropdown" style="position: relative; background-color: transparent;">
        <span class="icon is-large" style="font-size: 1.5rem;">🔔</span>
        <span v-if="patientAlerts.length > 0" class="tag is-danger is-rounded" style="position: absolute; top: -5px; right: -5px;">
          {{ patientAlerts.length }}
        </span>
      </button>
    </div>

    <div class="dropdown-menu" role="menu" style="min-width: 350px;">
      <div class="dropdown-content shadow-lg">
        
        <div class="dropdown-item">
          <p class="has-text-weight-bold is-size-5 mb-0">Patient Alerts</p>
        </div>
        <hr class="dropdown-divider">
        
        <div v-if="patientAlerts.length > 0">
          <div v-for="alert in patientAlerts" :key="alert.id" class="dropdown-item is-flex is-justify-content-space-between is-align-items-center">
            <span class="mr-4">{{ alert.text }}</span>
            <button class="button is-small is-success is-light is-rounded" @click.stop="dismissAlert(alert.id)">
              ✔️
            </button>
          </div>
        </div>
        
        <div v-else class="dropdown-item has-text-centered has-text-grey">
          <p>No active alerts for this patient.</p>
        </div>

      </div>
    </div>
  </div>
</template>