<template>
  <div>
    <h1>Select Template</h1>

    <ul>
      <li v-for="t in templates" :key="t.name">
        <button @click="selectTemplate(t)">
          {{ t.name }}
        </button>
      </li>
    </ul>

    <TemplateRenderer
      v-if="selectedTemplate"
      :template="selectedTemplate"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getTemplates } from "@/templates/templateSystem";
import TemplateRenderer from "@/components/templates/TemplateRenderer.vue";

const templates = getTemplates();
const selectedTemplate = ref(null);

function selectTemplate(t) {
  selectedTemplate.value = t;
}
</script>