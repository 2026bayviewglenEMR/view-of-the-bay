<template>
  <form class="form">

    <div
      v-for="field in template.fields"
      :key="field.id"
      class="field"
    >

      <!-- LABEL -->
      <label class="field-label">
        {{ field.label }}
      </label>

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

      <!-- BOOLEAN -->
      <select
        v-else-if="field.type === 'boolean'"
        v-model="formData[field.id]"
        class="select"
      >
        <option disabled value="">
          Select Option
        </option>

        <option :value="true">
          Yes
        </option>

        <option :value="false">
          No
        </option>
      </select>

      <!-- CHECKBOX GROUP -->
      <div
        v-else-if="field.type === 'checkbox-group'"
        class="checkbox-group"
      >
        <div class="checkbox-grid">

          <label
            v-for="option in field.options"
            :key="option"
            class="checkbox-item"
          >
            <input
              type="checkbox"
              :value="option"
              v-model="formData[field.id]"
            />

            <span>{{ option }}</span>
          </label>

        </div>
      </div>

      <!-- TEXT / TEXTAREA -->
      <component
        v-else
        :is="getComponent(field.type)"
        v-model="formData[field.id]"
        :field="field"
      />

    </div>

  </form>
</template>

<script setup>
import {
  reactive,
  watch
} from "vue";

import TextField from "./fields/TextField.vue";
import TextAreaField from "./fields/TextAreaField.vue";

const props = defineProps({
  template: Object,
  mode: String,
  initialData: Object
});

const emit = defineEmits([
  "submit",
  "update"
]);

const formData = reactive({});

/* INITIALIZE FORM */
watch(
  () => props.template,
  () => {

    if (!props.template) return;

    props.template.fields.forEach(field => {

      const savedValue =
        props.initialData?.[field.id];

      /* LOAD SAVED DATA */
      if (savedValue !== undefined) {
        formData[field.id] = savedValue;
        return;
      }

      /* BOOLEAN */
      if (field.type === "boolean") {
        formData[field.id] = "";
      }

      /* CHECKBOX GROUP */
      else if (field.type === "checkbox-group") {
        formData[field.id] = [];
      }

      else {
        formData[field.id] =
          field.default ?? "";
      }

    });

  },
  {
    immediate: true
  }
);

/* LIVE UPDATE */
watch(
  formData,
  () => {
    emit("update", { ...formData });
  },
  {
    deep: true
  }
);

/* QUICK TOGGLE */
function toggle(field) {
  formData[field.id] =
    !formData[field.id];
}

/* FIELD COMPONENTS */
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

/* FORM */
.form {
  width: 950px;
  margin: 0 auto;
  padding: 36px;
  background: white;
  border-radius: 18px;
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.06);

  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* FIELD */
.field {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* LABEL */
.field-label {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

/* TOGGLE */
.toggle {
  width: fit-content;
  padding: 10px 18px;
  border-radius: 10px;
  border: 2px solid #d1d5db;
  background: white;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.toggle:hover {
  border-color: #2e7d32;
}

.toggle.active {
  background: #2e7d32;
  color: white;
  border-color: #2e7d32;
}

/* SELECT */
.select {
  width: 220px;
  padding: 12px;
  border-radius: 10px;
  border: 2px solid #d1d5db;
  background: white;
  font-size: 15px;
}

/* CHECKBOX GROUP */
.checkbox-group {
  width: 100%;
}

/* CHECKBOX GRID */
.checkbox-grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(220px, 1fr));

  gap: 16px;
  padding: 22px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
}

/* CHECKBOX ITEM */
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #111827;
}

/* CHECKBOX */
.checkbox-item input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

</style>