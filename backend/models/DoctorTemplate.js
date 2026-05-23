const mongoose = require("mongoose");

const doctorTemplateSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "diagnosis",
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

doctorTemplateSchema.index({ doctorId: 1, updatedAt: -1 });

module.exports = mongoose.model("DoctorTemplate", doctorTemplateSchema);