const Patient = require("../models/Patient");
const Consultation = require("../models/Consultations");
const Appointment = require("../models/Appointment");

const getAllPatients = async (req, res) => {
  try {
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

module.exports = {
  getAllPatients,
  getPatientById,
  getPatientSummary,
  getPatientEncounters,
  addPatientNote,
};