export const SOURCE_TEMPLATE = "basic_diagnosis";

function getPatientAllergies(patient) {
  const allergies =
    patient?.executiveSummary?.allergies;

  if (Array.isArray(allergies)) {
    return allergies.join(", ");
  }

  return allergies || "";
}

function getPatientMedications(patient) {
  const meds =
    patient?.executiveSummary?.activeMedications || [];

  return meds.map(med => {
    if (typeof med === "string") {
      return {
        id: med,
        name: med,
        dosage: "Not specified",
        frequency: "Not specified"
      };
    }

    return {
      id: med.id || med._id || med.name,
      name: med.name,
      dosage: med.dosage || "Not specified",
      frequency: med.frequency || "Not specified"
    };
  });
}

export const formsConfig = {
  MANDATORY_TEMPLATES: [
    "symptoms_checklist",
    "basic_diagnosis",
    "vitals_check"
  ],

  validateStep(template, currentFormData) {
    if (!template || !template.fields) {
      return false;
    }

    return template.fields.some(field => {
      const value = currentFormData[field.id];

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      if (field.type === "boolean") {
        return value === true || value === false;
      }

      return (
        value !== "" &&
        value !== null &&
        value !== undefined
      );
    });
  },

  getInitialData(template, allForms, patient) {
    if (!template) {
      return {};
    }

    const savedCurrentPage =
      allForms[template.id] || {};

    const patientAllergies =
      getPatientAllergies(patient);

    const patientMedications =
      getPatientMedications(patient);

    if (template.id === "basic_diagnosis") {
      return {
        ...savedCurrentPage,

        allergies:
          savedCurrentPage.allergies ||
          patientAllergies ||
          "",

        current_medications:
          savedCurrentPage.current_medications?.length
            ? savedCurrentPage.current_medications
            : patientMedications
      };
    }

    if (template.id === "prescribe_medication") {
      const source =
        allForms[SOURCE_TEMPLATE] || {};

      return {
        ...savedCurrentPage,

        allergies:
          savedCurrentPage.allergies ||
          source.allergies ||
          patientAllergies ||
          "",

        current_medications:
          savedCurrentPage.current_medications?.length
            ? savedCurrentPage.current_medications
            : source.current_medications?.length
              ? source.current_medications
              : patientMedications
      };
    }

    return savedCurrentPage;
  }
};