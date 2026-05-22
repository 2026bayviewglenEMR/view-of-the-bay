<template>
  <div class="templates-page">

    <h1 class="title">
      Patient Examination
    </h1>

    <TemplateRenderer
      :template="currentTemplate"
      :initialData="allForms[currentTemplate.id] || {}"
      @update="updateFormData"
    />

    <div class="navigation-buttons">

      <button
        v-if="currentIndex > 0"
        class="back-btn"
        @click="previousTemplate"
      >
        Back
      </button>

      <button
        v-if="!isLastPage"
        class="next-btn"
        :class="{ disabled: !canGoNext }"
        :disabled="!canGoNext"
        @click="nextTemplate"
      >
        Next
      </button>

      <button
        v-else
        class="save-btn"
        :class="{ disabled: !canGoNext }"
        :disabled="!canGoNext"
        @click="saveAllForms"
      >
        Save Examination
      </button>

    </div>

  </div>
</template>

<script setup>
import {
  ref,
  computed,
  watch
} from "vue";

import { useRoute } from "vue-router";

import { getTemplates }
from "@/templates/templateSystem";

import TemplateRenderer
from "@/components/templates/TemplateRenderer.vue";

const route = useRoute();

const patientId =
  route.params.patientId;

const templates =
  ref(getTemplates());

const currentIndex =
  ref(0);

const currentTemplate =
  computed(() =>
    templates.value[currentIndex.value]
  );

const isLastPage =
  computed(() =>
    currentIndex.value ===
    templates.value.length - 1
  );

const allForms =
  ref({});

const currentFormData =
  ref({});

watch(
  currentTemplate,
  () => {

    const savedData =
      allForms.value[
        currentTemplate.value.id
      ];

    currentFormData.value =
      savedData
      ? { ...savedData }
      : {};

  },
  { immediate: true }
);

function updateFormData(data) {

  currentFormData.value = {
    ...data
  };

}

const canGoNext =
  computed(() => {

    if (!currentTemplate.value) {
      return false;
    }

    return currentTemplate.value.fields.some(field => {

      const value =
        currentFormData.value[field.id];

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      if (field.type === "boolean") {
        return value === true ||
               value === false;
      }

      return value !== "" &&
             value !== null &&
             value !== undefined;

    });

  });

function nextTemplate() {

  if (!canGoNext.value) return;

  allForms.value[
    currentTemplate.value.id
  ] = {
    ...currentFormData.value
  };

  currentIndex.value++;

}

function previousTemplate() {

  allForms.value[
    currentTemplate.value.id
  ] = {
    ...currentFormData.value
  };

  if (currentIndex.value > 0) {
    currentIndex.value--;
  }

}

async function saveAllForms() {

  if (!canGoNext.value) return;

  allForms.value[
    currentTemplate.value.id
  ] = {
    ...currentFormData.value
  };

  const payload = {
    patientId,
    forms: allForms.value
  };

  console.log(payload);

  /*
  LATER:
  await axios.post(
    "/api/consultation/complete",
    payload
  );
  */

  alert(
    "Patient examination saved successfully"
  );

}
</script>

<style scoped>

.templates-page {
  min-height: 100vh;

  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 32px;

  background: #e8e4cf;
}

.title {
  font-size: 52px;
  font-weight: 700;

  color: #10231b;

  margin-bottom: 28px;
}

.navigation-buttons {
  display: flex;

  gap: 18px;

  margin-top: 26px;
  margin-bottom: 20px;
}

.back-btn,
.next-btn,
.save-btn {
  padding: 14px 34px;

  border: none;
  border-radius: 12px;

  font-size: 16px;
  font-weight: 700;

  cursor: pointer;

  transition: all 0.2s ease;
}

.back-btn {
  background: #d9d9d9;
  color: black;
}

.next-btn {
  background: #2e7d32;
  color: white;
}

.save-btn {
  background: #2e7d32;
  color: white;
}

.next-btn:hover,
.save-btn:hover,
.back-btn:hover {
  transform: translateY(-1px);
}

.disabled {
  background: #bdbdbd !important;
  cursor: not-allowed;
  opacity: 0.75;
  transform: none !important;
}

</style>