<template>
  <div class="template-use-page">
    <div class="page-header">
      <h1>Use a Template</h1>
      <p>Select a template and fill the fields below.</p>
    </div>

    <div class="template-picker">
      <label for="template-select">Choose template</label>

      <select id="template-select" v-model="selectedTemplateId">
        <option disabled value="">Select template</option>
        <option
          v-for="template in templates"
          :key="template.id"
          :value="template.id"
        >
          {{ template.name }}
        </option>
      </select>
    </div>

    <TemplateRenderer
      v-if="selectedTemplate"
      :template="selectedTemplate"
      @submit="handleSubmit"
    />

    <div v-if="savedData" class="saved-result">
      <h2>Saved Template Data</h2>

      <ul>
        <li v-for="(value, key) in savedData.data" :key="key">
          <strong>{{ formatKey(key) }}:</strong>
          {{ formatValue(value) }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { getTemplates } from "@/templates/templateSystem";
import TemplateRenderer from "@/components/templates/TemplateRenderer.vue";

const route = useRoute();
const patientId = route.params.patientId || "demo";

const templates = getTemplates();

const selectedTemplateId = ref("");

const selectedTemplate = computed(() =>
  templates.find(t => t.id === selectedTemplateId.value)
);

const savedData = ref(null);

function handleSubmit(formData) {
  const record = {
    patientId,
    templateId: selectedTemplateId.value,
    data: formData,
    date: new Date().toISOString()
  };

  savedData.value = record;

  const key = `patient_${patientId}_templates`;
  const existing = JSON.parse(localStorage.getItem(key) || "[]");

  existing.push(record);
  localStorage.setItem(key, JSON.stringify(existing));

  console.log("Saved record:", record);
}

function formatKey(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatValue(val) {
  if (typeof val === "boolean") return val ? "Yes" : "No";
  return val || "—";
}
</script>

<style scoped>
.template-use-page {
  max-width: 860px;
  margin: 24px auto;
  padding: 0 16px;
}

/* Header */
.page-header {
  margin-bottom: 20px;
}

/* Picker */
.template-picker {
  margin-bottom: 20px;
  display: grid;
  gap: 10px;
}

.template-picker label {
  font-weight: 600;
}

.template-picker select {
  max-width: 320px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: white;
}

.saved-result {
  margin-top: 28px;
  padding: 18px;
  border-radius: 12px;
  background: white;
  border: 1px solid var(--border-color);
}
</style>