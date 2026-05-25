const getTemplates = () => {
  return [
    {
      id: "symptoms_checklist",
      name: "Symptoms Checklist",
      isMandatory: true, // Required
      fields: [
        {
          id: "symptoms",
          label: "Symptoms",
          type: "checkbox-group",
          options: [
            "Cough", "Fever", "Vomiting", "Headache", "Chest Pain",
            "Abdominal Pain", "Shortness of Breath", "Excessive Sneezing",
            "Dizziness", "Sore Throat", "Nausea", "Back Pain", "Joint Pain",
            "Runny Nose", "Congestion", "Loss of Appetite", "Rash", "Jiddy virus",
          ],
          default: [],
        },
        { id: "additional_notes", label: "Additional Notes", type: "textarea", default: "" },
      ],
    },
    {
      id: "basic_diagnosis",
      name: "Examination",
      isMandatory: true, // Required
      fields: [
        { id: "chief_complaint", label: "Chief Complaint", type: "text", default: "" },
        { id: "diagnosis", label: "Diagnosis", type: "text", default: "" },
        { id: "pain_level", label: "Pain Level (1-10)", type: "text", default: "" },
        { id: "symptom_duration", label: "Symptom Duration", type: "text", default: "" },
        { id: "allergies", label: "Allergies", type: "text", default: "" },
        { id: "current_medications", label: "Current Medications", type: "drug-list", default: [] },
        { id: "physical_exam", label: "Physical Examination Findings", type: "textarea", default: "" },
        { id: "treatment_plan", label: "Treatment Plan", type: "textarea", default: "" },
        { id: "additional_notes", label: "Additional Notes", type: "textarea", default: "" },
        { id: "follow_up", label: "Follow-up Needed", type: "boolean", default: "" },
      ],
    },
    {
      id: "vitals_check",
      name: "Vitals Check",
      isMandatory: true, // Required
      fields: [
        { id: "temperature", label: "Temperature (C)", type: "text", default: "" },
        { id: "heart_rate", label: "Heart Rate (bpm)", type: "text", default: "" },
        { id: "blood_pressure", label: "Blood Pressure", type: "text", default: "" },
        { id: "respiratory_rate", label: "Respiratory Rate", type: "text", default: "" },
        { id: "height", label: "Height", type: "text", default: "" },
        { id: "weight", label: "Weight", type: "text", default: "" },
        { id: "bmi", label: "BMI", type: "text", default: "" },
        { id: "mobility_status", label: "Mobility Status", type: "text", default: "" },
        { id: "additional_notes", label: "Additional Notes", type: "textarea", default: "" },
        { id: "follow_up", label: "Follow-up Needed", type: "boolean", default: "" },
      ],
    },
    {
      id: "mental_health",
      name: "Mental Health Check",
      isMandatory: false, // Optional
      fields: [
        { id: "current_mood", label: "Current Mood", type: "text", default: "" },
        { id: "stress_level", label: "Stress Level", type: "text", default: "" },
        { id: "sleep_quality", label: "Sleep Quality", type: "text", default: "" },
        { id: "energy_level", label: "Energy Level", type: "text", default: "" },
        { id: "appetite", label: "Appetite Changes", type: "text", default: "" },
        { id: "anxiety_level", label: "Anxiety Level", type: "text", default: "" },
        { id: "depression_symptoms", label: "Depression Symptoms", type: "textarea", default: "" },
        { id: "social_support", label: "Social Support System", type: "textarea", default: "" },
        { id: "coping_methods", label: "Current Coping Methods", type: "textarea", default: "" },
        { id: "additional_notes", label: "Additional Notes", type: "textarea", default: "" },
        { id: "follow_up", label: "Follow-up Needed", type: "boolean", default: "" },
      ],
    },
    {
      id: "prescribe_medication",
      name: "Prescribed Medications",
      isMandatory: false, // Optional
      fields: [
        { id: "current_medications", label: "Current Medications", type: "drug-list", default: [] },
        { id: "medications", label: "Prescribed Medications", type: "drug-list", default: [] },
        { id: "allergies", label: "Allergies", type: "text", default: "" },
        { id: "dosage", label: "Dosage of Prescribed Medication", type: "text", default: "" },
        {
          id: "frequency",
          label: "Frequency of Prescribed Medication",
          type: "select",
          options: ["Once daily", "Twice daily", "Three times daily", "Every 6 hours", "As needed"],
          default: "",
        },
        { id: "instructions", label: "Instructions", type: "textarea", default: "" },
        { id: "drug_interactions", label: "Drug Interaction Results", type: "drug-interaction", default: "" },
      ]
    },
    {
      id: "clinical_assessment",
      name: "Assessment & Diagnosis",
      isMandatory: false,
      fields: [
        { id: "working_diagnosis", label: "Working Diagnosis", type: "text", default: "" },
        { id: "differential_diagnosis", label: "Differential Diagnosis", type: "textarea", default: "" },
        { id: "clinical_impression", label: "Clinical Impression", type: "textarea", default: "" },
        {
          id: "severity",
          label: "Severity",
          type: "select",
          options: ["Mild", "Moderate", "Severe", "Critical"],
          default: "",
        },
      ],
    },
    {
      id: "diagnostic_orders",
      name: "Diagnostic Orders",
      isMandatory: false,
      fields: [
        { id: "order_title", label: "Order Title", type: "text", default: "" },
        {
          id: "test_type",
          label: "Test Type",
          type: "select",
          options: ["Laboratory", "Imaging", "Pathology", "Cardiology", "Pulmonary", "Other"],
          default: "",
        },
        {
          id: "priority",
          label: "Priority",
          type: "select",
          options: ["Routine", "Urgent", "STAT"],
          default: "",
        },
        { id: "clinical_question", label: "Clinical Question / Indication", type: "textarea", default: "" },
        { id: "instructions", label: "Special Instructions", type: "textarea", default: "" },
      ],
    },
    {
      id: "surgery_request",
      name: "Surgery Request",
      isMandatory: false,
      fields: [
        { id: "procedure", label: "Procedure / Surgical Service", type: "text", default: "" },
        {
          id: "urgency",
          label: "Urgency",
          type: "select",
          options: ["Elective", "Semi-urgent", "Urgent", "Emergency"],
          default: "",
        },
        { id: "reason", label: "Reason / Relevant Findings", type: "textarea", default: "" },
        { id: "pre_op_notes", label: "Pre-op Notes", type: "textarea", default: "" },
      ],
    },
    {
      id: "referral_request",
      name: "Referral Request",
      isMandatory: false,
      fields: [
        { id: "refer_to", label: "Refer To", type: "text", default: "" },
        {
          id: "priority",
          label: "Priority",
          type: "select",
          options: ["Routine", "Urgent", "Emergency"],
          default: "",
        },
        { id: "reason", label: "Referral Reason", type: "textarea", default: "" },
        { id: "supporting_findings", label: "Supporting Findings", type: "textarea", default: "" },
      ],
    },
    {
      id: "patient_instructions",
      name: "Patient Instructions",
      isMandatory: false,
      fields: [
        { id: "home_care", label: "Home Care Instructions", type: "textarea", default: "" },
        { id: "medication_guidance", label: "Medication Guidance", type: "textarea", default: "" },
        { id: "return_precautions", label: "Return Precautions", type: "textarea", default: "" },
      ],
    },
    {
      id: "follow_up_plan",
      name: "Follow-up Plan",
      isMandatory: false,
      fields: [
        { id: "timeline", label: "Follow-up Timeline", type: "text", default: "" },
        { id: "with_whom", label: "Follow-up With", type: "text", default: "" },
        { id: "monitoring_plan", label: "Monitoring Plan", type: "textarea", default: "" },
        { id: "follow_up_required", label: "Follow-up Required", type: "boolean", default: "" },
      ],
    },
    {
      id: "clinical_notes",
      name: "Clinical Notes",
      isMandatory: false,
      fields: [
        { id: "notes", label: "Additional Clinical Notes", type: "textarea", default: "" },
        { id: "care_team_notes", label: "Care Team Notes", type: "textarea", default: "" },
      ],
    },
  ];
};

const getTemplateById = (templateId) => {
  return getTemplates().find((template) => template.id === templateId);
};

export { getTemplates, getTemplateById };
