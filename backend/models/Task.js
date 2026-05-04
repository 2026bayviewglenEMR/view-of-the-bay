const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    dueDate: Date,
    completedAt: Date,
    type: {
      type: String,
      enum: ["follow-up", "lab-order", "referral", "notes", "other"],
      default: "other",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);