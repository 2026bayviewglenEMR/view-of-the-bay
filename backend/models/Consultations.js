const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dateOfVisit: {
      type: Date,
      required: true,
    },
    vitals: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      weight: Number,
    },
    symptoms: {
      type: [String],
    },
    examFindings: String,
    diagnoses: {
      type: [String],
    },
    prescriptions: [
      {
        medicationName: {
          type: String,
        },
        dosage: {
          type: String,
        },
        instructions: {
          type: String,
        },
      },
    ],
    treatmentPlan: String,
    status: {
      type: String,
      default: "in-progress",
    },
    skippedSteps: {
      type: [String],
      default: [],
    },
    completedSteps: {
      type: [String],
      default: [],
    },
    currentStep: {
      type: String,
      default: "symptoms",
    },
    notes: String,
    templateForms: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lockedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Consultation", consultationSchema);
