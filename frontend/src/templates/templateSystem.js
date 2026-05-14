// src/templates/templateSystem.js

export function getTemplates() {
  return [
    {
      id: "basic_diagnosis",
      name: "Basic Diagnosis",
      fields: [
        {
          id: "patient_name",
          label: "Patient Name",
          type: "text",
          default: ""
        },
        {
          id: "symptoms",
          label: "Symptoms",
          type: "textarea",
          default: ""
        },
        {
          id: "diagnosis",
          label: "Diagnosis",
          type: "text",
          default: ""
        },
        {
          id: "follow_up",
          label: "Follow-up Needed",
          type: "boolean",
          default: false
        }
      ]
    },

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
          id: "notes",
          label: "Additional Notes",
          type: "textarea",
          default: ""
        }
      ]
    },

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
          id: "follow_up_required",
          label: "Follow-up Required",
          type: "boolean",
          default: false
        }
      ]
    }
  ];
}