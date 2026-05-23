import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
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

consultationSchema.index({ patientId: 1, createdAt: -1 });
consultationSchema.index({ templateId: 1, createdAt: -1 });

export default mongoose.model("Consultation", consultationSchema);