// models/Alert.js
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;







//old stuff below-Arees


// const mongoose = require("mongoose");

// const alertSchema = new mongoose.Schema(
//   {
//     patient: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Patient",
//       index: true,
//     },
//     assignedTo: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       index: true,
//     },

//     type: {
//       type: String,
//       enum: ["patient", "screening", "task"],
//       required: true,
//       index: true,
//     },

//     title: {
//       type: String,
//       required: true,
//     },
//     message: String,

//     priority: {
//       type: String,
//       enum: ["low", "medium", "high"],
//       default: "medium",
//       index: true,
//     },

//     dueDate: Date,

//     status: {
//       type: String,
//       enum: ["active", "completed", "dismissed"],
//       default: "active",
//       index: true,
//     },

//     dismissedAt: Date,
//     completedAt: Date,
//   },
//   { timestamps: true }
// );

// // Helpful indexes
// alertSchema.index({ patient: 1, status: 1 });
// alertSchema.index({ assignedTo: 1, status: 1 });

// module.exports = mongoose.model("Alert", alertSchema);