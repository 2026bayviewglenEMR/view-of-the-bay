<template>
  <div class="templates-page">

    <!-- TITLE -->
    <h1 class="title">
      Patient Examination
    </h1>

    <!-- CURRENT FORM -->
    <TemplateRenderer :template="currentTemplate" :initialData="allForms[currentTemplate.id]"
      @update="updateFormData" />

    <!-- NAVIGATION -->
    <div class="navigation-buttons">

      <!-- BACK -->
      <button v-if="currentIndex > 0" class="back-btn" @click="previousTemplate">
        Back
      </button>

      <!-- NEXT -->
      <button v-if="currentIndex < templates.length - 1" class="next-btn" :disabled="!canGoNext"
        :class="{ disabled: !canGoNext }" @click="nextTemplate">
        Next
      </button>

      <!-- SAVE -->
      <button v-else class="save-btn" :disabled="!canGoNext" :class="{ disabled: !canGoNext }" @click="saveAllForms">
        Save
      </button>

    </div>

  </div>
</template>

<script setup>
import {
  ref,
  computed
} from "vue";

import {
  useRoute
} from "vue-router";

import {
  getTemplates
} from "@/templates/templateSystem";

import TemplateRenderer from
  "@/components/templates/TemplateRenderer.vue";

/* ROUTE */
const route = useRoute();

const patientId =
  route.params.patientId;

/* ALL TEMPLATES */
const templates =
  ref(getTemplates());

/* CURRENT STEP */
const currentIndex =
  ref(0);

/* CURRENT TEMPLATE */
const currentTemplate =
  computed(() =>
    templates.value[currentIndex.value]
  );

/* STORED FORMS */
const allForms =
  ref({});

/* CURRENT FORM DATA */
const currentFormData =
  ref({});

/* LIVE FORM UPDATE */
function updateFormData(data) {
  currentFormData.value = data;
}

/* VALIDATION */
const canGoNext = computed(() => {

  if (!currentTemplate.value) {
    return false;
  }

  return currentTemplate.value.fields.some(field => {

    const value =
      currentFormData.value[field.id];

    /* CHECKBOX GROUP */
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    /* BOOLEAN */
    if (field.type === "boolean") {
      return value === true ||
             value === false;
    }

    /* TEXT / TEXTAREA */
    return value !== "" &&
           value !== null &&
           value !== undefined;

  });

});

/* NEXT TEMPLATE */
function nextTemplate() {

  if (!canGoNext.value) return;

  /* save current form */
  allForms.value[
    currentTemplate.value.id
  ] = {
    ...currentFormData.value
  };

  /* Next button */
  currentIndex.value++;
}

/* Prev template */
function previousTemplate() {

  if (currentIndex.value === 0) return;

  /* save current form */
  allForms.value[
    currentTemplate.value.id
  ] = {
    ...currentFormData.value
  };

  /* Go back previous */
  currentIndex.value--;
}

/* Save everything */
function saveAllForms() {

  /* Saving final form */
  allForms.value[
    currentTemplate.value.id
  ] = {
    ...currentFormData.value
  };

  console.log(
    "Patient:",
    patientId
  );

  console.log(
    "All Forms:",
    allForms.value
  );

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

/* Title card */
.title {
  font-size: 52px;
  font-weight: 700;

  color: #10231b;

  margin-bottom: 28px;
}

/* BUTTON ROW */
.navigation-buttons {
  display: flex;

  gap: 18px;

  margin-top: 26px;
}

/* buttons */
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

/* Back button */
.back-btn {
  background: #d9d9d9;
  color: black;
}

/* Next button */
.next-btn {
  background: #2e7d32;
  color: white;
}

/* Save button */
.save-btn {
  background: #2e7d32;
  color: white;
}

/* Disable next button */
.disabled {
  background: #bdbdbd !important;

  cursor: not-allowed;

  opacity: 0.75;
}
</style>