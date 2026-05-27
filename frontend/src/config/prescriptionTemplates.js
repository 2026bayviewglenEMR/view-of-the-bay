// Pre-built condition templates for quick-fill during consultation.
// Each template fills: intake_assessment, vitals_check, and prescribe_medication forms.

export const PRESCRIPTION_TEMPLATES = [
  {
    id: 'flu',
    name: 'Influenza (Flu)',
    icon: '🤧',
    tag: 'Viral',
    fills: {
      intake_assessment: {
        chief_complaint: 'Flu symptoms — fever, body aches, fatigue',
        symptoms: ['Fever', 'Cough', 'Sore Throat', 'Headache', 'Runny Nose', 'Loss of Appetite'],
      },
      vitals_check: {
        working_diagnosis: 'Influenza',
        severity: 'Moderate',
      },
      prescribe_medication: {
        medications: [{ id: 'oseltamivir', name: 'Oseltamivir (Tamiflu)' }],
        dosage: '75 mg',
        frequency: 'Twice daily',
        instructions: 'Take with food for 5 days. Begin within 48 hours of symptom onset. Stay hydrated and rest. Return if symptoms worsen after day 3.',
      },
    },
  },
  {
    id: 'common_cold',
    name: 'Common Cold',
    icon: '🤒',
    tag: 'Viral',
    fills: {
      intake_assessment: {
        chief_complaint: 'Cold symptoms — runny nose, congestion, mild sore throat',
        symptoms: ['Runny Nose', 'Congestion', 'Sore Throat', 'Cough'],
      },
      vitals_check: {
        working_diagnosis: 'Common Cold (Viral Upper Respiratory Infection)',
        severity: 'Mild',
      },
      prescribe_medication: {
        medications: [{ id: 'cetirizine', name: 'Cetirizine (Reactine)' }],
        dosage: '10 mg',
        frequency: 'Once daily',
        instructions: 'Take in the evening. Supportive care: rest, fluids, saline nasal spray as needed. No antibiotics required — viral illness.',
      },
    },
  },
  {
    id: 'strep_throat',
    name: 'Strep Throat',
    icon: '🦠',
    tag: 'Bacterial',
    fills: {
      intake_assessment: {
        chief_complaint: 'Severe sore throat, fever, difficulty swallowing',
        symptoms: ['Sore Throat', 'Fever', 'Headache', 'Nausea'],
      },
      vitals_check: {
        working_diagnosis: 'Group A Streptococcal Pharyngitis',
        severity: 'Moderate',
      },
      prescribe_medication: {
        medications: [{ id: 'DB01060', name: 'Amoxicillin' }],
        dosage: '500 mg',
        frequency: 'Twice daily',
        instructions: 'Take for 10 days. Complete the full course even if symptoms improve. Take with or without food. Return if rash develops.',
      },
    },
  },
  {
    id: 'uti',
    name: 'UTI',
    icon: '💊',
    tag: 'Bacterial',
    fills: {
      intake_assessment: {
        chief_complaint: 'Burning urination, frequent urge to urinate, pelvic discomfort',
        symptoms: ['Abdominal Pain', 'Nausea'],
      },
      vitals_check: {
        working_diagnosis: 'Uncomplicated Urinary Tract Infection',
        severity: 'Mild',
      },
      prescribe_medication: {
        medications: [{ id: 'nitrofurantoin', name: 'Nitrofurantoin (Macrobid)' }],
        dosage: '100 mg',
        frequency: 'Twice daily',
        instructions: 'Take with food for 7 days. Drink plenty of water. Return if fever develops, symptoms worsen, or no improvement after 48 hours.',
      },
    },
  },
  {
    id: 'hypertension',
    name: 'Hypertension',
    icon: '🩺',
    tag: 'Chronic',
    fills: {
      intake_assessment: {
        chief_complaint: 'Elevated blood pressure, occasional headache',
        symptoms: ['Headache', 'Dizziness'],
      },
      vitals_check: {
        working_diagnosis: 'Hypertension (HTN)',
        severity: 'Moderate',
      },
      prescribe_medication: {
        medications: [{ id: 'amlodipine', name: 'Amlodipine (Norvasc)' }],
        dosage: '5 mg',
        frequency: 'Once daily',
        instructions: 'Take at the same time each day. Monitor blood pressure weekly. Reduce sodium, increase physical activity. Follow up in 4 weeks.',
      },
    },
  },
  {
    id: 'type2_diabetes',
    name: 'Type 2 Diabetes',
    icon: '🩸',
    tag: 'Chronic',
    fills: {
      intake_assessment: {
        chief_complaint: 'Elevated blood sugar, increased thirst and urination',
        symptoms: ['Loss of Appetite', 'Dizziness'],
      },
      vitals_check: {
        working_diagnosis: 'Type 2 Diabetes Mellitus',
        severity: 'Moderate',
      },
      prescribe_medication: {
        medications: [{ id: 'DB00331', name: 'Metformin' }],
        dosage: '500 mg',
        frequency: 'Twice daily',
        instructions: 'Take with meals to reduce GI side effects. Monitor fasting blood glucose daily. Low-carb diet and regular exercise recommended. Follow up in 3 months with HbA1c.',
      },
    },
  },
  {
    id: 'bronchitis',
    name: 'Bronchitis',
    icon: '😮‍💨',
    tag: 'Respiratory',
    fills: {
      intake_assessment: {
        chief_complaint: 'Persistent cough, chest tightness, shortness of breath',
        symptoms: ['Cough', 'Shortness of Breath', 'Chest Pain', 'Fever'],
      },
      vitals_check: {
        working_diagnosis: 'Acute Bronchitis',
        severity: 'Moderate',
      },
      prescribe_medication: {
        medications: [{ id: 'DB00207', name: 'Azithromycin' }],
        dosage: '250 mg',
        frequency: 'Once daily',
        instructions: 'Take for 5 days. Take on an empty stomach. Rest, avoid smoke and irritants. Use a humidifier. Return if coughing blood or difficulty breathing worsens.',
      },
    },
  },
  {
    id: 'sinusitis',
    name: 'Sinusitis',
    icon: '😤',
    tag: 'Bacterial',
    fills: {
      intake_assessment: {
        chief_complaint: 'Facial pressure, nasal congestion, thick nasal discharge',
        symptoms: ['Congestion', 'Headache', 'Cough', 'Fever'],
      },
      vitals_check: {
        working_diagnosis: 'Acute Bacterial Sinusitis',
        severity: 'Mild',
      },
      prescribe_medication: {
        medications: [{ id: 'DB01060', name: 'Amoxicillin' }],
        dosage: '875 mg',
        frequency: 'Twice daily',
        instructions: 'Take for 7 days. Use saline nasal rinse twice daily. Steam inhalation may help. Avoid flying. Return if headache becomes severe or vision changes.',
      },
    },
  },
  {
    id: 'allergic_rhinitis',
    name: 'Allergic Rhinitis',
    icon: '🌿',
    tag: 'Allergy',
    fills: {
      intake_assessment: {
        chief_complaint: 'Seasonal sneezing, runny nose, itchy eyes',
        symptoms: ['Runny Nose', 'Excessive Sneezing', 'Congestion'],
      },
      vitals_check: {
        working_diagnosis: 'Allergic Rhinitis (Seasonal)',
        severity: 'Mild',
      },
      prescribe_medication: {
        medications: [{ id: 'cetirizine', name: 'Cetirizine (Reactine)' }],
        dosage: '10 mg',
        frequency: 'Once daily',
        instructions: 'Take in the evening. Avoid known allergens. Keep windows closed during high pollen days. Use HEPA air filter if possible. Can be taken long-term as needed.',
      },
    },
  },
  {
    id: 'gerd',
    name: 'Acid Reflux / GERD',
    icon: '🔥',
    tag: 'GI',
    fills: {
      intake_assessment: {
        chief_complaint: 'Heartburn, regurgitation, discomfort after eating',
        symptoms: ['Nausea', 'Vomiting', 'Abdominal Pain'],
      },
      vitals_check: {
        working_diagnosis: 'Gastroesophageal Reflux Disease (GERD)',
        severity: 'Mild',
      },
      prescribe_medication: {
        medications: [{ id: 'omeprazole', name: 'Omeprazole (Losec)' }],
        dosage: '20 mg',
        frequency: 'Once daily',
        instructions: 'Take 30 minutes before breakfast. Avoid spicy food, caffeine, alcohol, and late meals. Elevate head of bed. Follow up in 4 weeks to assess response.',
      },
    },
  },
];

export const TEMPLATE_TAGS = [...new Set(PRESCRIPTION_TEMPLATES.map(t => t.tag))];
