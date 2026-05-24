<template>
  <MainLayout>
    <div>
      <h1>Select Template</h1>

      <p v-if="isLoading">
        Loading templates...
      </p>

      <p v-else-if="error">
        {{ error }}
      </p>

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
  </MainLayout>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getTemplates } from "@/api/template";
import TemplateRenderer from "@/components/templates/TemplateRenderer.vue";
import MainLayout from '../components/MainLayout.vue'

const templates = ref([]);
const selectedTemplate = ref(null);
const isLoading = ref(false);
const error = ref("");

function selectTemplate(t) {
  selectedTemplate.value = t;
}

async function loadTemplates() {
  isLoading.value = true;
  error.value = "";

  try {
    templates.value = await getTemplates();
  } catch (err) {
    error.value =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Unable to load templates.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadTemplates);
</script>
