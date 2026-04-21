const Consultation = require("../models/Consultations");

const getFlowConfig = async (req, res) => {
  try {
    const defaultFlow = {
      steps: [
        { id: "symptoms", label: "Symptoms", required: false, enabled: true },
        { id: "exam", label: "Physical Exam", required: false, enabled: true },
        { id: "vitals", label: "Vitals", required: true, enabled: true },
        { id: "diagnosis", label: "Diagnosis", required: true, enabled: true },
        { id: "treatment", label: "Treatment Plan", required: true, enabled: true },
      ],
      defaultOrder: ["symptoms", "exam", "vitals", "diagnosis", "treatment"],
    };
    res.json(defaultFlow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFlowConfig = async (req, res) => {
  try {
    const { steps, defaultOrder } = req.body;
    res.json({ steps, defaultOrder, message: "Flow config updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createConsultation = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId } = req.body;
    const consultation = new Consultation({
      patientId,
      doctorId,
      appointmentId,
      dateOfVisit: new Date(),
      status: "in-progress",
      skippedSteps: [],
      completedSteps: [],
      currentStep: "symptoms",
    });
    await consultation.save();
    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConsultationByPatient = async (req, res) => {
  try {
    const consultation = await Consultation.findOne({
      patientId: req.params.patientId,
      status: "in-progress",
    }).sort({ createdAt: -1 });
    if (!consultation) {
      return res.status(404).json({ message: "No active consultation found" });
    }
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const switchPatient = async (req, res) => {
  try {
    const { consultationId, newPatientId, appointmentId } = req.body;

    const currentConsultation = await Consultation.findById(consultationId);
    if (currentConsultation) {
      currentConsultation.status = "paused";
      await currentConsultation.save();
    }

    let newConsultation = await Consultation.findOne({
      patientId: newPatientId,
      status: "in-progress",
    });

    if (!newConsultation) {
      newConsultation = new Consultation({
        patientId: newPatientId,
        doctorId: req.body.doctorId,
        appointmentId,
        dateOfVisit: new Date(),
        status: "in-progress",
        skippedSteps: [],
        completedSteps: [],
        currentStep: "symptoms",
      });
      await newConsultation.save();
    }

    res.json(newConsultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateConsultationStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStep, skippedSteps, completedSteps, stepData } = req.body;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (currentStep) consultation.currentStep = currentStep;
    if (skippedSteps) consultation.skippedSteps = skippedSteps;
    if (completedSteps) consultation.completedSteps = completedSteps;

    if (stepData) {
      if (stepData.symptoms) consultation.symptoms = stepData.symptoms;
      if (stepData.examFindings) consultation.examFindings = stepData.examFindings;
      if (stepData.vitals) consultation.vitals = stepData.vitals;
      if (stepData.diagnoses) consultation.diagnoses = stepData.diagnoses;
      if (stepData.treatmentPlan) consultation.treatmentPlan = stepData.treatmentPlan;
      if (stepData.notes) consultation.notes = stepData.notes;
    }

    await consultation.save();
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const skipStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { stepId } = req.body;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (!consultation.skippedSteps.includes(stepId)) {
      consultation.skippedSteps.push(stepId);
    }

    await consultation.save();
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unskipStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { stepId } = req.body;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    consultation.skippedSteps = consultation.skippedSteps.filter(
      (s) => s !== stepId
    );

    await consultation.save();
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completeConsultation = async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    consultation.status = "completed";
    consultation.lockedAt = new Date();
    await consultation.save();

    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActiveConsultation = async (req, res) => {
  try {
    const doctorId = req.user?.id || req.query.doctorId;
    const consultation = await Consultation.findOne({
      doctorId,
      status: { $in: ["in-progress", "paused"] },
    }).sort({ updatedAt: -1 });

    res.json(consultation || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFlowConfig,
  updateFlowConfig,
  createConsultation,
  getConsultation,
  getConsultationByPatient,
  switchPatient,
  updateConsultationStep,
  skipStep,
  unskipStep,
  completeConsultation,
  getActiveConsultation,
};