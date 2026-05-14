<template>
  <form @submit.prevent="submitForm" class="form">
    <div v-for="field in template.fields" :key="field.id" class="field">
      <label>{{ field.label }}</label>

      <!-- QUICK MODE -->
      <button
        v-if="mode === 'quick'"
        type="button"
        class="toggle"
        :class="{ active: formData[field.id] }"
        @click="toggle(field)"
      >
        {{ formData[field.id] ? "Yes" : "No" }}
      </button>

      <!-- FULL MODE -->
      <component
        v-else
        :is="getComponent(field.type)"
        v-model="formData[field.id]"
        :field="field"
      />
    </div>

    <button class="submit">Save</button>
  </form>
</template>

<script setup>
import { reactive, watch } from "vue";

import TextField from "./fields/TextField.vue";
import TextAreaField from "./fields/TextAreaField.vue";

const props = defineProps({
  template: Object,
  mode: String
});

const emit = defineEmits(["submit"]);

const formData = reactive({});

watch(
  () => props.template,
  () => {
    props.template.fields.forEach(f => {
      formData[f.id] = f.default ?? (f.type === "boolean" ? false : "");
    });
  },
  { immediate: true }
);

function toggle(field) {
  formData[field.id] = !formData[field.id];
}

function submitForm() {
  emit("submit", { ...formData });
}

function getComponent(type) {
  switch (type) {
    case "textarea":
      return TextAreaField;
    default:
      return TextField;
  }
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

label {
  color: white;
}

.toggle {
  background: white;
  border-radius: 8px;
  padding: 8px;
}

.toggle.active {
  background: var(--primary-green-light);
  color: white;
}

.submit {
  margin-top: 10px;
  padding: 10px;
  background: var(--primary-green-dark);
  color: white;
  border: none;
  border-radius: 8px;
}
</style>