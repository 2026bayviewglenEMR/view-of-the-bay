<template>
  <div class="template-use-page">
    <div class="page-header">
      <h1>Use a Template</h1>
      <p>Select a template and fill the fields below to preview the output.</p>
    </div>

    <div class="template-picker">
      <label for="template-select">Choose template</label>
      <select id="template-select" v-model="selectedTemplateName">
        <option
          v-for="template in templates"
          :key="template.name"
          :value="template.name"
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
      <h2>Saved template data</h2>
      <pre>{{ JSON.stringify(savedData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getTemplates, getTemplateByName } from '@/templates/templateSystem'
import TemplateRenderer from '@/components/templates/TemplateRenderer.vue'

const templates = getTemplates()
const selectedTemplateName = ref(templates[0]?.name || '')
const savedData = ref(null)

const selectedTemplate = computed(() => getTemplateByName(selectedTemplateName.value))

function handleSubmit(formData) {
  savedData.value = formData
  console.log('TemplateUse savedData:', formData)
}
</script>

<style scoped>
.template-use-page {
  max-width: 860px;
  margin: 24px auto;
  padding: 0 16px;
}

.page-header {
  margin-bottom: 20px;
}

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
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #ffffff;
}

.saved-result {
  margin-top: 28px;
  padding: 18px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.saved-result pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
