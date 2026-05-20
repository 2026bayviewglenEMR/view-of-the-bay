const mongoose = require("mongoose");

// Lightweight — only tracks what Appointment doesn't already know:
// check-in time, waiting-room status, flag, and a receptionist note.
const waitingRoomSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true, // one entry per appointment
    },
    status: {
      type: String,
      enum: ["Checked-in", "Waiting", "In consultation"],
      default: "Checked-in",
    },
    checkedInAt: {
      type: Date,
      default: Date.now,
    },
    // Receptionist note shown in the table (separate from Appointment.notes)
    note: {
      type: String,
      default: "",
      trim: true,
    },
    // ⚠ flag — auto-set on check-in if patient has allergies, or set manually
    flag: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Live wait time in minutes; 0 once the patient is in consultation
waitingRoomSchema.virtual("wait").get(function () {
  if (this.status === "In consultation") return 0;
  return Math.floor((Date.now() - new Date(this.checkedInAt).getTime()) / 60_000);
});

waitingRoomSchema.set("toJSON", { virtuals: true });
waitingRoomSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("WaitingRoom", waitingRoomSchema);