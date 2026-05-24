import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      trim: true
    },

    templateId: {
      type: String,
      trim: true
    },

    templateName: {
      type: String,
      trim: true
    },

    data: {
      type: mongoose.Schema.Types.Mixed
    },

    forms: {
      type: mongoose.Schema.Types.Mixed
    },

    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft"
    }
  },
  {
    timestamps: true
  }
);

templateSchema.index({ patientId: 1, createdAt: -1 });
templateSchema.index({ templateId: 1, createdAt: -1 });

export default mongoose.model("Template", templateSchema);