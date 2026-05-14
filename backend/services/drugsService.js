// services/drugsService.js

const Drug = require('../models/Drug');
const Interaction = require('../models/Interaction');
const Patient = require('../models/Patient');

// Severity hierarchy for sorting results worst-first
const SEVERITY_ORDER = { CONTRAINDICATED: 0, MAJOR: 1, MODERATE: 2, MINOR: 3 };

// ─── Drug Search ──────────────────────────────────────────────────────────────

const searchDrugs = async (query, limit = 10, page = 1) => {
  const skip = (page - 1) * limit;
  const drugs = await Drug.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit)
    .select('name genericName drugClass strength form manufacturer');

  return drugs;
};

// ─── Mode 1: Check a list of drug IDs against each other ─────────────────────

const checkInteractionsBetweenDrugs = async (drugIds) => {
  if (!drugIds || drugIds.length < 2) {
    return { interactions: [], safe: true };
  }

  // Query all interactions where BOTH drugs in the pair are in our list.
  // The interaction document stores drugA and drugB as references.
  const interactions = await Interaction.find({
    $or: [
      { drugA: { $in: drugIds }, drugB: { $in: drugIds } },
    ],
  })
    .populate('drugA', 'name genericName')
    .populate('drugB', 'name genericName');

  // Filter: both drugA AND drugB must be in the provided list
  // (the $in query above can return partial matches)
  const drugIdSet = new Set(drugIds.map(String));
  const confirmed = interactions.filter(
    (i) => drugIdSet.has(String(i.drugA._id)) && drugIdSet.has(String(i.drugB._id))
  );

  const sorted = confirmed.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  return {
    interactions: sorted,
    safe: sorted.length === 0,
    hasContraindications: sorted.some((i) => i.severity === 'CONTRAINDICATED'),
    hasMajor: sorted.some((i) => i.severity === 'MAJOR'),
  };
};

// ─── Mode 2: Check a new drug against a patient's entire active med list ──────

const checkDrugAgainstPatient = async (newDrugId, patientId) => {
  // Step 1: pull patient's active medications + allergies in one query
  const patient = await Patient.findById(patientId)
    .select('medications allergies')
    .populate('medications.drugId', 'name genericName drugClass');

  if (!patient) throw new Error('Patient not found');

  const activeMedications = patient.medications.filter(
    (m) => m.status === 'active'
  );

  const activeDrugIds = activeMedications.map((m) => String(m.drugId._id));

  // Step 2: run the pairwise check (newDrug vs each active drug)
  const allIds = [String(newDrugId), ...activeDrugIds];
  const interactionResult = await checkInteractionsBetweenDrugs(allIds);

  // Step 3: allergy cross-check
  // Fetch the new drug's allergen tags (e.g. "penicillin-class", "sulfa")
  const newDrug = await Drug.findById(newDrugId).select(
    'name genericName allergenTags drugClass'
  );

  const allergyFlags = patient.allergies
    .filter((allergy) => {
      // Check if any of the drug's allergen tags match a recorded allergy
      return (
        allergy.allergen.toLowerCase() === newDrug.genericName.toLowerCase() ||
        allergy.allergen.toLowerCase() === newDrug.name.toLowerCase() ||
        newDrug.allergenTags?.some(
          (tag) => tag.toLowerCase() === allergy.allergen.toLowerCase()
        )
      );
    })
    .map((allergy) => ({
      allergen: allergy.allergen,
      reaction: allergy.reaction,
      severity: allergy.severity,
      flag: 'ALLERGY_MATCH',
    }));

  // Step 4: assemble final result the frontend uses to decide whether to proceed
  return {
    newDrug: { id: newDrug._id, name: newDrug.name },
    patientActiveMeds: activeMedications.map((m) => ({
      id: m._id,
      name: m.drugId.name,
      dose: m.dose,
    })),
    interactions: interactionResult.interactions,
    allergyFlags,
    safe: interactionResult.safe && allergyFlags.length === 0,
    hasContraindications: interactionResult.hasContraindications,
    hasMajor: interactionResult.hasMajor,
    hasAllergyMatch: allergyFlags.length > 0,
    // Clinician override is recorded when they proceed despite warnings
    requiresOverride:
      interactionResult.hasContraindications ||
      interactionResult.hasMajor ||
      allergyFlags.some((a) => a.severity === 'SEVERE'),
  };
};

module.exports = {
  searchDrugs,
  checkInteractionsBetweenDrugs,
  checkDrugAgainstPatient,
};