// Hardcoded test catalogue used by the Order Tests PDF generator.
// Add or edit tests here — the modal and PDF will pick them up automatically.

export const LAB_TESTS = [
  // ── Blood Work ──────────────────────────────────────────────────────────────
  {
    id: 'cbc',
    category: 'Blood Work',
    name: 'Complete Blood Count (CBC)',
    description: 'RBC, WBC, platelets, haemoglobin, haematocrit',
  },
  {
    id: 'bmp',
    category: 'Blood Work',
    name: 'Basic Metabolic Panel (BMP)',
    description: 'Glucose, calcium, sodium, potassium, CO₂, BUN, creatinine',
  },
  {
    id: 'cmp',
    category: 'Blood Work',
    name: 'Comprehensive Metabolic Panel (CMP)',
    description: 'BMP + liver enzymes (AST, ALT, ALP, bilirubin, albumin)',
  },
  {
    id: 'lipid',
    category: 'Blood Work',
    name: 'Lipid Panel',
    description: 'Total cholesterol, LDL, HDL, triglycerides',
  },
  {
    id: 'hba1c',
    category: 'Blood Work',
    name: 'Hemoglobin A1C (HbA1c)',
    description: '3-month average blood glucose — diabetes screening/monitoring',
  },
  {
    id: 'tsh',
    category: 'Blood Work',
    name: 'Thyroid Stimulating Hormone (TSH)',
    description: 'Thyroid function screen',
  },
  {
    id: 'inr',
    category: 'Blood Work',
    name: 'Prothrombin Time / INR',
    description: 'Coagulation — warfarin monitoring, clotting disorders',
  },
  {
    id: 'crp',
    category: 'Blood Work',
    name: 'C-Reactive Protein (CRP)',
    description: 'Inflammation marker',
  },
  {
    id: 'esr',
    category: 'Blood Work',
    name: 'Erythrocyte Sedimentation Rate (ESR)',
    description: 'Non-specific inflammation / infection marker',
  },
  {
    id: 'glucose',
    category: 'Blood Work',
    name: 'Fasting Blood Glucose',
    description: 'Diabetes screening — patient must fast 8 hrs prior',
  },

  // ── Imaging ─────────────────────────────────────────────────────────────────
  {
    id: 'cxr',
    category: 'Imaging',
    name: 'Chest X-Ray (PA)',
    description: 'Heart, lungs, ribs, thoracic spine',
  },
  {
    id: 'abdo_xr',
    category: 'Imaging',
    name: 'Abdominal X-Ray',
    description: 'Bowel obstruction, kidney stones, free air',
  },
  {
    id: 'hand_xr',
    category: 'Imaging',
    name: 'Hand / Wrist X-Ray',
    description: 'Fractures, arthritis, bone density',
  },
  {
    id: 'ct_head',
    category: 'Imaging',
    name: 'CT Scan — Head (Non-contrast)',
    description: 'Stroke, bleed, tumour screening',
  },
  {
    id: 'ct_abdo',
    category: 'Imaging',
    name: 'CT Scan — Abdomen & Pelvis',
    description: 'Appendix, bowel, liver, kidney, aorta',
  },
  {
    id: 'mri_brain',
    category: 'Imaging',
    name: 'MRI — Brain',
    description: 'Detailed soft tissue, MS, tumour, stroke follow-up',
  },
  {
    id: 'mri_spine',
    category: 'Imaging',
    name: 'MRI — Lumbar Spine',
    description: 'Disc herniation, spinal stenosis, nerve compression',
  },
  {
    id: 'us_abdo',
    category: 'Imaging',
    name: 'Ultrasound — Abdominal',
    description: 'Gallbladder, liver, kidneys, aorta — no radiation',
  },

  // ── Cardiology ──────────────────────────────────────────────────────────────
  {
    id: 'echo',
    category: 'Cardiology',
    name: 'Echocardiogram (Echo)',
    description: 'Cardiac structure, ejection fraction, valve function',
  },

  // ── Bone / Other ────────────────────────────────────────────────────────────
  {
    id: 'dexa',
    category: 'Bone & Other',
    name: 'Bone Density Scan (DEXA)',
    description: 'Osteoporosis screening / monitoring',
  },
]

// Build a lookup of unique categories in insertion order
export const TEST_CATEGORIES = [...new Set(LAB_TESTS.map(t => t.category))]
