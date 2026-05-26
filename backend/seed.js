require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const Consultation = require('./models/Consultations');
const Task = require('./models/Task');
const Alert = require('./models/Alert');
const Message = require('./models/Message');
const WaitingRoom = require('./models/waitingRoom.model');

const MONGO_URI = process.env.MONGO_URI.trim().replace(/['"]+/g, '');
const SEED_DATE = new Date('2026-05-25T00:00:00.000Z');

const hash = (pw) => bcrypt.hash(pw, 10);

function dt(daysOffset, hour, minute = 0) {
  const d = new Date(SEED_DATE);
  d.setDate(d.getDate() + daysOffset);
  d.setUTCHours(hour + 7, minute, 0, 0); // Pacific time offset
  return d;
}

function dob(year, month, day) {
  return new Date(year, month - 1, day);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB\n');

  // ─── DOCTORS ──────────────────────────────────────────────────────────────
  const doctorDefs = [
    { username: 'sarah.chen',       firstName: 'Sarah',  lastName: 'Chen',      email: 'schen@bayview.med' },
    { username: 'marcus.williams',  firstName: 'Marcus', lastName: 'Williams',  email: 'mwilliams@bayview.med' },
    { username: 'emily.rodriguez',  firstName: 'Emily',  lastName: 'Rodriguez', email: 'erodriguez@bayview.med' },
  ];

  const doctors = [];
  for (const d of doctorDefs) {
    let user = await User.findOne({ username: d.username });
    if (!user) {
      user = await User.create({ ...d, password: await hash('Demo1234!'), role: 'doctor', isActive: true });
      console.log(`  ✓ Doctor created: ${d.username}`);
    } else {
      console.log(`  · Doctor exists:  ${d.username}`);
    }
    doctors.push(user);
  }

  // ─── ADMIN ────────────────────────────────────────────────────────────────
  let admin = await User.findOne({ username: 'admin' });
  if (!admin) {
    admin = await User.create({
      username: 'admin', password: await hash('Demo1234!'), role: 'admin',
      firstName: 'Admin', lastName: 'Staff', email: 'admin@bayview.med', isActive: true,
    });
    console.log('  ✓ Admin created');
  } else {
    console.log('  · Admin exists');
  }

  console.log();

  // ─── PATIENTS ─────────────────────────────────────────────────────────────
  const patientDefs = [
    {
      firstName: 'Margaret', lastName: 'Sullivan',
      dateOfBirth: dob(1959, 3, 14), gender: 'Female',
      demographics: { phone: '415-555-0101', address: '42 Maple St, San Francisco, CA', insurance: 'Blue Cross PPO' },
      clinicalHistory: {
        conditions: ['Hypertension', 'Type 2 Diabetes Mellitus'],
        surgeries: ['Appendectomy (2001)'],
        familyHistory: 'Mother had coronary artery disease. Father had type 2 diabetes.',
        socialHistory: 'Non-smoker. Occasional alcohol. Retired schoolteacher.',
      },
      executiveSummary: {
        allergies: ['Penicillin'],
        activeMedications: [
          { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
          { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
          { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime' },
        ],
      },
    },
    {
      firstName: 'James', lastName: 'Okafor',
      dateOfBirth: dob(1981, 7, 22), gender: 'Male',
      demographics: { phone: '415-555-0102', address: '88 Pine Ave, Oakland, CA', insurance: 'Aetna HMO' },
      clinicalHistory: {
        conditions: ['Asthma', 'Seasonal Allergic Rhinitis'],
        surgeries: [],
        familyHistory: 'Father had asthma. No other significant family history.',
        socialHistory: 'Non-smoker. No alcohol. Software engineer.',
      },
      executiveSummary: {
        allergies: [],
        activeMedications: [
          { name: 'Albuterol inhaler', dosage: '90mcg', frequency: 'As needed' },
          { name: 'Fluticasone nasal spray', dosage: '50mcg', frequency: 'Once daily' },
        ],
      },
    },
    {
      firstName: 'Linda', lastName: 'Chen',
      dateOfBirth: dob(1974, 11, 5), gender: 'Female',
      demographics: { phone: '415-555-0103', address: '7 Ocean View Blvd, Daly City, CA', insurance: 'United Health PPO' },
      clinicalHistory: {
        conditions: ['Hypothyroidism', 'Iron-deficiency anemia'],
        surgeries: ['Cesarean section (2005)', 'Cesarean section (2008)'],
        familyHistory: 'Mother has hypothyroidism.',
        socialHistory: 'Non-smoker. No alcohol. Accountant.',
      },
      executiveSummary: {
        allergies: ['Sulfa drugs'],
        activeMedications: [
          { name: 'Levothyroxine', dosage: '75mcg', frequency: 'Once daily on empty stomach' },
          { name: 'Ferrous sulfate', dosage: '325mg', frequency: 'Once daily' },
        ],
      },
    },
    {
      firstName: 'Robert', lastName: 'Martinez',
      dateOfBirth: dob(1955, 1, 30), gender: 'Male',
      demographics: { phone: '415-555-0104', address: '215 Broadway, San Francisco, CA', insurance: 'Medicare + Supplement' },
      clinicalHistory: {
        conditions: ['COPD (Moderate)', 'Coronary Artery Disease', 'Hypertension'],
        surgeries: ['CABG x3 (2018)', 'Hip replacement (2020)'],
        familyHistory: 'Father died of MI at 62. Brother has COPD.',
        socialHistory: 'Former smoker (30 pack-years, quit 2015). No alcohol.',
      },
      executiveSummary: {
        allergies: ['NSAIDs', 'Codeine'],
        activeMedications: [
          { name: 'Albuterol inhaler', dosage: '90mcg', frequency: 'As needed' },
          { name: 'Tiotropium', dosage: '18mcg', frequency: 'Once daily' },
          { name: 'Metoprolol succinate', dosage: '50mg', frequency: 'Once daily' },
          { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' },
        ],
      },
    },
    {
      firstName: 'Aisha', lastName: 'Johnson',
      dateOfBirth: dob(1992, 4, 18), gender: 'Female',
      demographics: { phone: '415-555-0105', address: '33 Mission St, San Francisco, CA', insurance: 'Kaiser Permanente' },
      clinicalHistory: {
        conditions: ['Generalized Anxiety Disorder', 'GERD'],
        surgeries: [],
        familyHistory: 'No significant family history.',
        socialHistory: 'Non-smoker. Social drinker. Graphic designer.',
      },
      executiveSummary: {
        allergies: ['Latex'],
        activeMedications: [
          { name: 'Sertraline', dosage: '50mg', frequency: 'Once daily' },
          { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily before breakfast' },
        ],
      },
    },
    {
      firstName: 'David', lastName: 'Park',
      dateOfBirth: dob(1968, 9, 11), gender: 'Male',
      demographics: { phone: '415-555-0106', address: '501 Market St, San Francisco, CA', insurance: 'Cigna PPO' },
      clinicalHistory: {
        conditions: ['Type 2 Diabetes Mellitus', 'Hyperlipidemia', 'Obesity (BMI 31)'],
        surgeries: ['Cholecystectomy (2015)'],
        familyHistory: 'Father has type 2 diabetes and hyperlipidemia.',
        socialHistory: 'Non-smoker. No alcohol. Restaurant owner.',
      },
      executiveSummary: {
        allergies: [],
        activeMedications: [
          { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily with meals' },
          { name: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily at bedtime' },
          { name: 'Semaglutide', dosage: '0.5mg', frequency: 'Once weekly subcutaneous' },
        ],
      },
    },
    {
      firstName: 'Susan', lastName: 'Kowalski',
      dateOfBirth: dob(1982, 6, 27), gender: 'Female',
      demographics: { phone: '415-555-0107', address: '12 Valencia St, San Francisco, CA', insurance: 'Blue Shield HMO' },
      clinicalHistory: {
        conditions: ['Chronic Migraine', 'Insomnia'],
        surgeries: [],
        familyHistory: 'Mother has migraines.',
        socialHistory: 'Non-smoker. Occasional wine. High school teacher.',
      },
      executiveSummary: {
        allergies: [],
        activeMedications: [
          { name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed for migraine' },
          { name: 'Amitriptyline', dosage: '10mg', frequency: 'Once daily at bedtime' },
        ],
      },
    },
    {
      firstName: 'Thomas', lastName: 'Brown',
      dateOfBirth: dob(1944, 2, 8), gender: 'Male',
      demographics: { phone: '415-555-0108', address: '77 Sunset Blvd, Pacifica, CA', insurance: 'Medicare Part B' },
      clinicalHistory: {
        conditions: ['Atrial Fibrillation', 'Congestive Heart Failure (EF 40%)', 'CKD Stage 3'],
        surgeries: ['Pacemaker implant (2021)', 'TURP (2019)'],
        familyHistory: 'Father had AFib. Mother had stroke.',
        socialHistory: 'Non-smoker. No alcohol. Retired firefighter.',
      },
      executiveSummary: {
        allergies: ['Penicillin', 'Iodine contrast'],
        activeMedications: [
          { name: 'Warfarin', dosage: '5mg', frequency: 'Once daily (INR target 2–3)' },
          { name: 'Digoxin', dosage: '0.125mg', frequency: 'Once daily' },
          { name: 'Furosemide', dosage: '40mg', frequency: 'Once daily in morning' },
          { name: 'Carvedilol', dosage: '6.25mg', frequency: 'Twice daily with meals' },
        ],
      },
    },
    {
      firstName: 'Priya', lastName: 'Sharma',
      dateOfBirth: dob(1997, 12, 3), gender: 'Female',
      demographics: { phone: '415-555-0109', address: '200 Divisadero St, San Francisco, CA', insurance: 'Anthem PPO' },
      clinicalHistory: {
        conditions: ['G1P0 – 28 weeks gestation', 'Gestational vitamin D deficiency'],
        surgeries: [],
        familyHistory: 'Mother had gestational diabetes.',
        socialHistory: 'Non-smoker. No alcohol during pregnancy. Software developer.',
      },
      executiveSummary: {
        allergies: [],
        activeMedications: [
          { name: 'Prenatal vitamins', dosage: '1 tablet', frequency: 'Once daily' },
          { name: 'Vitamin D3', dosage: '2000 IU', frequency: 'Once daily' },
          { name: 'Iron supplement', dosage: '27mg', frequency: 'Once daily' },
        ],
      },
    },
    {
      firstName: 'Carlos', lastName: 'Rivera',
      dateOfBirth: dob(1965, 8, 19), gender: 'Male',
      demographics: { phone: '415-555-0110', address: '345 Potrero Ave, San Francisco, CA', insurance: 'Medi-Cal' },
      clinicalHistory: {
        conditions: ['Benign Prostatic Hyperplasia', 'Hypertension', 'Osteoarthritis (bilateral knees)'],
        surgeries: ['Knee arthroscopy right (2017)'],
        familyHistory: 'Father had prostate cancer.',
        socialHistory: 'Former smoker (quit 2010). No alcohol. Construction worker.',
      },
      executiveSummary: {
        allergies: ['Iodine contrast', 'Shellfish'],
        activeMedications: [
          { name: 'Tamsulosin', dosage: '0.4mg', frequency: 'Once daily 30 min after meal' },
          { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' },
          { name: 'Acetaminophen', dosage: '500mg', frequency: 'As needed (max 3g/day)' },
        ],
      },
    },
  ];

  const patients = [];
  for (const pd of patientDefs) {
    let existing = await Patient.findOne({ firstName: pd.firstName, lastName: pd.lastName });
    if (existing) {
      console.log(`  · Patient exists:  ${pd.firstName} ${pd.lastName}`);
      patients.push(existing);
      continue;
    }

    let uname = `${pd.firstName.toLowerCase()}.${pd.lastName.toLowerCase()}`;
    let suffix = 1;
    while (await User.findOne({ username: uname })) uname = `${pd.firstName.toLowerCase()}.${pd.lastName.toLowerCase()}${suffix++}`;

    const pUser = await User.create({
      username: uname, password: await hash('Demo1234!'), role: 'patient',
      firstName: pd.firstName, lastName: pd.lastName,
      email: `${uname}@patient.bayview.med`, isActive: true,
    });
    const patient = await Patient.create({ ...pd, userId: pUser._id });
    pUser.patientId = patient._id;
    await pUser.save();
    patients.push(patient);
    console.log(`  ✓ Patient created: ${pd.firstName} ${pd.lastName}`);
  }

  console.log();

  // ─── CHECK IF APPOINTMENTS ALREADY SEEDED ─────────────────────────────────
  const existingAppts = await Appointment.countDocuments({ doctorId: { $in: doctors.map(d => d._id) } });
  if (existingAppts > 0) {
    console.log(`  · Appointments already seeded (${existingAppts} found). Skipping appointments, consultations, tasks, alerts, and messages.`);
    await mongoose.disconnect();
    return;
  }

  // ─── APPOINTMENTS (Mon May 25 – Fri May 29) ───────────────────────────────
  // p = patient index, d = doctor index, day = days from May 25
  const apptDefs = [
    // MONDAY — some already done, some in progress, rest scheduled
    { p: 0, d: 0, day: 0, h: 9,  min: 0,  dur: 30, status: 'completed', reason: 'Diabetes follow-up – HbA1c review',              notes: 'HbA1c result from last week. Adjust metformin if needed.' },
    { p: 3, d: 2, day: 0, h: 9,  min: 0,  dur: 45, status: 'completed', reason: 'COPD exacerbation follow-up',                    notes: 'Post-ER visit follow-up. Review peak flow and inhaler technique.' },
    { p: 1, d: 1, day: 0, h: 10, min: 0,  dur: 30, status: 'completed', reason: 'Asthma review and spirometry',                   notes: 'Annual asthma review. Order spirometry if not done in past 12 months.' },
    { p: 6, d: 0, day: 0, h: 11, min: 0,  dur: 30, status: 'waiting',   reason: 'Migraine management – preventive therapy',       notes: 'Patient requesting CGRP inhibitor. Review prior auth requirements.' },
    { p: 7, d: 2, day: 0, h: 11, min: 15, dur: 45, status: 'waiting',   reason: 'Heart failure monitoring – fluid status',        notes: 'Weekly fluid check. Weight up 2kg since last visit.' },
    { p: 9, d: 1, day: 0, h: 13, min: 0,  dur: 30, status: 'scheduled', reason: 'BPH and hypertension annual review',             notes: 'PSA due. Review blood pressure log.' },
    { p: 4, d: 0, day: 0, h: 14, min: 0,  dur: 30, status: 'scheduled', reason: 'Anxiety check-in and medication review',         notes: 'Patient requesting dose increase for sertraline.' },
    { p: 8, d: 1, day: 0, h: 15, min: 0,  dur: 30, status: 'scheduled', reason: 'Prenatal visit – 28 weeks',                     notes: 'GDM screen results. Fundal height. Kick count education.' },

    // TUESDAY
    { p: 2, d: 0, day: 1, h: 8,  min: 0,  dur: 30, status: 'scheduled', reason: 'Thyroid function results review',               notes: 'TSH drawn last week. Adjust levothyroxine if out of range.' },
    { p: 5, d: 1, day: 1, h: 9,  min: 0,  dur: 30, status: 'scheduled', reason: 'Diabetes – semaglutide 3-month follow-up',      notes: 'Weight and HbA1c trend since starting semaglutide.' },
    { p: 7, d: 2, day: 1, h: 10, min: 0,  dur: 45, status: 'scheduled', reason: 'Cardiology follow-up – AFib / warfarin',        notes: 'INR check. Pacemaker interrogation due. Review warfarin compliance.' },
    { p: 0, d: 0, day: 1, h: 11, min: 0,  dur: 30, status: 'scheduled', reason: 'Blood pressure monitoring visit',               notes: 'Home BP log review. Patient reports occasional dizziness.' },
    { p: 3, d: 2, day: 1, h: 13, min: 0,  dur: 30, status: 'scheduled', reason: 'Pulmonology review – COPD progression',         notes: 'PFT comparison. Discuss step-up to triple therapy if FEV1 declined.' },
    { p: 6, d: 1, day: 1, h: 14, min: 0,  dur: 30, status: 'scheduled', reason: 'Sleep hygiene and insomnia follow-up',          notes: 'CBT-I progress review. Consider adding melatonin.' },

    // WEDNESDAY
    { p: 9, d: 0, day: 2, h: 8,  min: 0,  dur: 30, status: 'scheduled', reason: 'PSA result review and prostate health',         notes: 'PSA drawn last week. Review urinary symptoms score (IPSS).' },
    { p: 4, d: 1, day: 2, h: 9,  min: 0,  dur: 30, status: 'scheduled', reason: 'Mental health follow-up – SSRI titration',      notes: 'Sertraline 50mg trial for 6 weeks. Assess response and side effects.' },
    { p: 8, d: 2, day: 2, h: 10, min: 0,  dur: 30, status: 'scheduled', reason: 'Prenatal – fetal growth ultrasound review',     notes: 'Growth scan results. Fetal position. GBS swab planning at 36w.' },
    { p: 1, d: 0, day: 2, h: 11, min: 0,  dur: 30, status: 'scheduled', reason: 'Allergy consultation – immunotherapy',          notes: 'Patient interested in allergy shots for grass and tree pollen.' },
    { p: 5, d: 1, day: 2, h: 13, min: 0,  dur: 30, status: 'scheduled', reason: 'Lipid panel review and lifestyle counseling',   notes: 'LDL target < 100. Dietary and exercise counseling.' },
    { p: 7, d: 2, day: 2, h: 14, min: 0,  dur: 45, status: 'scheduled', reason: 'Cardiac device check – pacemaker clinic',      notes: 'Remote monitoring flagged brief pause. Device interrogation required.' },

    // THURSDAY
    { p: 2, d: 1, day: 3, h: 9,  min: 0,  dur: 30, status: 'scheduled', reason: 'Anemia management – iron studies',             notes: 'Ferritin and TIBC due. Assess GI tolerance of ferrous sulfate.' },
    { p: 0, d: 0, day: 3, h: 10, min: 0,  dur: 30, status: 'scheduled', reason: 'Diabetes education – carb counting review',    notes: 'Dietitian referral note review. CGM data if available.' },
    { p: 3, d: 2, day: 3, h: 11, min: 0,  dur: 45, status: 'scheduled', reason: 'Respiratory therapy referral follow-up',       notes: 'Post-therapy assessment. Inhaler technique check.' },
    { p: 6, d: 0, day: 3, h: 13, min: 0,  dur: 30, status: 'scheduled', reason: 'Neurology consult results – chronic migraine',  notes: 'Review neurologist note. Discuss Aimovig authorization.' },
    { p: 9, d: 1, day: 3, h: 14, min: 0,  dur: 30, status: 'scheduled', reason: 'Hypertension – medication adjustment',         notes: 'BP still elevated at 148/92. Consider adding amlodipine.' },

    // FRIDAY
    { p: 5, d: 0, day: 4, h: 9,  min: 0,  dur: 30, status: 'scheduled', reason: 'Quarterly diabetes check',                     notes: 'HbA1c, renal function, urine ACR. Annual eye exam referral.' },
    { p: 4, d: 1, day: 4, h: 10, min: 0,  dur: 30, status: 'scheduled', reason: 'GERD follow-up – PPI efficacy review',         notes: 'Assess symptom control on omeprazole. Discuss dietary triggers.' },
    { p: 8, d: 2, day: 4, h: 11, min: 0,  dur: 30, status: 'scheduled', reason: 'Prenatal – routine 28-week check',             notes: 'BP monitoring. Rhogam injection if Rh negative.' },
    { p: 7, d: 2, day: 4, h: 13, min: 0,  dur: 45, status: 'scheduled', reason: 'INR clinic – warfarin monitoring',             notes: 'INR result to guide warfarin adjustment. Patient stable on 5mg.' },
  ];

  const appointments = [];
  for (const a of apptDefs) {
    const start = dt(a.day, a.h, a.min);
    const end = new Date(start.getTime() + a.dur * 60000);
    const appt = await Appointment.create({
      patientId: patients[a.p]._id, doctorId: doctors[a.d]._id,
      scheduledStartTime: start, scheduledEndTime: end,
      status: a.status, reasonForVisit: a.reason, notes: a.notes,
    });
    appointments.push(appt);
  }
  console.log(`  ✓ ${apptDefs.length} appointments created (Mon–Fri)\n`);

  // ─── WAITING ROOM (today's waiting patients) ──────────────────────────────
  for (const appt of appointments.filter(a => apptDefs[appointments.indexOf(a)]?.status === 'waiting')) {
    await WaitingRoom.create({
      appointmentId: appt._id, status: 'Waiting',
      checkedInAt: new Date(appt.scheduledStartTime.getTime() - 12 * 60000),
      note: '', flag: false,
    });
  }
  // Thomas Brown gets flagged due to allergies
  const thomasAppt = appointments[4];
  await WaitingRoom.findOneAndUpdate(
    { appointmentId: thomasAppt._id },
    { flag: true, note: 'Allergies: Penicillin, Iodine contrast – verify no contrast ordered' },
    { upsert: true }
  );
  console.log('  ✓ Waiting room entries created\n');

  // ─── PAST CONSULTATIONS (with SOAP notes) ─────────────────────────────────
  const consultDefs = [
    {
      p: 0, d: 0, daysAgo: 14,
      diagnoses: ['Type 2 Diabetes Mellitus – suboptimal control (HbA1c 8.2%)', 'Hypertension – stable'],
      symptoms: ['Fatigue', 'Increased thirst', 'Frequent urination'],
      examFindings: 'BP 138/84. HR 78. Heart regular. No peripheral edema. Bilateral foot exam normal. Sensation intact.',
      treatmentPlan: 'Increase metformin to 1000mg twice daily. Repeat HbA1c in 3 months. Referral to dietitian.',
      notes: 'HbA1c 8.2% (up from 7.8%). Patient reports poor dietary adherence during recent travel.',
      soap: {
        subjective: 'Chief complaint: Fatigue and increased thirst for 4 weeks\nDuration: 4 weeks\nSymptoms: Fatigue, increased thirst, frequent urination (nocturia x2)\nPain level: 2/10\nHistory: Patient reports difficulty sticking to diabetic diet during recent family trip. Increased carbohydrate intake noted.',
        objective: 'BP: 138/84 mmHg · HR: 78 bpm · Temp: 36.7°C\nFindings: Heart RRR, no murmurs. Abdomen soft. Bilateral lower extremity pulses intact. Monofilament sensation preserved bilaterally. No peripheral edema.',
        assessment: 'Diagnosis: T2DM with suboptimal glycemic control — HbA1c 8.2% (target <7%). Hypertension remains stable on current regimen.',
        plan: 'Treatment: Increase Metformin to 1000mg twice daily with meals. Continue Lisinopril 10mg and Atorvastatin 20mg. Order repeat HbA1c in 3 months. Referral to registered dietitian for medical nutrition therapy. Annual eye exam referral sent.',
      },
    },
    {
      p: 3, d: 2, daysAgo: 7,
      diagnoses: ['COPD exacerbation – mild to moderate'],
      symptoms: ['Shortness of Breath', 'Cough', 'Increased sputum production'],
      examFindings: 'O2 Sat 94% on room air. RR 20. Diffuse bilateral expiratory wheezes. No fever. No signs of consolidation.',
      treatmentPlan: 'Prednisone 40mg x 5 days. Increase albuterol to q4h while awake. Follow-up in 1 week.',
      notes: 'URTI onset 5 days ago triggered exacerbation. No antibiotic indicated — no purulent sputum, afebrile.',
      soap: {
        subjective: 'Chief complaint: Worsening shortness of breath and productive cough for 5 days\nDuration: 5 days (acute on chronic)\nSymptoms: Dyspnea on exertion, productive cough, increased sputum volume (clear/white)\nPain level: 3/10 (chest tightness)\nHistory: Viral URI onset 5 days ago. Increased albuterol from once daily to 4x/day without adequate relief.',
        objective: 'BP: 132/78 mmHg · HR: 88 bpm · Temp: 37.1°C · RR: 20 breaths/min · O2 Sat: 94% on room air\nFindings: Diffuse bilateral expiratory wheezes. Prolonged expiratory phase. No dullness to percussion. No accessory muscle use at rest.',
        assessment: 'Diagnosis: Mild-moderate COPD exacerbation — viral URI trigger. No evidence of bacterial superinfection (afebrile, clear sputum). Baseline O2 sat normally 97%.',
        plan: 'Treatment: Prednisone 40mg orally daily x5 days. Increase albuterol to q4h while awake. Continue tiotropium 18mcg once daily. Educate patient: ER if O2 Sat <90% or increased work of breathing. Follow-up in 1 week for reassessment.',
      },
    },
    {
      p: 7, d: 2, daysAgo: 10,
      diagnoses: ['Congestive Heart Failure – acute decompensation (dietary indiscretion)', 'Atrial Fibrillation – rate controlled'],
      symptoms: ['Shortness of Breath', 'Leg swelling'],
      examFindings: 'Weight 84kg (+3kg). BP 118/72. JVD at 45°. 2+ pitting edema to mid-shin. Bibasilar crackles. INR 2.6. Digoxin 0.8 ng/mL.',
      treatmentPlan: 'Increase furosemide to 80mg daily x3 days then revert to 40mg. Fluid restriction 1.5L/day. Daily weights.',
      notes: 'Dietary sodium indiscretion (high-sodium restaurant meal 4 days ago). Renal function stable — Cr 1.4 (baseline).',
      soap: {
        subjective: 'Chief complaint: Swollen legs and shortness of breath lying flat for 3 days\nDuration: 3 days\nSymptoms: Bilateral leg swelling, orthopnea (requires 2 pillows), dyspnea on moderate exertion\nPain level: 2/10\nHistory: High-sodium meal at restaurant 4 days ago. Weight up 3kg in 4 days. No missed medications.',
        objective: 'BP: 118/72 mmHg · HR: 68 bpm (paced) · Temp: 36.6°C · Weight: 84kg (+3kg from baseline)\nFindings: JVD at 45°. Bilateral pitting edema 2+ to mid-shin. Bibasilar crackles on auscultation. No S3. INR 2.6 (therapeutic). Digoxin 0.8 ng/mL (appropriate). Cr 1.4 (stable baseline).',
        assessment: 'Diagnosis: CHF decompensation secondary to dietary sodium indiscretion. AFib rate-controlled via pacemaker. No evidence of ACS or arrhythmia. Renal function at baseline.',
        plan: 'Treatment: Increase furosemide to 80mg daily x3 days, then return to 40mg. Strict fluid restriction 1.5L/day. Low-sodium diet counseling (<2g/day). Daily home weights — call clinic if >1kg in 24h or >2kg in 48h. Follow-up in 1 week.',
      },
    },
    {
      p: 6, d: 0, daysAgo: 21,
      diagnoses: ['Chronic Migraine – inadequately controlled on prophylaxis'],
      symptoms: ['Headache', 'Nausea', 'Dizziness'],
      examFindings: 'Neurological exam normal. No focal deficits. BP 118/74. HEENT normal. Neck supple.',
      treatmentPlan: 'Increase amitriptyline to 25mg at bedtime. Referral to neurology for CGRP inhibitor evaluation. Continue sumatriptan PRN.',
      notes: '12 migraine days this month — meets criteria for chronic migraine. Amitriptyline 10mg insufficient.',
      soap: {
        subjective: 'Chief complaint: Worsening migraines — 12 days this month\nDuration: Chronic, progressively worsening over 3 months\nSymptoms: Right-sided pulsating headache, nausea, photophobia, phonophobia\nPain level: 7/10 during episodes\nHistory: Amitriptyline 10mg prophylaxis since January — partial response. Sumatriptan 50mg abortive — effective within 2 hours but migraines recurring. No recent head trauma.',
        objective: 'BP: 118/74 mmHg · HR: 72 bpm · Temp: 36.7°C\nFindings: Cranial nerves II–XII intact. No papilledema. Fundoscopy normal. HEENT unremarkable. Neck supple — no meningismus. Romberg negative.',
        assessment: 'Diagnosis: Chronic migraine (>15 headache days/month, >8 with migraine features) — inadequately controlled on amitriptyline 10mg prophylaxis.',
        plan: 'Treatment: Increase amitriptyline to 25mg at bedtime. Continue sumatriptan 50mg PRN for breakthrough episodes. Urgent neurology referral for CGRP inhibitor evaluation (erenumab/fremanezumab). Headache diary to track frequency, duration, and triggers. Lifestyle counseling: regular sleep schedule, avoid red wine and aged cheese.',
      },
    },
    {
      p: 5, d: 1, daysAgo: 30,
      diagnoses: ['Type 2 Diabetes Mellitus – moderate control', 'Hyperlipidemia – at LDL goal'],
      symptoms: ['Fatigue', 'Nausea'],
      examFindings: 'BP 126/80. Weight 96kg (down 2kg). BMI 31. Abdomen soft, non-tender. No injection site reactions noted.',
      treatmentPlan: 'Continue semaglutide 0.5mg weekly. Titrate to 1mg at week 16 if tolerated. Repeat HbA1c in 3 months.',
      notes: 'Initial follow-up after starting semaglutide. Patient reports mild nausea — improving. Encouraged to take with food.',
      soap: {
        subjective: 'Chief complaint: Mild nausea since starting semaglutide 3 weeks ago\nDuration: 3 weeks\nSymptoms: Nausea (mild, particularly after injection), reduced appetite, fatigue\nPain level: 1/10\nHistory: Started semaglutide 0.5mg weekly 3 weeks ago. Nausea occurs 1–2 days post-injection and resolves spontaneously. Dietary modifications in progress.',
        objective: 'BP: 126/80 mmHg · HR: 74 bpm · Temp: 36.8°C · Weight: 96kg (-2kg since last visit) · BMI: 31\nFindings: Abdomen soft, non-tender. No hepatomegaly. No injection site erythema or lipodystrophy. LDL 88 mg/dL (at goal).',
        assessment: 'Diagnosis: T2DM — moderate control, improving. HbA1c 7.9% (down from 8.4%). Hyperlipidemia at LDL goal on atorvastatin. Semaglutide-related GI side effects — expected and transient.',
        plan: 'Treatment: Continue semaglutide 0.5mg once weekly. Advise to take with food and remain upright 30 min post-injection. Plan dose escalation to 1mg at week 16 if nausea resolved. Continue metformin 1000mg twice daily. Continue atorvastatin 40mg. Repeat HbA1c, CMP, urine ACR in 3 months.',
      },
    },
  ];

  for (const c of consultDefs) {
    const visitDate = new Date(SEED_DATE);
    visitDate.setDate(visitDate.getDate() - c.daysAgo);
    await Consultation.create({
      patientId: patients[c.p]._id,
      doctorId: doctors[c.d]._id,
      dateOfVisit: visitDate,
      vitals: {},
      symptoms: c.symptoms,
      examFindings: c.examFindings,
      diagnoses: c.diagnoses,
      treatmentPlan: c.treatmentPlan,
      notes: c.notes,
      wizardData: { soapNote: c.soap },
      status: 'completed',
      currentStep: 'complete',
      completedSteps: ['complete'],
      skippedSteps: [],
      lockedAt: visitDate,
    });
  }
  console.log(`  ✓ ${consultDefs.length} past consultations created\n`);

  // ─── TASKS ────────────────────────────────────────────────────────────────
  const taskDefs = [
    { d: 0, p: 0, title: 'Review HbA1c result and call patient',         type: 'lab-order',  priority: 'high',   due: 0, desc: 'HbA1c result pending. Call patient with result and confirm metformin dose increase.' },
    { d: 0, p: 6, title: 'Submit prior auth for Aimovig (erenumab)',     type: 'referral',   priority: 'medium', due: 2, desc: 'Complete prior authorization for erenumab 70mg. Attach neurology referral note.' },
    { d: 0, p: 9, title: 'Review PSA result — urology referral if >4.0', type: 'lab-order',  priority: 'high',   due: 2, desc: 'PSA drawn last week. Urology referral if PSA >4.0 ng/mL or elevated from baseline.' },
    { d: 0, p: 4, title: 'Send CBT referral for anxiety management',      type: 'referral',   priority: 'low',    due: 4, desc: 'Patient agreeable to CBT alongside sertraline. Find in-network therapist.' },
    { d: 1, p: 1, title: 'Follow up on spirometry results',               type: 'lab-order',  priority: 'medium', due: 1, desc: 'Spirometry ordered today. Review FEV1/FVC and update asthma action plan accordingly.' },
    { d: 1, p: 5, title: 'Call patient re: semaglutide nausea',           type: 'follow-up',  priority: 'medium', due: 0, desc: 'Patient left voicemail. Counsel on timing with food and reassure about dose escalation.' },
    { d: 1, p: 8, title: 'Order GDM 1-hour glucose challenge test',       type: 'lab-order',  priority: 'high',   due: 0, desc: '28-week GDM screen due. Order STAT. Notify patient of preparation instructions.' },
    { d: 1, p: 9, title: 'Consider adding amlodipine for hypertension',   type: 'follow-up',  priority: 'medium', due: 3, desc: 'BP 148/92 at last visit despite tamsulosin. Discuss adding amlodipine 5mg.' },
    { d: 2, p: 7, title: 'Review pacemaker remote monitoring report',     type: 'notes',      priority: 'high',   due: 1, desc: 'Device clinic flagged brief 2.8s pause. Review and determine if parameter adjustment needed.' },
    { d: 2, p: 3, title: 'Coordinate pulmonary rehab referral',           type: 'referral',   priority: 'medium', due: 3, desc: 'Refer patient to pulmonary rehab program. Verify Medi-Cal coverage first.' },
    { d: 2, p: 7, title: 'Warfarin dose adjustment — INR result',        type: 'follow-up',  priority: 'high',   due: 0, desc: 'INR sub-therapeutic (1.8) at last check. Review today\'s result and adjust if needed.' },
  ];

  for (const t of taskDefs) {
    const dueDate = new Date(SEED_DATE);
    dueDate.setDate(dueDate.getDate() + t.due);
    await Task.create({
      doctorId: doctors[t.d]._id, patientId: patients[t.p]._id,
      title: t.title, description: t.desc, type: t.type,
      priority: t.priority, status: 'pending', dueDate,
    });
  }
  console.log(`  ✓ ${taskDefs.length} tasks created\n`);

  // ─── ALERTS ───────────────────────────────────────────────────────────────
  const alertDefs = [
    { d: 2, p: 7, type: 'Drug Interaction',   due: 1, status: 'active', desc: 'Warfarin + Amoxicillin from urgent care visit. INR may become supra-therapeutic. Verify prescription and monitor INR closely.' },
    { d: 0, p: 0, type: 'Lab Overdue',        due: 0, status: 'active', desc: 'HbA1c overdue — last drawn 4 months ago. Target: every 3 months for uncontrolled T2DM (HbA1c >8%).' },
    { d: 1, p: 8, type: 'Preventive Care',    due: 0, status: 'active', desc: 'GDM screening (1-hour GCT) due at 28 weeks. Patient is currently 28+2 weeks — order urgently.' },
    { d: 2, p: 3, type: 'Critical Value',     due: 0, status: 'active', desc: 'O2 saturation 91% on room air at last visit (baseline 97%). Ensure repeat O2 sat documented at today\'s visit.' },
    { d: 0, p: 9, type: 'Screening Due',      due: 7, status: 'active', desc: 'Colonoscopy overdue — patient is 61, last colonoscopy >5 years ago. Family history of prostate cancer (elevated general cancer risk).' },
    { d: 1, p: 5, type: 'Lab Overdue',        due: 2, status: 'active', desc: 'Annual urine microalbuminuria not completed this year. Required for diabetic nephropathy screening in T2DM.' },
    { d: 2, p: 7, type: 'High-Risk Patient',  due: 3, status: 'active', desc: 'Thomas Brown: CHF + AFib + CKD Stage 3 + Penicillin/Iodine contrast allergies. Ensure allergy wristband in place if seen in hospital setting.' },
    { d: 0, p: 3, type: 'Allergy Alert',      due: 0, status: 'active', desc: 'Robert Martinez: NSAID allergy documented. Ensure no NSAIDs prescribed — patient has CAD and COPD. Use acetaminophen for pain.' },
  ];

  for (const a of alertDefs) {
    const dueDate = new Date(SEED_DATE);
    dueDate.setDate(dueDate.getDate() + a.due);
    await Alert.create({
      assignedTo: doctors[a.d]._id, patientId: patients[a.p]._id,
      type: a.type, description: a.desc, dueDate, status: a.status,
    });
  }
  console.log(`  ✓ ${alertDefs.length} alerts created\n`);

  // ─── MESSAGES ─────────────────────────────────────────────────────────────
  const messageDefs = [
    { from: 0, to: 2, minsAgo: 180, read: true,  content: 'Hi Emily – heads up that Margaret Sullivan (your Monday 9am) has a penicillin allergy on file. She mentioned being seen at urgent care last week. Can you confirm they didn\'t prescribe amoxicillin?' },
    { from: 2, to: 0, minsAgo: 160, read: true,  content: 'Thanks Sarah. Just checked — urgent care gave her azithromycin, so we\'re fine. I\'ll add a note to her chart flagging the penicillin allergy more prominently.' },
    { from: 1, to: 0, minsAgo: 130, read: true,  content: 'For James Okafor\'s spirometry today — do you want me to order standard PFT only, or include DLCO as well?' },
    { from: 0, to: 1, minsAgo: 120, read: true,  content: 'Just standard PFT for now. If FEV1/FVC is below 0.7 we\'ll add the full panel (DLCO + lung volumes) at the next visit.' },
    { from: 2, to: 1, minsAgo: 90,  read: false, content: 'Marcus — Thomas Brown\'s pacemaker remote monitoring flagged a 2.8s pause. I need device interrogation ASAP. Can you help coordinate with the cardiology device clinic for tomorrow?' },
    { from: 1, to: 2, minsAgo: 80,  read: true,  content: 'On it. Calling the device clinic now. I\'ll see if they can fit him in first thing tomorrow morning. Will update you.' },
    { from: 0, to: 1, minsAgo: 50,  read: false, content: 'Quick note — Priya Sharma (your 3pm prenatal) is Rh negative. Rhogam injection is due at 28 weeks. Make sure it\'s available before her appointment.' },
    { from: 1, to: 0, minsAgo: 40,  read: true,  content: 'Good catch. I\'ll confirm the pharmacy has it in stock and prep the injection kit. Thanks for the reminder.' },
    // Admin → doctors
    { fromAdmin: true, to: 0, minsAgo: 240, read: true,  content: 'Dr. Chen – HIPAA compliance training renewal is due by end of this month. Please complete the online module at your earliest convenience. Link sent to your email.' },
    { fromAdmin: true, to: 1, minsAgo: 210, read: true,  content: 'Dr. Williams – patient satisfaction survey received from James Okafor. He noted the wait time was longer than expected. Please review when you have a moment.' },
    { fromAdmin: true, to: 2, minsAgo: 190, read: false, content: 'Dr. Rodriguez – Priya Sharma\'s Anthem PPO has been verified for today\'s prenatal visit. 100% coverage, no co-pay. Thomas Brown\'s Medicare supplement also confirmed for his cardiology visit.' },
  ];

  for (const m of messageDefs) {
    const ts = new Date(Date.now() - m.minsAgo * 60000);
    await Message.create({
      senderId: m.fromAdmin ? admin._id : doctors[m.from]._id,
      receiverId: doctors[m.to]._id,
      content: m.content,
      isRead: m.read,
      timestamp: ts,
    });
  }
  console.log(`  ✓ ${messageDefs.length} messages created\n`);

  // ─── SUMMARY ─────────────────────────────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Seed complete. Login with password: Demo1234!');
  console.log('');
  console.log('  Doctors:');
  console.log('    sarah.chen       — Dr. Sarah Chen');
  console.log('    marcus.williams  — Dr. Marcus Williams');
  console.log('    emily.rodriguez  — Dr. Emily Rodriguez');
  console.log('');
  console.log('  Admin:');
  console.log('    admin');
  console.log('');
  console.log('  Patients (10):');
  console.log('    margaret.sullivan  james.okafor    linda.chen');
  console.log('    robert.martinez    aisha.johnson   david.park');
  console.log('    susan.kowalski     thomas.brown    priya.sharma');
  console.log('    carlos.rivera');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
