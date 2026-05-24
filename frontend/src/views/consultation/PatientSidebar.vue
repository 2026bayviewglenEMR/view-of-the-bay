<template>
  <div class="patient-panel">
    <h2 class="panel-title">🏥 Patient Summary</h2>
    
    <div class="panel-section">
      <div class="patient-name">{{ patient.firstName }} {{ patient.lastName }}</div>
      <div class="patient-meta" v-if="patient.dateOfBirth">
        DOB: {{ new Date(patient.dateOfBirth).toLocaleDateString() }}
      </div>
      <div class="patient-meta" v-if="patient.gender">Gender: {{ patient.gender }}</div>
    </div>
    
    <div class="panel-section">
      <h3 class="panel-section-title">⚠️ Allergies</h3>
      <ul class="panel-list" v-if="patient.executiveSummary?.allergies?.length">
        <li v-for="a in patient.executiveSummary.allergies" :key="a" class="allergy-item">{{ a }}</li>
      </ul>
      <p class="panel-empty" v-else>None listed</p>
    </div>
    
    <div class="panel-section">
      <h3 class="panel-section-title">💊 Medications</h3>
      <ul class="panel-list" v-if="patient.executiveSummary?.activeMedications?.length">
        <li v-for="med in patient.executiveSummary.activeMedications" :key="med.name">
          {{ med.name }} {{ med.dosage }}
        </li>
      </ul>
      <p class="panel-empty" v-else>None listed</p>
    </div>
    
    <div class="panel-section" v-if="patient.clinicalHistory?.conditions?.length">
      <h3 class="panel-section-title">🩺 Conditions</h3>
      <ul class="panel-list">
        <li v-for="c in patient.clinicalHistory.conditions" :key="c">{{ c }}</li>
      </ul>
    </div>
    
    <div class="panel-section" v-if="patient.clinicalHistory?.surgeries?.length">
      <h3 class="panel-section-title">🔪 Surgeries</h3>
      <ul class="panel-list">
        <li v-for="s in patient.clinicalHistory.surgeries" :key="s">{{ s }}</li>
      </ul>
    </div>

    <div class="panel-section" v-if="pendingTests.length">
      <h3 class="panel-section-title">🧪 Ordered Tests</h3>
      <ul class="panel-list">
        <li v-for="t in pendingTests" :key="t._id" class="ordered-test-item">
          <span class="ordered-test-name">{{ t.testName }}</span>
          <span class="ordered-test-meta">{{ t.orderedBy }} · {{ new Date(t.orderedAt).toLocaleDateString() }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  patient: {
    type: Object,
    required: true
  }
});

// Calculate pending tests locally within the sidebar
const pendingTests = computed(() =>
  (props.patient?.orderedTests || []).filter(t => t.status === 'pending')
);
</script>

<style scoped>
.patient-panel {
  width: 220px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #2D6A4F;
  align-self: flex-start;
  position: sticky;
  top: 0;
  transition: width 0.3s ease, padding 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}
.panel-title {
  font-size: 15px;
  font-weight: 700;
  color: #10231b;
  margin: 0 0 14px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e4cf;
}
.panel-section {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}
.panel-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}
.patient-name {
  font-size: 14px;
  font-weight: 700;
  color: #10231b;
}
.patient-meta {
  font-size: 12px;
  color: #777;
  margin-top: 2px;
}
.panel-section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #555;
  margin: 0 0 6px 0;
}
.panel-list {
  padding-left: 14px;
  margin: 0;
  font-size: 12px;
  color: #333;
}
.panel-list li {
  margin-bottom: 3px;
}
.allergy-item {
  color: #b91c1c;
  font-weight: 600;
}
.panel-empty {
  font-size: 12px;
  color: #aaa;
  font-style: italic;
}
.ordered-test-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
}
.ordered-test-name {
  font-size: 12px;
  font-weight: 600;
  color: #10231b;
}
.ordered-test-meta {
  font-size: 10px;
  color: #888;
}
</style>