<template>
  <form @submit.prevent="submitForm" class="form">
 
    <div v-for="field in template.fields" :key="field.id" class="field">
      <label>{{ field.label }}</label>
 
      <!-- QUICK MODE -->
      <button v-if="mode === 'quick'" type="button" class="toggle" :class="{ active: formData[field.id] }"
        @click="toggle(field)">
        {{ formData[field.id] ? "Yes" : "No" }}
      </button>
 
      <!-- BOOLEAN DROPDOWN -->
      <select v-else-if="field.type === 'boolean'" v-model="formData[field.id]" class="select">
        <option disabled value="">Select Option</option>
        <option :value="true">Yes</option>
        <option :value="false">No</option>
      </select>
      <!-- CHECKBOX GROUP -->
      <div v-else-if="field.type === 'checkbox-group'" class="checkbox-group">
        <label v-for="option in field.options" :key="option" class="checkbox-option">
          <input type="checkbox" :value="option" v-model="formData[field.id]" />
 
          {{ option }}
        </label>
      </div>
      <!-- TEXT / TEXTAREA -->
      <component v-else :is="getComponent(field.type)" v-model="formData[field.id]" :field="field" />
    </div>
 
    <button type="submit" class="submit">
      Save
    </button>
 
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
    if (!props.template) return;
 
    props.template.fields.forEach(field => {
      formData[field.id] =
        field.type === "boolean"
          ? ""
          : field.default ?? "";
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
  max-width: 900px;
  margin: 40px auto;
  padding: 32px;
 
  background: white;
  border-radius: 16px;
 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
 
  display: flex;
  flex-direction: column;
  gap: 24px;
}
 
.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
 
label {
  color: #222;
  font-size: 18px;
  font-weight: 600;
}
 
.toggle {
  width: fit-content;
  padding: 10px 18px;
 
  border-radius: 10px;
  border: 2px solid #ccc;
 
  background: white;
  cursor: pointer;
 
  transition: 0.2s ease;
}
 
.toggle.active {
  background: #2e7d32;
  color: white;
  border-color: #2e7d32;
}
 
.select {
  width: 220px;
 
  padding: 12px;
 
  border-radius: 10px;
  border: 2px solid #ccc;
 
  background: white;
  font-size: 16px;
}
 
.submit {
  width: fit-content;
 
  margin: 20px auto 0 auto;
 
  padding: 12px 28px;
 
  background: #2e7d32;
  color: white;
 
  border: none;
  border-radius: 10px;
 
  cursor: pointer;
 
  font-size: 16px;
  font-weight: 600;
 
  transition: background 0.2s ease;
}
 
.submit:hover {
  background: #256628;
}
</style>