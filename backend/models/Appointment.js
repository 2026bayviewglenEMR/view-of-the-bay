// models/Appointment.js
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
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
    scheduledStartTime: {
      type: Date,
      required: true,
    },
    scheduledEndTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "checked-in", "in-progress", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    appointmentType: {
      type: String,
      enum: ["telehealth", "in-person"],
      default: "in-person",
    },
    reasonForVisit: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    roomNumber: {
      type: String,
    },
    telehealth: {
      joinUrl: String,
      sessionId: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);