// models/Consultation.js
const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
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
      bloodPressure: {
        type: String,
        required: true,
      },
      heartRate: {
        type: Number,
        required: true,
      },
      temperature: {
        type: Number,
        required: true,
      },
      weight: {
        type: Number,
        required: true,
      },
    },
    symptoms: {
      type: [String],
      required: true,
    },
    diagnoses: {
      type: [String],
      required: true,
    },
    prescriptions: [
      {
        medicationName: {
          type: String,
          required: true,
        },
        dosage: {
          type: String,
          required: true,
        },
        instructions: {
          type: String,
          required: true,
        },
      },
    ],
    treatmentPlan: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    lockedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Consultation", consultationSchema);