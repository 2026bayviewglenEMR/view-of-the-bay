const Consultation = require("../models/Consultations");
const Document = require("../models/Documents");
const Patient = require("../models/Patient");
const WaitingRoom = require("../models/waitingRoom.model");
const Appointment = require("../models/Appointment");
const { getTemplates } = require("../templates/templateSystem");

const getActiveWaitingRoomEntry = async (patientId) => {
  if (!patientId) return null;
  const entries = await WaitingRoom.find().populate("appointmentId");
  return entries.find(
    (entry) =>
      entry.appointmentId &&
      entry.appointmentId.patientId.toString() === patientId.toString()
  );
};
const {
  normalizeTemplateForms,
  validateTemplateForms,
} = require("../utils/templateData");

const flowConfig = {
  steps: [
    "symptoms",
    "physicalExam",
    "chooseNextSteps",
    "assessment",
    "orderTests",
    "prescribeMedication",
    "surgeryRequest",
    "referral",
    "patientInstructions",
    "followUp",
    "clinicalNotes",
    "complete",
  ],
  defaultStep: "symptoms",
};

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? undefined : numberValue;
};

const formatStructuredValue = (value) => {
  if (Array.isArray(value)) {
    return value
      .map(formatStructuredValue)
      .filter(Boolean)
      .join(", ");
  }

  if (value && typeof value === "object") {
    return [
      value.name || value.medicationName || value.drugName || value.label || value.id,
      value.dosage || value.dose,
      value.frequency,
      value.instructions,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return value;
};

const addNote = (notes, label, value) => {
  if (!value) return;

  const formattedValue = formatStructuredValue(value);
  if (!formattedValue) return;

  notes.push(`${label}: ${formattedValue}`);
};

const buildTemplateConsultationFields = (forms, templates, notes) => {
  const normalizedForms = normalizeTemplateForms(forms, templates);
  const symptomsForm = normalizedForms.symptoms_checklist || {};
  const diagnosisForm = normalizedForms.basic_diagnosis || {};
  const vitalsForm = normalizedForms.vitals_check || {};
  const mentalHealthForm = normalizedForms.mental_health || {};
  const medicationForm = normalizedForms.prescribe_medication || {};
  const assessmentForm = normalizedForms.clinical_assessment || {};
  const diagnosticOrdersForm = normalizedForms.diagnostic_orders || {};
  const surgeryRequestForm = normalizedForms.surgery_request || {};
  const referralRequestForm = normalizedForms.referral_request || {};
  const patientInstructionsForm = normalizedForms.patient_instructions || {};
  const followUpPlanForm = normalizedForms.follow_up_plan || {};
  const clinicalNotesForm = normalizedForms.clinical_notes || {};

  const consultationNotes = [];
  const treatmentPlanParts = [];

  addNote(consultationNotes, "Notes", notes);
  addNote(consultationNotes, "Symptom notes", symptomsForm.additional_notes);
  addNote(consultationNotes, "Chief complaint", diagnosisForm.chief_complaint);
  addNote(consultationNotes, "Pain level", diagnosisForm.pain_level);
  addNote(consultationNotes, "Symptom duration", diagnosisForm.symptom_duration);
  addNote(consultationNotes, "Allergies", diagnosisForm.allergies || medicationForm.allergies);
  addNote(
    consultationNotes,
    "Current medications",
    diagnosisForm.current_medications || medicationForm.current_medications
  );
  addNote(consultationNotes, "Examination notes", diagnosisForm.additional_notes);
  addNote(consultationNotes, "Vitals notes", vitalsForm.additional_notes);
  addNote(consultationNotes, "Current mood", mentalHealthForm.current_mood);
  addNote(consultationNotes, "Mental health notes", mentalHealthForm.additional_notes);
  addNote(consultationNotes, "Medication instructions", medicationForm.instructions);
  addNote(consultationNotes, "Differential diagnosis", assessmentForm.differential_diagnosis);
  addNote(consultationNotes, "Clinical impression", assessmentForm.clinical_impression);
  addNote(consultationNotes, "Diagnostic order", diagnosticOrdersForm.order_title);
  addNote(consultationNotes, "Diagnostic indication", diagnosticOrdersForm.clinical_question);
  addNote(consultationNotes, "Surgery request", surgeryRequestForm.procedure);
  addNote(consultationNotes, "Surgery reason", surgeryRequestForm.reason);
  addNote(consultationNotes, "Referral", referralRequestForm.refer_to);
  addNote(consultationNotes, "Referral reason", referralRequestForm.reason);
  addNote(consultationNotes, "Clinical notes", clinicalNotesForm.notes);
  addNote(consultationNotes, "Care team notes", clinicalNotesForm.care_team_notes);

  addNote(treatmentPlanParts, "Treatment plan", diagnosisForm.treatment_plan);
  addNote(treatmentPlanParts, "Patient home care", patientInstructionsForm.home_care);
  addNote(treatmentPlanParts, "Medication guidance", patientInstructionsForm.medication_guidance);
  addNote(treatmentPlanParts, "Return precautions", patientInstructionsForm.return_precautions);
  addNote(treatmentPlanParts, "Follow-up timeline", followUpPlanForm.timeline);
  addNote(treatmentPlanParts, "Follow-up with", followUpPlanForm.with_whom);
  addNote(treatmentPlanParts, "Monitoring plan", followUpPlanForm.monitoring_plan);
  addNote(treatmentPlanParts, "Surgery request", surgeryRequestForm.procedure);
  addNote(treatmentPlanParts, "Referral", referralRequestForm.refer_to);

  const prescribedMedications = Array.isArray(medicationForm.medications)
    ? medicationForm.medications
    : [];

  return {
    templateForms: normalizedForms,
    symptoms: symptomsForm.symptoms || [],
    vitals: {
      bloodPressure: vitalsForm.blood_pressure || "",
      heartRate: toNumber(vitalsForm.heart_rate),
      temperature: toNumber(vitalsForm.temperature),
      weight: toNumber(vitalsForm.weight),
      respiratoryRate: toNumber(vitalsForm.respiratory_rate),
    },
    examFindings: diagnosisForm.physical_exam || "",
    diagnoses: [
      diagnosisForm.diagnosis,
      assessmentForm.working_diagnosis,
    ].filter(Boolean),
    prescriptions: prescribedMedications.map((medication) => ({
      medicationName: medication.name || medication.id || medication,
      dosage: medicationForm.dosage || "",
      instructions: [medicationForm.frequency, medicationForm.instructions]
        .filter(Boolean)
        .join(" - "),
    })),
    treatmentPlan: treatmentPlanParts.join("\n"),
    notes: consultationNotes.join("\n"),
  };
};

const buildConsultationFields = (body, userId) => {
  const wizardData = body.wizardData || body.formData || {};
  const vitals = body.vitals || {};
  const notes = [];

  addNote(notes, "Chief complaint", wizardData.chiefComplaint);
  addNote(notes, "Symptom duration", wizardData.symptomDuration);
  addNote(notes, "History", wizardData.history);
  addNote(notes, "Pain level", wizardData.painLevel);
  addNote(notes, "Differential diagnosis", wizardData.differentialDiagnosis);
  addNote(notes, "Surgery request", wizardData.surgeryProcedure);
  addNote(notes, "Surgery urgency", wizardData.surgeryUrgency);
  addNote(notes, "Surgery reason", wizardData.surgeryReason);
  addNote(notes, "Referral to", wizardData.referralTo);
  addNote(notes, "Referral reason", wizardData.referralReason);
  addNote(notes, "Patient instructions", wizardData.patientInstructions);
  addNote(notes, "Return precautions", wizardData.returnPrecautions);
  addNote(notes, "Additional notes", wizardData.additionalNotes);

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
      respiratoryRate: wizardData.respiratoryRate ?? vitals.respiratoryRate,
      oxygenSaturation: wizardData.oxygenSaturation ?? vitals.oxygenSaturation,
    },
    symptoms: body.symptoms || wizardData.reportedSymptoms || [],
    examFindings: body.examFindings || wizardData.physicalFindings,
    diagnoses:
      body.diagnoses ||
      (wizardData.workingDiagnosis || wizardData.diagnosis
        ? [wizardData.workingDiagnosis || wizardData.diagnosis]
        : []),
    prescriptions: body.prescriptions || [],
    treatmentPlan:
      body.treatmentPlan ||
      [
        wizardData.plan,
        wizardData.followUpTimeline
          ? `Follow-up: ${wizardData.followUpTimeline}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    finalTreatmentPlan: body.finalTreatmentPlan,
    wizardData,
    templateForms: body.templateForms || {},
    testOrderDocuments:
      body.testOrderDocuments !== undefined ? body.testOrderDocuments : undefined,
    notes: body.notes || notes.join("\n"),
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

    let appointmentId = consultationFields.appointmentId;
    if (!appointmentId) {
      const waitingEntry = await getActiveWaitingRoomEntry(consultationFields.patientId);
      if (waitingEntry) {
        appointmentId = waitingEntry.appointmentId._id;
        consultationFields.appointmentId = appointmentId;
      }
    }

    if (appointmentId) {
      await WaitingRoom.findOneAndUpdate(
        { appointmentId },
        { status: "In consultation" }
      );
    }

    if (consultationFields.appointmentId) {
      const existing = await Consultation.findOne({
        appointmentId: consultationFields.appointmentId,
        status: "in-progress",
      });

      if (existing) {
        return res.status(400).json({
          message: "Consultation already active for this appointment.",
        });
      }
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

    if (consultation.appointmentId) {
      await WaitingRoom.findOneAndDelete({
        appointmentId: consultation.appointmentId,
      });
    }

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
    const { patientId, appointmentId, doctorId, dateOfVisit, notes, soapNote } =
      req.body;
    const forms = req.body.forms || req.body.templateForms || req.body.formData;

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

    const templateConsultationFields = buildTemplateConsultationFields(
      forms,
      templates,
      notes
    );

    let resolvedAppointmentId = appointmentId;
    if (!resolvedAppointmentId) {
      const waitingEntry = await getActiveWaitingRoomEntry(patientId);
      if (waitingEntry) {
        resolvedAppointmentId = waitingEntry.appointmentId._id;
      }
    }

    const consultation = await Consultation.create({
      appointmentId: resolvedAppointmentId,
      patientId,
      doctorId: doctorId || req.user.id,
      dateOfVisit: dateOfVisit || new Date(),
      ...templateConsultationFields,
      wizardData: soapNote ? { soapNote } : {},
      status: "completed",
      currentStep: "complete",
      completedSteps: ["complete"],
      skippedSteps: [],
      lockedAt: new Date(),
    });

    if (resolvedAppointmentId) {
      await WaitingRoom.findOneAndDelete({
        appointmentId: resolvedAppointmentId,
      });
    }

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
