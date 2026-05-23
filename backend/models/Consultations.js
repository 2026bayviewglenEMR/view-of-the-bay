const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      trim: true,
    },

    forms: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

consultationSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model("Consultation", consultationSchema);