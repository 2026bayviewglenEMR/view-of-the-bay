// models/Patient.js
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
    photoUrl: {
      type: String,
      required: true,
    },

    demographics: {
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      emergencyContact: {
        type: String,
        required: true,
      },
    },

    executiveSummary: {
      allergies: {
        type: [String],
        required: true,
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
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);

//old stuff -Arees

// const mongoose = require("mongoose");

// const patientSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       unique: true,
//     },
//     dateOfBirth: Date,
//     gender: {
//       type: String,
//       enum: ["male", "female", "other"],
//     },
//     phone: String,
//     address: String,

//     emergencyContact: {
//       name: String,
//       phone: String,
//     },

//     medicalHistory: [String],
//   },
//   { timestamps: true }
// );

// patientSchema.index({ user: 1 });

// module.exports = mongoose.model("Patient", patientSchema);