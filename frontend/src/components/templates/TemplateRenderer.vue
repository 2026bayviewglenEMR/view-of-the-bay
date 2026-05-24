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
        <div v-else-if="field.type === 'drug-list'" class="drug-list-box">

          <input v-model="drugListSearch[field.id]" @input="searchDrugList(field.id)" class="select"
            placeholder="Search current medication..." />

          <div v-if="drugListOptions[field.id]?.length > 0" class="drug-options">
            <div v-for="drug in drugListOptions[field.id]" :key="drug.id" class="drug-option"
              @click="addCurrentMedication(field.id, drug)">
              {{ drug.name }}
            </div>
          </div>

          <div class="selected-drugs">
            <div v-for="(drug, index) in formData[field.id]" :key="drug.id" class="selected-drug">
              {{ drug.name }}
              <button type="button" @click="removeCurrentMedication(field.id, index)">×</button>
            </div>
          </div>

        </div>
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

        <TextField v-else-if="field.id !== 'medication' && field.type !== 'drug-list'" v-model="formData[field.id]"
          :field="field" :readonly="field.readonly" />

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
const drugListSearch = ref({});
const drugListOptions = ref({});
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
const searchDrugList = async (fieldId) => {
  const query = drugListSearch.value[fieldId];

  if (!query) {
    drugListOptions.value[fieldId] = [];
    return;
  }

  try {
    const response = await api.getDrugs(query);
    drugListOptions.value[fieldId] = response.data;
  } catch (err) {
    console.log(err);
    drugListOptions.value[fieldId] = [];
  }
};

const addCurrentMedication = (fieldId, drug) => {
  if (!Array.isArray(formData[fieldId])) {
    formData[fieldId] = [];
  }

  const alreadyAdded = formData[fieldId].some(
    med => med.id === drug.id
  );

  if (!alreadyAdded) {
    formData[fieldId].push({
      id: drug.id,
      name: drug.name
    });
  }

  drugListSearch.value[fieldId] = "";
  drugListOptions.value[fieldId] = [];

  checkDrugInteractions();
};

const removeCurrentMedication = (fieldId, index) => {
  formData[fieldId].splice(index, 1);
  checkDrugInteractions();
};

const checkDrugInteractions =
  async () => {

    if (
      !formData.medication ||
      !Array.isArray(formData.current_medications) ||
      formData.current_medications.length === 0
    ) {

      drugInteractionResults.value = [];

      return;
    }


    const selectedDrugId =
      formData.medication;
    drugInteractionResults.value = [];

    const currentMeds =
      formData.current_medications
        .map(med => med.id);

    for (
      const med
      of currentMeds
    ) {

      try {

        const interactions =
          await api.getInteractions(
            selectedDrugId,
            med
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

      else if (
        field.type === "drug-list"
      ) {

        formData[field.id] =
          Array.isArray(savedValue)
            ? savedValue
            : field.default ?? [];

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

  box-shadow: 0 4px 10px rgba(0, 0, 0, .06);

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

  background: white;

  font-size: 15px;
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

  border-radius: 16px;

  border: 2px solid #e5e7eb;
}

.checkbox-item {
  display: flex;

  align-items: center;

  gap: 12px;
}

.checkbox-item input {
  width: 18px;

  height: 18px;
}

/* ---------- DRUG SEARCH ---------- */

.drug-options {
  margin-top: 10px;

  border: 2px solid #d1d5db;

  border-radius: 14px;

  overflow: hidden;

  max-height: 250px;

  background: white;

  overflow-y: auto;
}

.drug-option {
  padding: 14px;

  cursor: pointer;

  transition: .15s;
}

.drug-option:hover {
  background: #f3f4f6;
}

/* ---------- CURRENT MEDICATIONS ---------- */

.drug-list-box {
  background:
    linear-gradient(180deg,
      #f8fafc,
      #eef7f1);

  border: 2px solid #dce7e0;

  border-radius: 20px;

  padding: 12px;

  display: flex;

  flex-direction: column;

  gap: 12px;
}

.drug-list-box .select {
  width: 100%;

  box-sizing: border-box;

  margin: 0;
}

.selected-drugs {
  margin-top: 18px;

  display: grid;

  grid-template-columns:
    repeat(auto-fill,
      minmax(260px, 1fr));

  gap: 14px;
}

.selected-drug {
  position: relative;

  display: flex;

  align-items: center;

  padding:

    16px 18px 16px 56px;

  background: white;

  border-radius: 18px;

  min-height: 72px;

  border:
    2px solid #d9eadf;

  box-shadow:
    0 6px 16px rgba(0,
      0,
      0,
      .06);

  font-weight: 700;

  color:
    #10231b;

  word-break:
    break-word;

  transition:
    .15s;
}

.selected-drug:hover {
  transform:
    translateY(-2px);

  box-shadow:
    0 10px 20px rgba(0,
      0,
      0,
      .08);
}

.selected-drug::before {
  content: "💊";

  position: absolute;

  left: 16px;

  font-size: 22px;
}

.selected-drug button {
  margin-left: auto;

  width: 34px;

  height: 34px;

  border: none;

  border-radius: 12px;

  background: #ffe2e2;

  color: #d62828;

  font-size: 18px;

  cursor: pointer;

  flex-shrink: 0;
}

.selected-drug button:hover {
  background: #ffbcbc;
}

/* ---------- INTERACTIONS ---------- */

.drug-interaction-box {
  min-height: 90px;

  padding: 14px;

  border-radius: 12px;

  background: #f9fafb;

  border: 2px solid #e5e7eb;
}

.safe {
  background: #dcebd9;

  padding: 12px;

  border-radius: 10px;

  font-weight: 700;
}

.warning {
  background: #fff0c7;

  border-left: 6px solid #ffc800;

  padding: 12px;

  margin-top: 10px;

  border-radius: 10px;
}

@media (max-width:1100px) {

  .form {
    width: 95%;
  }

  .fields-grid {
    grid-template-columns: 1fr;
  }

  .checkbox-grid {
    grid-template-columns: 1fr;
  }

  .selected-drugs {
    grid-template-columns: 1fr;
  }

}
</style>