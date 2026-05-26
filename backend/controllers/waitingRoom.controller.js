const WaitingRoom = require("../models/waitingRoom.model");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const User = require("../models/User");

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

/** Start/end of today in UTC — filters appointments to today only */
const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/** Shape a populated WaitingRoom doc into the Vue table row */
const formatEntry = (entry) => {
  const appt = entry.appointmentId; // populated Appointment
  const patient = appt.patientId;   // populated Patient
  const doctor = appt.doctorId;     // populated User (doctor)

  return {
    id: entry._id,
    patientId: patient._id,
    name: `${patient.firstName} ${patient.lastName}`,
    doctor: `Dr. ${doctor.lastName}`,
    time: new Date(appt.scheduledStartTime).toLocaleTimeString("en-CA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    status: entry.status,
    wait: entry.wait, // virtual
    note: entry.note,
    flag: entry.flag,
  };
};

// ─────────────────────────────────────────────────────────
// GET /api/waiting-room
// All checked-in patients for today
// ─────────────────────────────────────────────────────────
const getWaitingRoom = async (req, res) => {
  try {
    const entries = await WaitingRoom.find()
      .populate({
        path: "appointmentId",
        populate: [
          { path: "patientId", model: "Patient" },
          { path: "doctorId",  model: "User" },
        ],
      })
      .sort({ "appointmentId.scheduledStartTime": 1 });

    const validEntries = entries.filter(e => e.appointmentId !== null);

    res.json(validEntries.map(formatEntry));
  } catch (err) {
    console.error("getWaitingRoom:", err);
    res.status(500).json({ message: "Failed to fetch waiting room" });
  }
};

// ─────────────────────────────────────────────────────────
// GET /api/doctors/overview
// All doctors + their current patient and queue length
// ─────────────────────────────────────────────────────────
const getDoctorsOverview = async (req, res) => {
  try {
    const { start, end } = todayRange();

    // All active doctors
    const doctors = await User.find({ role: "doctor", isActive: true });

    // All waiting-room entries today, populated
    const entries = await WaitingRoom.find().populate({
      path: "appointmentId",
      match: { scheduledStartTime: { $gte: start, $lte: end } },
      populate: [
        { path: "patientId", model: "Patient" },
        { path: "doctorId",  model: "User" },
      ],
    });

    // Filter out entries whose appointment didn't match today
    const todayEntries = entries.filter((e) => e.appointmentId !== null);

    const overview = doctors.map((doc) => {
      const myEntries = todayEntries.filter(
        (e) => String(e.appointmentId.doctorId._id) === String(doc._id)
      );

      const inConsultation = myEntries.find(
        (e) => e.status === "In consultation"
      );

      const queueCount = myEntries.filter(
        (e) => e.status !== "In consultation"
      ).length;

      return {
        id: doc._id,
        name: `Dr. ${doc.lastName}`,
        status: inConsultation ? "Busy" : "Free",
        current: inConsultation
          ? `${inConsultation.appointmentId.patientId.firstName} ${inConsultation.appointmentId.patientId.lastName}`
          : null,
        queue: queueCount,
      };
    });

    res.json(overview);
  } catch (err) {
    console.error("getDoctorsOverview:", err);
    res.status(500).json({ message: "Failed to fetch doctor overview" });
  }
};

// ─────────────────────────────────────────────────────────
// POST /api/waiting-room
// Check a patient in via their appointmentId.
// Auto-flags if patient has allergies recorded.
// Body: { appointmentId, note?, flag? }
// ─────────────────────────────────────────────────────────
const checkInPatient = async (req, res) => {
  try {
    const { appointmentId, note, flag } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: "appointmentId is required" });
    }

    // Prevent double check-in
    const existing = await WaitingRoom.findOne({ appointmentId });
    if (existing) {
      return res.status(409).json({
        message: "Patient is already in the waiting room",
      });
    }
    console.log("Searching for appointment:", appointmentId);

    const allAppointments = await Appointment.find();
    console.log("All appointments:", allAppointments);
    
    // Verify the appointment exists and pull the patient for allergy check
    const appt = await Appointment.findById(appointmentId).populate(
      "patientId"
    );
    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Auto-flag if the patient has any allergies on record
    const hasAllergies =
      appt.patientId?.executiveSummary?.allergies?.length > 0;

    const entry = await WaitingRoom.create({
      appointmentId,
      status: "Checked-in",
      checkedInAt: new Date(),
      note: note || "",
      // caller can force flag; otherwise fall back to allergy auto-detect
      flag: flag !== undefined ? flag : hasAllergies,
    });

    // Return the populated shape so the frontend can render immediately
    const populated = await WaitingRoom.findById(entry._id).populate({
      path: "appointmentId",
      populate: [
        { path: "patientId", model: "Patient" },
        { path: "doctorId",  model: "User" },
      ],
    });

    res.status(201).json(formatEntry(populated));
  } catch (err) {
    console.error("checkInPatient:", err);
    res.status(500).json({ message: "Failed to check in patient" });
  }
};

