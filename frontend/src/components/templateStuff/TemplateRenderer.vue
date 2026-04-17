<template>
  <div class="template-renderer">
    <h2>{{ template.name }}</h2>

    <p v-if="template.description" class="description">
      {{ template.description }}
    </p>

    <!-- Mode toggle -->
    <div class="mode-toggle">
      <button :class="{ active: mode === 'quick' }" @click="mode = 'quick'">
        Quick
      </button>
      <button :class="{ active: mode === 'full' }" @click="mode = 'full'">
        Full
      </button>
    </div>

    <TemplateForm
      :template="template"
      :mode="mode"
      @submit="handleSubmit"
    />

    <!-- Summary -->
    <div v-if="savedData" class="saved-result">
      <h3>Summary</h3>
      <ul>
        <li v-for="(value, key) in savedData" :key="key">
          <strong>{{ formatKey(key) }}:</strong>
          {{ formatValue(value) }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import TemplateForm from "./TemplateForm.vue";

const props = defineProps({
  template: Object
});

const mode = ref("quick");
const savedData = ref(null);

function handleSubmit(data) {
  savedData.value = data;
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
.template-renderer {
  max-width: 760px;
  margin-top: 24px;
  background: var(--primary-green);
  padding: 20px;
  border-radius: 12px;
  color: white;
}

.description {
  color: #e5e7eb;
}

.mode-toggle {
  display: flex;
  gap: 10px;
  margin: 16px 0;
}

.mode-toggle button {
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: white;
  cursor: pointer;
}

.mode-toggle button.active {
  background: var(--primary-green-light);
  color: white;
}

.saved-result {
  margin-top: 20px;
  background: white;
  color: var(--text-dark);
  padding: 16px;
  border-radius: 10px;
}
</style>