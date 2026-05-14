export function getTemplates() {
  return [

    /* =========================
       SYMPTOMS CHECKLIST
    ========================== */
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
            "Fatigue",
            "Dizziness",
            "Sore Throat",
            "Nausea",
            "Back Pain",
            "Joint Pain",
            "Runny Nose",
            "Congestion",
            "Loss of Appetite",
            "Rash",
            "Sneezing",
          ],

          default: []
        },

        {
          id: "additional_notes",

          label: "Additional Notes",

          type: "textarea",

          default: ""
        }
      ]
    },

    /* =========================
       Examination Template
    ========================== */
    {
      id: "basic_diagnosis",

      name: "Examination",

      fields: [
        {
          id: "patient_name",

          label: "Patient Name",

          type: "text",

          default: ""
        },

        {
          id: "diagnosis",

          label: "Diagnosis",

          type: "text",

          default: ""
        },

        {
          id: "additional_notes",

          label: "Additional Notes",

          type: "textarea",

          default: ""
        },

        {
          id: "follow_up",

          label: "Follow-up Needed",

          type: "boolean",

          default: ""
        }
      ]
    },

    /* =========================
       VITALS CHECK
    ========================== */
    {
      id: "vitals_check",

      name: "Vitals Check",

      fields: [
        {
          id: "temperature",

          label: "Temperature (°C)",

          type: "text",

          default: ""
        },

        {
          id: "heart_rate",

          label: "Heart Rate (bpm)",

          type: "text",

          default: ""
        },

        {
          id: "blood_pressure",

          label: "Blood Pressure",

          type: "text",

          default: ""
        },

        {
          id: "additional_notes",

          label: "Additional Notes",

          type: "textarea",

          default: ""
        },

        {
          id: "follow_up",

          label: "Follow-up Needed",

          type: "boolean",

          default: ""
        }
      ]
    },



    /* =========================
       MENTAL HEALTH CHECK
    ========================== */
    {
      id: "mental_health",

      name: "Mental Health Check",

      fields: [
        {
          id: "mood",

          label: "Current Mood",

          type: "text",

          default: ""
        },

        {
          id: "stress_level",

          label: "Stress Level",

          type: "text",

          default: ""
        },

        {
          id: "sleep_quality",

          label: "Sleep Quality",

          type: "text",

          default: ""
        },

        {
          id: "additional_notes",

          label: "Additional Notes",

          type: "textarea",

          default: ""
        },

        {
          id: "follow_up",

          label: "Follow-up Needed",

          type: "boolean",

          default: ""
        }
      ]
    }

  ];
}