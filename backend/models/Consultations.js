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
      systolicBP: Number,
      diastolicBP: Number,
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
    wizardData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    finalTreatmentPlan: {
      diagnosis: String,
      prescriptions: String,
      plan: String,
      followUp: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      updatedAt: Date,
    },
    testOrderDocuments: [
      {
        title: {
          type: String,
          required: true,
        },
        testType: {
          type: String,
          required: true,
        },
        priority: {
          type: String,
          default: "routine",
        },
        instructions: String,
        documentText: String,
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    templateForms: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lockedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Consultation", consultationSchema);
