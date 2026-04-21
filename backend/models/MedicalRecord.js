
//dont think we need -Arees

// const mongoose = require("mongoose");

// const medicalRecordSchema = new mongoose.Schema(
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
//       index: true,
//     },

//     diagnosis: String,
//     treatment: String,
//     notes: String,

//     prescriptions: [
//       {
//         medication: String,
//         dosage: String,
//         duration: String,
//       },
//     ],

//     visitDate: {
//       type: Date,
//       default: Date.now,
//       index: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);