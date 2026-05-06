<template>
  <div class="template-use-page">
    <h1>Use Template</h1>

    <select v-model="selectedTemplateId">
      <option disabled value="">Select template</option>
      <option
        v-for="template in templates"
        :key="template.id"
        :value="template.id"
      >
        {{ template.name }}
      </option>
    </select>

    <TemplateRenderer
      v-if="selectedTemplate"
      :template="selectedTemplate"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { getTemplates } from "@/templates/templateSystem";
import TemplateRenderer from "@/components/templates/TemplateRenderer.vue";

const route = useRoute();
const patientId = route.params.patientId;

const templates = ref(getTemplates());
const selectedTemplateId = ref("");

const selectedTemplate = computed(() =>
  templates.value.find(t => t.id === selectedTemplateId.value)
);

function handleSubmit(data) {
  console.log("Saved for patient", patientId, data);
}
</script>