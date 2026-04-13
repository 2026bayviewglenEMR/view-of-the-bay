// models/Document.js
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    documentType: {
      type: String,
      required: true,
    },
    access: {
      scope: {
        type: String,
        required: true,
      },
      roles: {
        type: [String],
        required: true,
      },
      userIds: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
      },
    },
    uploadDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);