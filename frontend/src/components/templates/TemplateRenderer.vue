<template>
  <form class="form">

    <div
      v-if="checkboxField"
      class="checkbox-section"
    >

      <label class="section-title">
        {{ checkboxField.label }}
      </label>

      <div class="checkbox-grid">

        <label
          v-for="option in checkboxField.options"
          :key="option"
          class="checkbox-item"
        >
          <input
            type="checkbox"
            :value="option"
            v-model="formData[checkboxField.id]"
          />

          <span>{{ option }}</span>
        </label>

      </div>

    </div>

    <div class="fields-grid">

      <div
        v-for="field in normalFields"
        :key="field.id"
        class="field"
      >

        <label class="field-label">
          {{ field.label }}
        </label>

        <select
          v-if="field.type === 'boolean'"
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

        <TextAreaField
          v-else-if="field.type === 'textarea'"
          v-model="formData[field.id]"
          :field="field"
        />

        <TextField
          v-else
          v-model="formData[field.id]"
          :field="field"
        />

      </div>

    </div>

  </form>
</template>

<script setup>
import {
  reactive,
  computed,
  watch
} from "vue";

import TextField
from "./fields/TextField.vue";

import TextAreaField
from "./fields/TextAreaField.vue";

const props = defineProps({
  template: Object,
  initialData: Object
});

const emit =
  defineEmits(["update"]);

const formData =
  reactive({});

watch(
  () => props.template,
  () => {

    if (!props.template) return;

    props.template.fields.forEach(field => {

      const savedValue =
        props.initialData?.[field.id];

      if (savedValue !== undefined) {

        formData[field.id] =
          savedValue;

        return;
      }

      if (field.type === "boolean") {

        formData[field.id] = "";

      }

      else if (
        field.type === "checkbox-group"
      ) {

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

watch(
  formData,
  () => {

    emit("update", {
      ...formData
    });

  },
  {
    deep: true
  }
);

const checkboxField =
  computed(() =>
    props.template?.fields.find(
      field =>
        field.type ===
        "checkbox-group"
    )
  );

const normalFields =
  computed(() =>
    props.template?.fields.filter(
      field =>
        field.type !==
        "checkbox-group"
    ) || []
  );
</script>

<style scoped>

.form {
  width: 1100px;

  background: white;

  border-radius: 20px;

  padding: 36px;

  box-shadow:
    0 4px 10px rgba(0,0,0,0.06);

  display: flex;
  flex-direction: column;

  gap: 32px;
}

.fields-grid {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 26px;
}

.field {
  display: flex;
  flex-direction: column;

  gap: 10px;
}

.field-label,
.section-title {
  font-size: 17px;
  font-weight: 700;

  color: #1f2937;
}

.select {
  width: 100%;

  padding: 14px;

  border-radius: 12px;

  border: 2px solid #d1d5db;

  font-size: 15px;

  background: white;
}

.checkbox-section {
  display: flex;
  flex-direction: column;

  gap: 18px;
}

.checkbox-grid {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 18px;

  padding: 24px;

  background: #f9fafb;

  border: 2px solid #e5e7eb;

  border-radius: 16px;
}

.checkbox-item {
  display: flex;
  align-items: center;

  gap: 12px;

  font-size: 15px;
  font-weight: 500;

  color: #111827;
}

.checkbox-item input {
  width: 18px;
  height: 18px;

  cursor: pointer;
}

@media (max-width: 1100px) {

  .form {
    width: 95%;
  }

  .fields-grid {
    grid-template-columns: 1fr;
  }

  .checkbox-grid {
    grid-template-columns: 1fr;
  }

}

</style>