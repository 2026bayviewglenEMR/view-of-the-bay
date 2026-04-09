const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    phone: String,
    address: String,

    emergencyContact: {
      name: String,
      phone: String,
    },

    medicalHistory: [String],
  },
  { timestamps: true }
);

patientSchema.index({ user: 1 });

module.exports = mongoose.model("Patient", patientSchema);