// ─────────────────────────────────────────────────────────
// PATCH /api/waiting-room/:id/status
// Body: { status: 'Checked-in' | 'Waiting' | 'In consultation' }
// ─────────────────────────────────────────────────────────
const updatePatientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["Checked-in", "Waiting", "In consultation"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${allowed.join(", ")}`,
      });
    }

    const entry = await WaitingRoom.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate({
      path: "appointmentId",
      populate: [
        { path: "patientId", model: "Patient" },
        { path: "doctorId",  model: "User" },
      ],
    });

    if (!entry) {
      return res.status(404).json({ message: "Waiting-room entry not found" });
    }

    res.json(formatEntry(entry));
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid entry ID" });
    }
    console.error("updatePatientStatus:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// ─────────────────────────────────────────────────────────
// DELETE /api/waiting-room/:id
// Remove after appointment ends, patient leaves, or cancels
// ─────────────────────────────────────────────────────────
const removePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await WaitingRoom.findByIdAndDelete(id);
    if (!entry) {
      return res.status(404).json({ message: "Waiting-room entry not found" });
    }

    res.json({ message: "Patient removed from waiting room", id });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid entry ID" });
    }
    console.error("removePatient:", err);
    res.status(500).json({ message: "Failed to remove patient" });
  }
};

// ─────────────────────────────────────────────────────────
// GET /api/patients/:id
// Full patient record for the "Open" button
// ─────────────────────────────────────────────────────────
const getPatientDetails = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(patient);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid patient ID" });
    }
    console.error("getPatientDetails:", err);
    res.status(500).json({ message: "Failed to fetch patient details" });
  }
};

// ─────────────────────────────────────────────────────────
// PATCH /api/waiting-room/patient/:patientId/start
// Set waiting room status to In consultation for patient
// ─────────────────────────────────────────────────────────
const startPatientConsultation = async (req, res) => {
  try {
    const { patientId } = req.params;

    const entries = await WaitingRoom.find().populate("appointmentId");
    const entry = entries.find(
      (e) =>
        e.appointmentId &&
        e.appointmentId.patientId.toString() === patientId.toString()
    );

    if (!entry) {
      return res.status(404).json({ message: "Patient not found in waiting room queue" });
    }

    entry.status = "In consultation";
    await entry.save();

    // Populate full details for rendering updated row if needed
    const populated = await WaitingRoom.findById(entry._id).populate({
      path: "appointmentId",
      populate: [
        { path: "patientId", model: "Patient" },
        { path: "doctorId",  model: "User" },
      ],
    });

    res.json(formatEntry(populated));
  } catch (err) {
    console.error("startPatientConsultation:", err);
    res.status(500).json({ message: "Failed to start consultation in waiting room" });
  }
};

module.exports = {
  getWaitingRoom,
  getDoctorsOverview,
  checkInPatient,
  updatePatientStatus,
  removePatient,
  getPatientDetails,
  startPatientConsultation,
};