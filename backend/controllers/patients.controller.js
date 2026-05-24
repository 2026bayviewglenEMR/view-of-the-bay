const Patient = require("../models/Patient");
const Consultation = require("../models/Consultations");
const Appointment = require("../models/Appointment");

const canReadPatient = (req, patientId) => {
  const role = req.user?.role?.toLowerCase();

  if (role === "doctor" || role === "admin") {
    return true;
  }

  if (role === "patient") {
    return req.user.patientId?.toString() === patientId?.toString();
  }

  return false;
};

const canEditPatientClinicalData = (req) => {
  return req.user?.role?.toLowerCase() === "doctor";
};

const getAllPatients = async (req, res) => {
  try {
    if (req.user?.role?.toLowerCase() === "patient") {
      return res.status(403).json({
        message: "Patients cannot view other patient records.",
      });
    }

    const patients = await Patient.find();

    res.json(patients);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch patients",
    });
  }
};

const getPatientById = async (req, res) => {
  try {
    if (!canReadPatient(req, req.params.id)) {
      return res.status(403).json({
        message: "You can only access your own patient record.",
      });
    }

    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.json(patient);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch patient",
    });
  }
};

const getPatientSummary = async (req, res) => {
  try {
    if (!canReadPatient(req, req.params.id)) {
      return res.status(403).json({
        message: "You can only access your own patient summary.",
      });
    }

    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.json({
      id: patient._id,
      name: `${patient.firstName} ${patient.lastName}`,
      allergies: patient.executiveSummary?.allergies || [],
      medications:
        patient.executiveSummary?.activeMedications || [],
      phone: patient.demographics?.phone,
      emergencyContact:
        patient.demographics?.emergencyContact,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch summary",
    });
  }
};

const getPatientEncounters = async (req, res) => {
  try {
    if (!canReadPatient(req, req.params.id)) {
      return res.status(403).json({
        message: "You can only access your own patient encounters.",
      });
    }

    const encounters = await Consultation.find({
      patientId: req.params.id,
    })
      .populate("doctorId")
      .sort({ createdAt: -1 });

    res.json(encounters);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch encounters",
    });
  }
};

const addPatientNote = async (req, res) => {
  try {
    if (!canEditPatientClinicalData(req)) {
      return res.status(403).json({
        message: "Only doctors can add clinical notes.",
      });
    }

    const { note } = req.body;

    if (!note) {
      return res.status(400).json({
        message: "Note is required",
      });
    }

    const consultation = await Consultation.findOne({
      patientId: req.params.id,
    }).sort({ createdAt: -1 });

    if (!consultation) {
      return res.status(404).json({
        message: "No consultation found",
      });
    }

    consultation.notes =
      (consultation.notes || "") +
      "\n" +
      note;

    await consultation.save();

    res.json({
      message: "Note added",
      notes: consultation.notes,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to add note",
    });
  }
};

const saveOrderedTests = async (req, res) => {
  try {
    if (!canEditPatientClinicalData(req)) {
      return res.status(403).json({ message: "Only doctors can order tests." });
    }

    const { tests } = req.body; // [{ testId, testName }]
    if (!Array.isArray(tests) || tests.length === 0) {
      return res.status(400).json({ message: "tests array is required." });
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found." });

    // Only add tests that aren't already pending for this patient
    const pendingIds = new Set(
      patient.orderedTests
        .filter(t => t.status === 'pending')
        .map(t => t.testId)
    );

    const newTests = tests
      .filter(t => !pendingIds.has(t.testId))
      .map(t => ({
        testId:      t.testId,
        testName:    t.testName,
        orderedBy:   req.user.firstName && req.user.lastName
                       ? `Dr. ${req.user.firstName} ${req.user.lastName}`
                       : req.user.username,
        orderedById: req.user.id,
        orderedAt:   new Date(),
        status:      'pending',
      }));

    patient.orderedTests.push(...newTests);
    await patient.save();

    res.json({ orderedTests: patient.orderedTests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save ordered tests." });
  }
};

const saveDraft = async (req, res) => {
  try {
    if (!canEditPatientClinicalData(req)) {
      return res.status(403).json({ message: "Only doctors can save consultation drafts." });
    }

    const { forms, currentIndex } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found." });

    patient.consultationDraft = {
      forms:        forms || {},
      currentIndex: currentIndex ?? 0,
      savedBy:      req.user.firstName && req.user.lastName
                      ? `Dr. ${req.user.firstName} ${req.user.lastName}`
                      : req.user.username,
      savedById:    req.user.id,
      savedAt:      new Date(),
    };
    await patient.save();
    res.json({ consultationDraft: patient.consultationDraft });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save draft." });
  }
};

const clearDraft = async (req, res) => {
  try {
    if (!canEditPatientClinicalData(req)) {
      return res.status(403).json({ message: "Only doctors can clear consultation drafts." });
    }

    await Patient.findByIdAndUpdate(req.params.id, { $unset: { consultationDraft: "" } });
    res.json({ message: "Draft cleared." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to clear draft." });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  getPatientSummary,
  getPatientEncounters,
  addPatientNote,
  saveOrderedTests,
  saveDraft,
  clearDraft,
};
