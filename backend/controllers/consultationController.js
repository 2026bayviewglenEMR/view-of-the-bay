const Consultation = require("../models/Consultations");
const Document = require("../models/Documents");
const Patient = require("../models/Patient");
const { getTemplates } = require("../templates/templateSystem");
const {
  normalizeTemplateForms,
  validateTemplateForms,
} = require("../utils/templateData");

const flowConfig = {
  steps: ["symptoms", "vitals", "diagnosePrescribe", "plan"],
  defaultStep: "symptoms",
};

const buildConsultationFields = (body, userId) => {
  const wizardData = body.wizardData || body.formData || {};
  const vitals = body.vitals || {};

  return {
    appointmentId: body.appointmentId,
    patientId: body.patientId,
    doctorId: body.doctorId || userId,
    dateOfVisit: body.dateOfVisit || new Date(),
    vitals: {
      ...vitals,
      systolicBP: wizardData.systolicBP ?? vitals.systolicBP,
      diastolicBP: wizardData.diastolicBP ?? vitals.diastolicBP,
      temperature: wizardData.temperature ?? vitals.temperature,
      heartRate: wizardData.heartRate ?? vitals.heartRate,
    },
    symptoms: body.symptoms || wizardData.reportedSymptoms || [],
    examFindings: body.examFindings || wizardData.physicalFindings,
    diagnoses: body.diagnoses || (wizardData.diagnosis ? [wizardData.diagnosis] : []),
    prescriptions: body.prescriptions || [],
    treatmentPlan: body.treatmentPlan || wizardData.plan,
    finalTreatmentPlan: body.finalTreatmentPlan,
    wizardData,
    templateForms: body.templateForms || {},
    notes: body.notes || wizardData.history,
  };
};

const getFlowConfig = async (req, res) => {
  try {
    return res.status(200).json(flowConfig);
  } catch (error) {
    return res.status(500).json({
      message: "Server error while loading flow config.",
      error: error.message,
    });
  }
};

const updateFlowConfig = async (req, res) => {
  try {
    const { steps, defaultStep } = req.body;

    if (steps) {
      flowConfig.steps = steps;
    }

    if (defaultStep) {
      flowConfig.defaultStep = defaultStep;
    }

    return res.status(200).json({
      message: "Flow config updated successfully.",
      flowConfig,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating flow config.",
      error: error.message,
    });
  }
};

const createConsultation = async (req, res) => {
  try {
    const consultationFields = buildConsultationFields(req.body, req.user.id);

    if (!consultationFields.patientId) {
      return res.status(400).json({
        message: "patientId is required.",
      });
    }

    const consultation = await Consultation.create({
      ...consultationFields,
      status: "in-progress",
      currentStep: "symptoms",
      completedSteps: [],
      skippedSteps: [],
    });

    return res.status(201).json({
      message: "Consultation created successfully.",
      consultation,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while creating consultation.",
      error: error.message,
    });
  }
};

const getActiveConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findOne({
      doctorId: req.user.id,
      status: "in-progress",
    })
      .populate("patientId")
      .populate("doctorId")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      consultation,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while getting active consultation.",
      error: error.message,
    });
  }
};

const getConsultationByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const consultations = await Consultation.find({ patientId })
      .populate("patientId")
      .populate("doctorId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      consultations,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while getting patient consultations.",
      error: error.message,
    });
  }
};

const getConsultation = async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findById(id)
      .populate("patientId")
      .populate("doctorId");

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found.",
      });
    }

    return res.status(200).json({
      consultation,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while getting consultation.",
      error: error.message,
    });
  }
};

const switchPatient = async (req, res) => {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({
        message: "patientId is required.",
      });
    }

    let consultation = await Consultation.findOne({
      patientId,
      doctorId: req.user.id,
      status: "in-progress",
    });

    if (!consultation) {
      consultation = await Consultation.create({
        patientId,
        doctorId: req.user.id,
        dateOfVisit: new Date(),
        status: "in-progress",
        currentStep: "symptoms",
        completedSteps: [],
        skippedSteps: [],
      });
    }

    return res.status(200).json({
      message: "Patient switched successfully.",
      consultation,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while switching patient.",
      error: error.message,
    });
  }
};

const updateConsultationStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStep, completedStep, data } = req.body;

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found.",
      });
    }

    if (currentStep) {
      consultation.currentStep = currentStep;
    }

    if (completedStep && !consultation.completedSteps.includes(completedStep)) {
      consultation.completedSteps.push(completedStep);
    }

    if (data && typeof data === "object") {
      Object.keys(data).forEach((key) => {
        consultation[key] = data[key];
      });
    }

    await consultation.save();

    return res.status(200).json({
      message: "Consultation step updated successfully.",
      consultation,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating consultation step.",
      error: error.message,
    });
  }
};

const skipStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { step } = req.body;

    if (!step) {
      return res.status(400).json({
        message: "step is required.",
      });
    }

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found.",
      });
    }

    if (!consultation.skippedSteps.includes(step)) {
      consultation.skippedSteps.push(step);
    }

    await consultation.save();

    return res.status(200).json({
      message: "Step skipped successfully.",
      consultation,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while skipping step.",
      error: error.message,
    });
  }
};

const unskipStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { step } = req.body;

    if (!step) {
      return res.status(400).json({
        message: "step is required.",
      });
    }

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found.",
      });
    }

    consultation.skippedSteps = consultation.skippedSteps.filter(
      (skippedStep) => skippedStep !== step
    );

    await consultation.save();

    return res.status(200).json({
      message: "Step unskipped successfully.",
      consultation,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while unskipping step.",
      error: error.message,
    });
  }
};

