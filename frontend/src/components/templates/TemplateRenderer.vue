<template>
  <div class="template-renderer">
    <h2>{{ template.name }}</h2>
    <p v-if="template.description" class="description">
      {{ template.description }}
    </p>

    <TemplateForm :template="template" @submit="handleSubmit" />

    <div v-if="savedData" class="saved-result">
      <h3>Saved data</h3>
      <pre>{{ JSON.stringify(savedData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import TemplateForm from "./TemplateForm.vue";

const props = defineProps({
  template: { type: Object, required: true },
});

const savedData = ref(null);

function handleSubmit(formData) {
  savedData.value = formData;
  console.log("Saved template data:", formData);
}
</script>

<style scoped>
.template-renderer {
  max-width: 760px;
  margin-top: 24px;
}
.description {
  margin: 0 0 16px;
  color: #4b5563;
}
.saved-result {
  margin-top: 24px;
  padding: 18px;
  background: #f3f4f6;
  border-radius: 10px;
  border: 1px solid #d1d5db;
}
.saved-result pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
