export const SOURCE_TEMPLATE = "basic_diagnosis";

export const formsConfig = {
  // Define which server templates are strictly required for every visit
  MANDATORY_TEMPLATES: [
    "symptoms_checklist", 
    "basic_diagnosis", 
    "vitals_check"
  ],

  /**
   * Evaluates if a template has enough data to allow the user to proceed.
   */
  validateStep(template, currentFormData) {
    if (!template || !template.fields) return false;
    
    return template.fields.some(field => {
      const value = currentFormData[field.id];
      if (Array.isArray(value)) return value.length > 0;
      if (field.type === "boolean") return value === true || value === false;
      return value !== "" && value !== null && value !== undefined;
    });
  },

  /**
   * Handles cross-pollination of data between different server templates.
   */
  getInitialData(template, allForms) {
    if (!template) return {};
    const savedCurrentPage = allForms[template.id] || {};

    // Forwarding logic: Pull data from Basic Diagnosis into Prescribe Medication
    if (template.id === "prescribe_medication") {
      const source = allForms[SOURCE_TEMPLATE] || {};
      return {
        ...savedCurrentPage,
        allergies: savedCurrentPage.allergies || source.allergies || "",
        current_medications: savedCurrentPage.current_medications?.length
          ? savedCurrentPage.current_medications
          : source.current_medications || []
      };
    }
    return savedCurrentPage;
  }
};