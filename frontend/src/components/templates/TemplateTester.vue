<template>
  <div class="template">
    <h2>{{ template.name }}</h2>

    <form @submit.prevent="handleSubmit">
      <div v-for="field in template.fields" :key="field.model" class="field">
        <label>{{ field.label }}</label>

        <!-- TEXT -->
        <input
          v-if="field.type === 'text'"
          v-model="formData[field.model]"
          type="text"
        />

        <!-- TEXTAREA -->
        <textarea
          v-else-if="field.type === 'textarea'"
          v-model="formData[field.model]"
        />

        <!-- CHECKBOX -->
        <input
          v-else-if="field.type === 'checkbox'"
          type="checkbox"
          v-model="formData[field.model]"
        />
      </div>

      <button type="submit">Save</button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const props = defineProps({
  template: Object
});

const formData = reactive({});

// initialize fields
props.template.fields.forEach(field => {
  formData[field.model] = "";
});

function handleSubmit() {
  console.log("Saved Data:", formData);

  // later: send to backend
}
</script>

<style scoped>
.template {
  max-width: 600px;
}
.field {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}
</style>