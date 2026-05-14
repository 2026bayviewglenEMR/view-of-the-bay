const Consultation = require("../models/Consultations");

const flowConfig = {
  steps: ["symptoms", "vitals", "diagnoses", "prescriptions", "treatmentPlan"],
  defaultStep: "symptoms",
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
    const {
      appointmentId,
      patientId,
      doctorId,
      dateOfVisit,
      vitals,
      symptoms,
      examFindings,
      diagnoses,
      prescriptions,
      treatmentPlan,
      notes,
    } = req.body;

    if (!patientId) {
      return res.status(400).json({
        message: "patientId is required.",
      });
    }

    const consultation = await Consultation.create({
      appointmentId,
      patientId,
      doctorId: doctorId || req.user.id,
      dateOfVisit: dateOfVisit || new Date(),
      vitals: vitals || {},
      symptoms: symptoms || [],
      examFindings,
      diagnoses: diagnoses || [],
      prescriptions: prescriptions || [],
      treatmentPlan,
      notes,
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

module.exports = {
  getFlowConfig,
  updateFlowConfig,
  createConsultation,
  getActiveConsultation,
  getConsultationByPatient,
  getConsultation,
  switchPatient,
  updateConsultationStep,
  skipStep,
  unskipStep,
  completeConsultation,
};