const completeConsultation = async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found.",
      });
    }

    consultation.status = "completed";
    consultation.lockedAt = new Date();

    if (!consultation.completedSteps.includes("complete")) {
      consultation.completedSteps.push("complete");
    }

    await consultation.save();

    return res.status(200).json({
      message: "Consultation completed successfully.",
      consultation,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while completing consultation.",
      error: error.message,
    });
  }
};

const completeTemplateConsultation = async (req, res) => {
  try {
    const { patientId, appointmentId, doctorId, dateOfVisit, forms, notes } =
      req.body;

    if (!patientId) {
      return res.status(400).json({
        message: "patientId is required.",
      });
    }

    const templates = getTemplates();
    const errors = validateTemplateForms(forms, templates);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Invalid consultation forms.",
        errors,
      });
    }

    const consultation = await Consultation.create({
      appointmentId,
      patientId,
      doctorId: doctorId || req.user.id,
      dateOfVisit: dateOfVisit || new Date(),
      templateForms: normalizeTemplateForms(forms, templates),
      notes,
      status: "completed",
      currentStep: "complete",
      completedSteps: ["complete"],
      skippedSteps: [],
      lockedAt: new Date(),
    });

    return res.status(201).json({
      message: "Consultation templates saved successfully.",
      consultation,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while saving consultation templates.",
      error: error.message,
    });
  }
};

const updateConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found.",
      });
    }

    const updates = buildConsultationFields(req.body, req.user.id);

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        consultation[key] = updates[key];
      }
    });

    if (req.body.status) {
      consultation.status = req.body.status;
    }

    if (req.body.currentStep) {
      consultation.currentStep = req.body.currentStep;
    }

    await consultation.save();

    return res.status(200).json({
      message: "Consultation updated successfully.",
      consultation,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating consultation.",
      error: error.message,
    });
  }
};

const deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findByIdAndDelete(id);

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found.",
      });
    }

    return res.status(200).json({
      message: "Consultation deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while deleting consultation.",
      error: error.message,
    });
  }
};

const getPatientClinicalRecord = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found.",
      });
    }

    const consultations = await Consultation.find({ patientId })
      .populate("doctorId")
      .sort({ dateOfVisit: -1 });

    const documents = await Document.find({ patientId }).sort({ createdAt: -1 });

    return res.status(200).json({
      patient,
      history: consultations,
      documents,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while getting patient clinical record.",
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

    if (req.query.doctorId) {
      filter.doctorId = req.query.doctorId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const consultations = await Consultation.find(filter)
      .populate("patientId")
      .populate("doctorId")
      .sort({ createdAt: -1 });

    return res.status(200).json({ consultations });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while getting consultations.",
      error: error.message,
    });
  }
};

const getConsultationsByDoctor = async (req, res) => {
  try {
    const consultations = await Consultation.find({
      doctorId: req.params.doctorId,
    })
      .populate("patientId")
      .populate("doctorId")
      .sort({ createdAt: -1 });

    return res.status(200).json({ consultations });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while getting doctor consultations.",
      error: error.message,
    });
  }
};

const saveFinalTreatmentPlan = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found.",
      });
    }

    consultation.finalTreatmentPlan = {
      diagnosis: req.body.diagnosis,
      prescriptions: req.body.prescriptions,
      plan: req.body.plan,
      followUp: req.body.followUp,
      updatedBy: req.user.id,
      updatedAt: new Date(),
    };

    consultation.treatmentPlan = req.body.plan || consultation.treatmentPlan;

    if (req.body.diagnosis) {
      consultation.diagnoses = [req.body.diagnosis];
    }

    await consultation.save();

    return res.status(200).json({
      message: "Final treatment plan saved successfully.",
      finalTreatmentPlan: consultation.finalTreatmentPlan,
      consultation,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while saving final treatment plan.",
      error: error.message,
    });
  }
};

const getFinalTreatmentPlan = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found.",
      });
    }

    return res.status(200).json({
      finalTreatmentPlan: consultation.finalTreatmentPlan,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while getting final treatment plan.",
      error: error.message,
    });
  }
};

const createTestOrderDocument = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found.",
      });
    }

    const testOrder = {
      title: req.body.title,
      testType: req.body.testType,
      priority: req.body.priority || "routine",
      instructions: req.body.instructions,
      documentText: req.body.documentText,
      createdBy: req.user.id,
      createdAt: new Date(),
    };

    if (!testOrder.title || !testOrder.testType) {
      return res.status(400).json({
        message: "title and testType are required.",
      });
    }

    consultation.testOrderDocuments.push(testOrder);
    await consultation.save();

    return res.status(201).json({
      message: "Test order document created successfully.",
      testOrderDocuments: consultation.testOrderDocuments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while creating test order document.",
      error: error.message,
    });
  }
};

const getTestOrderDocuments = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found.",
      });
    }

    return res.status(200).json({
      testOrderDocuments: consultation.testOrderDocuments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while getting test order documents.",
      error: error.message,
    });
  }
};

module.exports = {
  getFlowConfig,
  updateFlowConfig,
  createConsultation,
  getConsultations,
  getConsultationsByDoctor,
  getActiveConsultation,
  getConsultationByPatient,
  getConsultation,
  updateConsultation,
  deleteConsultation,
  getPatientClinicalRecord,
  switchPatient,
  updateConsultationStep,
  skipStep,
  unskipStep,
  completeConsultation,
  completeTemplateConsultation,
  saveFinalTreatmentPlan,
  getFinalTreatmentPlan,
  createTestOrderDocument,
  getTestOrderDocuments,
};
