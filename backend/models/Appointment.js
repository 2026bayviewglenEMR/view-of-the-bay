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
      required: true,
    },
    reasonForVisit: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);




//old stuff- Arees
// const mongoose = require("mongoose");

// const appointmentSchema = new mongoose.Schema(
//   {
//     patient: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Patient",
//       required: true,
//       index: true,
//     },
//     doctor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Doctor",
//       required: true,
//       index: true,
//     },
//     date: {
//       type: Date,
//       required: true,
//       index: true,
//     },
//     reason: String,
//     status: {
//       type: String,
//       enum: ["scheduled", "completed", "cancelled"],
//       default: "scheduled",
//       index: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Appointment", appointmentSchema);