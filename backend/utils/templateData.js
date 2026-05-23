const buildDefaultTemplateData = (template) => {
  return template.fields.reduce((data, field) => {
    if (field.type === "checkbox-group") {
      data[field.id] = Array.isArray(field.default) ? field.default : [];
      return data;
    }

    data[field.id] = field.default ?? "";
    return data;
  }, {});
};

const validateTemplateData = (template, data) => {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["Form data must be an object"];
  }

  for (const field of template.fields) {
    const value = data[field.id];

    if (value === undefined) {
      errors.push(`${field.label} is missing`);
      continue;
    }

    if (
      ["text", "textarea", "select", "drug-interaction"].includes(field.type) &&
      typeof value !== "string"
    ) {
      errors.push(`${field.label} must be text`);
    }

    if (
      field.type === "boolean" &&
      value !== true &&
      value !== false &&
      value !== ""
    ) {
      errors.push(`${field.label} must be true, false, or empty`);
    }

    if (field.type === "checkbox-group") {
      if (!Array.isArray(value)) {
        errors.push(`${field.label} must be an array`);
        continue;
      }

      const invalidOptions = value.filter(
        (option) => !field.options.includes(option)
      );

      if (invalidOptions.length > 0) {
        errors.push(
          `${field.label} contains invalid options: ${invalidOptions.join(", ")}`
        );
      }
    }
  }

  return errors;
};

const validateTemplateForms = (forms, templates) => {
  const errors = [];

  if (!forms || typeof forms !== "object" || Array.isArray(forms)) {
    return ["Forms must be an object keyed by template id"];
  }

  for (const [templateId, formData] of Object.entries(forms)) {
    const template = templates.find((item) => item.id === templateId);

    if (!template) {
      errors.push(`${templateId} is not a valid template`);
      continue;
    }

    const mergedData = {
      ...buildDefaultTemplateData(template),
      ...(formData || {}),
    };

    const formErrors = validateTemplateData(template, mergedData).map(
      (error) => `${template.name}: ${error}`
    );

    errors.push(...formErrors);
  }

  return errors;
};

const normalizeTemplateForms = (forms, templates) => {
  return Object.entries(forms || {}).reduce(
    (normalizedForms, [templateId, formData]) => {
      const template = templates.find((item) => item.id === templateId);

      if (!template) {
        return normalizedForms;
      }

      normalizedForms[templateId] = {
        ...buildDefaultTemplateData(template),
        ...(formData || {}),
      };

      return normalizedForms;
    },
    {}
  );
};

module.exports = {
  buildDefaultTemplateData,
  validateTemplateData,
  validateTemplateForms,
  normalizeTemplateForms,
};
