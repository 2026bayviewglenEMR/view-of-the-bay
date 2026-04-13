<template>
  <form class="template-form" @submit.prevent="handleSubmit">
    <div v-for="field in template.fields" :key="field.model" class="field">
      <label :for="field.model">{{ field.label }}</label>

      <TextField
        v-if="field.type === 'text'"
        :field="field"
        v-model="formData[field.model]"
      />

      <TextArea
        v-else-if="field.type === 'textarea'"
        :field="field"
        v-model="formData[field.model]"
      />

      <input
        v-else-if="field.type === 'checkbox'"
        :id="field.model"
        type="checkbox"
        v-model="formData[field.model]"
      />
    </div>

    <button type="submit">{{ template.submitLabel || 'Save' }}</button>
  </form>
</template>

<script setup>
import { reactive, watch } from "vue";
import TextField from "./fields/TextField.vue";
import TextArea from "./fields/TextArea.vue";

const props = defineProps({
  template: { type: Object, required: true },
});

const emit = defineEmits(["submit"]);

const formData = reactive({});

watch(
  () => props.template,
  (template) => {
    Object.keys(formData).forEach((key) => {
      delete formData[key];
    });

    if (!template?.fields) return;

    template.fields.forEach((field) => {
      formData[field.model] = field.type === "checkbox" ? field.default ?? false : field.default ?? "";
    });
  },
  { immediate: true }
);

function handleSubmit() {
  emit("submit", { ...formData });
}
</script>

<style scoped>
.template-form {
  display: grid;
  gap: 18px;
  padding: 18px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: #ffffff;
}

.field {
  display: grid;
  gap: 10px;
}

.field label {
  font-weight: 600;
}

input[type="checkbox"] {
  width: auto;
}

button {
  width: fit-content;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #1d4ed8;
}
</style>
