const getTemplates = () => {
  return [
    {
      id: "symptoms_checklist",
      name: "Symptoms Checklist",
      fields: [
        {
          id: "symptoms",
          label: "Symptoms",
          type: "checkbox-group",
          options: [
            "Cough",
            "Fever",
            "Vomiting",
            "Headache",
            "Chest Pain",
            "Abdominal Pain",
            "Shortness of Breath",
            "Excessive Sneezing",
            "Dizziness",
            "Sore Throat",
            "Nausea",
            "Back Pain",
            "Joint Pain",
            "Runny Nose",
            "Congestion",
            "Loss of Appetite",
            "Rash",
            "Jiddy virus",
          ],
          default: [],
        },
        {
          id: "additional_notes",
          label: "Additional Notes",
          type: "textarea",
          default: "",
        },
      ],
    },
    {
      id: "basic_diagnosis",
      name: "Examination",
      fields: [
        {
          id: "chief_complaint",
          label: "Chief Complaint",
          type: "text",
          default: "",
        },
        {
          id: "diagnosis",
          label: "Diagnosis",
          type: "text",
          default: "",
        },
        {
          id: "pain_level",
          label: "Pain Level (1-10)",
          type: "text",
          default: "",
        },
        {
          id: "symptom_duration",
          label: "Symptom Duration",
          type: "text",
          default: "",
        },
        {
          id: "allergies",
          label: "Allergies",
          type: "text",
          default: "",
        },
        {
          id: "current_medications",
          label: "Current Medications",
          type: "textarea",
          default: "",
        },
        {
          id: "physical_exam",
          label: "Physical Examination Findings",
          type: "textarea",
          default: "",
        },
        {
          id: "treatment_plan",
          label: "Treatment Plan",
          type: "textarea",
          default: "",
        },
        {
          id: "additional_notes",
          label: "Additional Notes",
          type: "textarea",
          default: "",
        },
        {
          id: "follow_up",
          label: "Follow-up Needed",
          type: "boolean",
          default: "",
        },
      ],
    },
    {
      id: "vitals_check",
      name: "Vitals Check",
      fields: [
        {
          id: "temperature",
          label: "Temperature (C)",
          type: "text",
          default: "",
        },
        {
          id: "heart_rate",
          label: "Heart Rate (bpm)",
          type: "text",
          default: "",
        },
        {
          id: "blood_pressure",
          label: "Blood Pressure",
          type: "text",
          default: "",
        },
        {
          id: "respiratory_rate",
          label: "Respiratory Rate",
          type: "text",
          default: "",
        },
        {
          id: "height",
          label: "Height",
          type: "text",
          default: "",
        },
        {
          id: "weight",
          label: "Weight",
          type: "text",
          default: "",
        },
        {
          id: "bmi",
          label: "BMI",
          type: "text",
          default: "",
        },
        {
          id: "mobility_status",
          label: "Mobility Status",
          type: "text",
          default: "",
        },
        {
          id: "additional_notes",
          label: "Additional Notes",
          type: "textarea",
          default: "",
        },
        {
          id: "follow_up",
          label: "Follow-up Needed",
          type: "boolean",
          default: "",
        },
      ],
    },
    {
      id: "mental_health",
      name: "Mental Health Check",
      fields: [
        {
          id: "current_mood",
          label: "Current Mood",
          type: "text",
          default: "",
        },
        {
          id: "stress_level",
          label: "Stress Level",
          type: "text",
          default: "",
        },
        {
          id: "sleep_quality",
          label: "Sleep Quality",
          type: "text",
          default: "",
        },
        {
          id: "energy_level",
          label: "Energy Level",
          type: "text",
          default: "",
        },
        {
          id: "appetite",
          label: "Appetite Changes",
          type: "text",
          default: "",
        },
        {
          id: "anxiety_level",
          label: "Anxiety Level",
          type: "text",
          default: "",
        },
        {
          id: "depression_symptoms",
          label: "Depression Symptoms",
          type: "textarea",
          default: "",
        },
        {
          id: "social_support",
          label: "Social Support System",
          type: "textarea",
          default: "",
        },
        {
          id: "coping_methods",
          label: "Current Coping Methods",
          type: "textarea",
          default: "",
        },
        {
          id: "additional_notes",
          label: "Additional Notes",
          type: "textarea",
          default: "",
        },
        {
          id: "follow_up",
          label: "Follow-up Needed",
          type: "boolean",
          default: "",
        },
      ],
    },
    {
      id: "prescribe_medication",
      name: "Prescribe Medication",
      fields: [
        {
          id: "patient_name",
          label: "Patient Name",
          type: "text",
          default: "Emma Johnson",
        },
        {
          id: "allergies",
          label: "Allergies",
          type: "text",
          default: "Penicillin",
        },
        {
          id: "current_medications",
          label: "Current Medications",
          type: "textarea",
          default: "Warfarin 5mg Daily\nIbuprofen 400mg As needed",
        },
        {
          id: "medication",
          label: "Medication",
          type: "select",
          options: [
            { id: "DB00945", name: "Aspirin" },
            { id: "DB00207", name: "Azithromycin" },
            { id: "DB00331", name: "Metformin" },
            { id: "DB01060", name: "Amoxicillin" },
          ],
          default: "",
        },
        {
          id: "dosage",
          label: "Dosage",
          type: "text",
          default: "",
        },
        {
          id: "frequency",
          label: "Frequency",
          type: "select",
          options: [
            "Once daily",
            "Twice daily",
            "Three times daily",
            "Every 6 hours",
            "As needed",
          ],
          default: "",
        },
        {
          id: "instructions",
          label: "Instructions",
          type: "textarea",
          default: "",
        },
        {
          id: "drug_interactions",
          label: "Drug Interaction Results",
          type: "drug-interaction",
          default: "",
        },
      ],
    },
  ];
};

const getTemplateById = (templateId) => {
  return getTemplates().find((template) => template.id === templateId);
};

module.exports = {
  getTemplates,
  getTemplateById,
};
