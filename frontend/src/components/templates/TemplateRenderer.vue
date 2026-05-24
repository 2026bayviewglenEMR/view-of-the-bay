<template>
  <form class="form">

    <div v-if="checkboxField" class="checkbox-section">

      <label class="section-title">
        {{ checkboxField.label }}
      </label>

      <div class="checkbox-grid">

        <label v-for="option in checkboxField.options" :key="option" class="checkbox-item">
          <input type="checkbox" :value="option" v-model="formData[checkboxField.id]" />

          <span>{{ option }}</span>
        </label>

      </div>

    </div>

    <div class="fields-grid">

      <div v-for="field in normalFields" :key="field.id" class="field">

        <label class="field-label">
          {{ field.label }}
        </label>

        <select v-if="field.type === 'boolean'" v-model="formData[field.id]" class="select">
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

        <TextAreaField v-else-if="field.type === 'textarea'" v-model="formData[field.id]" :field="field"
          :readonly="field.readonly" />
        <input v-if="field.type === 'select' && field.id === 'medication'" v-model="drugSearch" @input="searchDrugs"
          class="select" placeholder="Search medication..." />
        <div v-if="field.id === 'medication' && drugOptions.length > 0" class="drug-options">
          <div v-for="drug in drugOptions" :key="drug.id" class="drug-option" @click="
            formData.medication = drug.id;
          drugSearch = drug.name;
          drugOptions = [];
          checkDrugInteractions();
          ">
            {{ drug.name }}
          </div>
        </div>
        <select v-if="field.type === 'select' && field.id !== 'medication'" v-model="formData[field.id]" class="select"
          @change="field.id === 'medication' && checkDrugInteractions()">
          <option value="">
            Select Option
          </option>

          <option v-for="option in field.id === 'medication' ? drugOptions : field.options" :key="option.id || option"
            :value="option.id || option">
            {{ option.name || option }}
          </option>
        </select>

        <div v-else-if="field.type === 'drug-interaction'" class="drug-interaction-box">
          <div v-if="!formData.medication">
            Select a medication to check drug interactions.
          </div>

          <div v-else-if="drugInteractionResults.length === 0" class="safe">
            No known interactions found with the patient's current medications.
          </div>

          <div v-for="interaction in drugInteractionResults" :key="interaction.drug_id" class="warning">
            <strong>{{ formData.medication }} + {{ interaction.name }}</strong>

            <p>{{ interaction.description }}</p>
          </div>

        </div>

        <TextField v-else-if="field.id !== 'medication'" v-model="formData[field.id]" :field="field"
          :readonly="field.readonly" />

      </div>

    </div>

  </form>
</template>

<script setup>
import {
  reactive,
  computed,
  watch,
  ref
} from "vue";

import { api } from "@/api/api";

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
const drugInteractionResults = ref([]);
const drugOptions = ref([]);
const drugSearch = ref("");
const loadDrugOptions =
  async () => {

    try {

      const response =
        await api.getDrugs("a");

      drugOptions.value =
        response.data;

    }

    catch (err) {

      console.log(err);

      drugOptions.value = [];

    }

  };
const searchDrugs =
  async () => {

    if (!drugSearch.value) {

      drugOptions.value = [];

      return;

    }

    try {

      const response =
        await api.getDrugs(
          drugSearch.value
        );

      drugOptions.value =
        response.data;

    }

    catch (err) {

      console.log(err);

    }

  };

const checkDrugInteractions =
  async () => {

    if (
      !formData.medication ||
      !formData.current_medications
    ) {

      drugInteractionResults.value = [];

      return;
    }


    const selectedDrugId =
      formData.medication;
    drugInteractionResults.value = [];

    const currentMeds =
      formData.current_medications
        .split("\n")
        .map(
          med =>
            med
              .split(" ")[0]
              .trim()
        );

    for (
      const med
      of currentMeds
    ) {

      try {

        const search =
          await api.getDrugs(med);

        const matched =
          search.data?.[0];

        if (!matched)
          continue;

        const interactions =
          await api.getInteractions(
            selectedDrugId,
            matched.id
          );

        drugInteractionResults.value
          .push(
            ...interactions
          );

      }

      catch (err) {

        console.log(err);

      }

    }

    formData.drug_interactions =
      drugInteractionResults.value
        .map(interaction =>
          `${formData.medication} + ${interaction.name}: ${interaction.description}`
        )
        .join("\n");

  };

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
  width: 100%;
  max-width: 1100px;

  background: white;

  border-radius: 20px;

  padding: 36px;

  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.06);

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

  min-width: 0;

  display: block;

  padding: 14px;

  border-radius: 12px;

  border: 2px solid #d1d5db;

  font-size: 15px;

  background: white;

  box-sizing: border-box;
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

.drug-options {
  border: 2px solid #d1d5db;
  border-radius: 12px;
  background: white;
  max-height: 220px;
  overflow-y: auto;
}

.drug-option {
  padding: 12px 14px;
  cursor: pointer;
}

.drug-option:hover {
  background: #f3f4f6;
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

.drug-interaction-box {
  min-height: 90px;
  padding: 14px;
  border-radius: 12px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  color: #10231b;
}

.safe {
  background: #dcebd9;
  color: #1b4332;
  padding: 12px;
  border-radius: 10px;
  font-weight: 700;
}

.warning {
  background: #fff0c7;
  border-left: 6px solid #ffc800;
  padding: 12px;
  border-radius: 10px;
  margin-top: 10px;
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