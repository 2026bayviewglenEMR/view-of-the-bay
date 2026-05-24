const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      default: "",
    },
    photoUrl: {
      type: String,
      default: "",
    },

    demographics: {
      phone: {
        type: String,
        default: "",
      },
      address: {
        type: String,
        default: "",
      },
      emergencyContact: {
        type: String,
        default: "",
      },
      insurance: {
        type: String,
        default: "",
      },
    },

    clinicalHistory: {
      conditions: {
        type: [String],
        default: [],
      },
      surgeries: {
        type: [String],
        default: [],
      },
      familyHistory: {
        type: String,
        default: "",
      },
      socialHistory: {
        type: String,
        default: "",
      },
    },

    executiveSummary: {
      allergies: {
        type: [String],
        default: [],
      },
      activeMedications: [
        {
          name: {
            type: String,
            required: true,
          },
          dosage: {
            type: String,
            required: true,
          },
          frequency: {
            type: String,
            required: true,
          },
        },
      ],
    },
  },
    // Tests ordered by doctors during or after consultations
    orderedTests: [
      {
        testId:     { type: String, required: true },
        testName:   { type: String, required: true },
        orderedBy:  { type: String, default: '' },       // "Dr. First Last"
        orderedById:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        orderedAt:  { type: Date, default: Date.now },
        status:     { type: String, enum: ['pending', 'completed'], default: 'pending' },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema, "patient");