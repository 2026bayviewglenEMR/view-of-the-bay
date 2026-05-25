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

          <option :value="true">Yes</option>
          <option :value="false">No</option>
        </select>

        <div v-else-if="field.type === 'drug-list'" class="drug-list-box">
          <input v-model="drugListSearch[field.id]" @input="searchDrugList(field.id)" class="select"
            placeholder="Search medication..." />

          <div v-if="drugListOptions[field.id]?.length > 0" class="drug-options">
            <div v-for="drug in drugListOptions[field.id]" :key="drug.id" class="drug-option"
              @click="addMedication(field.id, drug)">
              {{ drug.name }}
            </div>
          </div>

          <div class="selected-drugs">
            <div v-for="(drug, index) in formData[field.id]" :key="drug.id" class="selected-drug">
              {{ drug.name }}

              <button type="button" @click="removeMedication(field.id, index)">
                ×
              </button>
            </div>
          </div>
        </div>

        <TextAreaField v-else-if="field.type === 'textarea'" v-model="formData[field.id]" :field="field"
          :readonly="field.readonly" />

        <select v-else-if="field.type === 'select'" v-model="formData[field.id]" class="select">
          <option value="">
            Select Option
          </option>

          <option v-for="option in field.options" :key="option.id || option" :value="option.id || option">
            {{ option.name || option }}
          </option>
        </select>

        <div v-else-if="field.type === 'drug-interaction'" class="drug-interaction-box">
          <div v-if="!Array.isArray(formData.medications) || formData.medications.length === 0">
            Select prescribed medications to check drug interactions.
          </div>

          <div v-else-if="drugInteractionResults.length === 0" class="safe">
            No known interactions found with the patient's current medications.
          </div>

          <div v-for="interaction in drugInteractionResults" :key="interaction.key" class="warning">
            <strong>
              {{ interaction.prescribedName }} + {{ interaction.currentName }}
            </strong>

            <p>{{ interaction.description }}</p>
          </div>
        </div>

        <TextField v-else v-model="formData[field.id]" :field="field" :readonly="field.readonly" />
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

import TextField from "./fields/TextField.vue";
import TextAreaField from "./fields/TextAreaField.vue";

const props = defineProps({
  template: Object,
  initialData: Object
});

const emit = defineEmits(["update"]);

const formData = reactive({});

const drugInteractionResults = ref([]);
const drugListSearch = ref({});
const drugListOptions = ref({});
const interactionCheckId = ref(0);

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

const addMedication = (fieldId, drug) => {
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

const removeMedication = (fieldId, index) => {
  if (!Array.isArray(formData[fieldId])) return;

  formData[fieldId].splice(index, 1);

  checkDrugInteractions();
};

const checkDrugInteractions = async () => {
  const checkId = ++interactionCheckId.value;

  if (
    !Array.isArray(formData.medications) ||
    formData.medications.length === 0 ||
    !Array.isArray(formData.current_medications) ||
    formData.current_medications.length === 0
  ) {
    drugInteractionResults.value = [];
    formData.drug_interactions = "";
    return;
  }

  drugInteractionResults.value = [];

  const results = [];

  for (const prescribedDrug of formData.medications) {
    for (const currentDrug of formData.current_medications) {
      try {
        const interactions = await api.getInteractions(
          prescribedDrug.id,
          currentDrug.id
        );

        if (checkId !== interactionCheckId.value) {
          return;
        }

        interactions.forEach(interaction => {
          const key =
            `${prescribedDrug.id}-${currentDrug.id}-${interaction.drug_id}-${interaction.description}`;

          const alreadyExists = results.some(
            item => item.key === key
          );

          if (!alreadyExists) {
            results.push({
              key,
              prescribedName: prescribedDrug.name,
              currentName: currentDrug.name,
              description: interaction.description
            });
          }
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  drugInteractionResults.value = results;

  formData.drug_interactions =
    results
      .map(
        interaction =>
          `${interaction.prescribedName} + ${interaction.currentName}: ${interaction.description}`
      )
      .join("\n");
};

watch(
  () => props.template,
  () => {
    if (!props.template) return;

    props.template.fields.forEach(field => {
      const savedValue = props.initialData?.[field.id];

      if (savedValue !== undefined) {
        formData[field.id] = savedValue;
        return;
      }

      if (field.type === "boolean") {
        formData[field.id] = "";
      }

      else if (field.type === "checkbox-group") {
        formData[field.id] = [];
      }

      else if (field.type === "drug-list") {

        let meds =
          Array.isArray(savedValue)
            ? savedValue
            : field.default ?? [];

        meds = meds.map(med => {

          if (typeof med === "string") {
            return {
              id: med,
              name: med
            };
          }

          return med;
        });

        formData[field.id] = meds;
      }

      else {
        formData[field.id] = field.default ?? "";
      }
    });

    checkDrugInteractions();
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

const checkboxField = computed(() =>
  props.template?.fields.find(
    field => field.type === "checkbox-group"
  )
);

const normalFields = computed(() =>
  props.template?.fields.filter(
    field => field.type !== "checkbox-group"
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
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  align-items: start;
  gap: 26px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
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
  box-sizing: border-box;
}

.checkbox-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

/* Drug search dropdown */
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

/* Drug list box */
.drug-list-box {
  background: linear-gradient(180deg, #f8fafc, #eef7f1);
  border: 2px solid #dce7e0;
  border-radius: 20px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selected-drugs {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.selected-drug {
  position: relative;
  display: flex;
  align-items: center;
  padding: 16px 18px 16px 56px;
  background: white;
  border-radius: 18px;
  min-height: 72px;
  border: 2px solid #d9eadf;
  box-shadow: 0 6px 16px rgba(0, 0, 0, .06);
  font-weight: 700;
  color: #10231b;
  word-break: break-word;
  transition: .15s;
}

.selected-drug:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, .08);
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

/* Drug interaction */
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

  .selected-drugs {
    grid-template-columns: 1fr;
  }
}
</style>