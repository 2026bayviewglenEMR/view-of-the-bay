const Consultation = require("../models/Consultation");
const { getTemplates } = require("../templates/templateSystem");
const {
  normalizeTemplateForms,
  validateTemplateForms,
} = require("../utils/templateData");

const completeConsultation = async (req, res) => {
  try {
    const templates = getTemplates();

    const errors = validateTemplateForms(req.body.forms, templates);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Invalid consultation forms",
        errors,
      });
    }

    const consultation = await Consultation.create({
      patientId: req.body.patientId,
      forms: normalizeTemplateForms(req.body.forms, templates),
      status: "completed",
    });

    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({
      message: "Failed to complete consultation",
      error: error.message,
    });
  }
};

const getConsultations = async (req, res) => {
  try {
    const filter = {};

    if (req.query.patientId) {
      filter.patientId = req.query.patientId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const consultations = await Consultation.find(filter).sort({
      createdAt: -1,
    });

    res.json(consultations);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get consultations",
      error: error.message,
    });
  }
};

const getConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.consultationId);

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found",
      });
    }

    res.json(consultation);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get consultation",
      error: error.message,
    });
  }
};

module.exports = {
  completeConsultation,
  getConsultations,
  getConsultation,
};