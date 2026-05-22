const Appointment = require("../models/Appointment");
const Task = require("../models/Task");
const WaitingRoom = require("../models/waitingRoom.model");

const appointmentPopulate = [
  { path: "patientId", model: "Patient" },
  { path: "doctorId", model: "User", select: "-password" },
];

const getDateFilter = (start, end) => {
  const filter = {};

  if (start || end) {
    filter.scheduledStartTime = {};
    if (start) filter.scheduledStartTime.$gte = new Date(start);
    if (end) filter.scheduledStartTime.$lte = new Date(end);
  }

  return filter;
};

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getAppointmentStatus = (scheduledStartTime, requestedStatus) => {
  if (requestedStatus) return requestedStatus;
  return new Date(scheduledStartTime) < new Date() ? "completed" : "scheduled";
};

const populateAppointment = (query) => query.populate(appointmentPopulate);

const getMyCalendar = async (req, res) => {
  try {
    const { start, end, status } = req.query;
    const filter = {
      doctorId: req.user.id,
      ...getDateFilter(start, end),
    };

    if (status) filter.status = status;

    const appointments = await populateAppointment(
      Appointment.find(filter).sort({ scheduledStartTime: 1 })
    );

    return res.status(200).json({ appointments });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while loading calendar.",
      error: error.message,
    });
  }
};

const getMyQueue = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const entries = await WaitingRoom.find()
      .populate({
        path: "appointmentId",
        match: {
          doctorId: req.user.id,
          scheduledStartTime: { $gte: start, $lte: end },
        },
        populate: appointmentPopulate,
      })
      .sort({ createdAt: 1 });

    const queue = entries
      .filter((entry) => entry.appointmentId)
      .map((entry) => ({
        id: entry._id,
        appointment: entry.appointmentId,
        status: entry.status,
        note: entry.note,
        flag: entry.flag,
        wait: entry.wait,
      }));

    return res.status(200).json({ queue });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while loading queue.",
      error: error.message,
    });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { doctorId: req.user.id };

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: "completed" };
    }

    const tasks = await Task.find(filter)
      .populate("patientId")
      .populate("consultationId")
      .sort({ dueDate: 1, createdAt: -1 });

    return res.status(200).json({ tasks });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while loading tasks.",
      error: error.message,
    });
  }
};

const getMasterCalendar = async (req, res) => {
  try {
    const { start, end, doctorId, patientId, status } = req.query;
    const filter = getDateFilter(start, end);

    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
    if (status) filter.status = status;

    const appointments = await populateAppointment(
      Appointment.find(filter).sort({ scheduledStartTime: 1 })
    );

    return res.status(200).json({ appointments });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while loading master calendar.",
      error: error.message,
    });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      scheduledStartTime,
      scheduledEndTime,
      reasonForVisit,
      notes,
      status,
    } = req.body;

    if (!patientId || !doctorId || !scheduledStartTime || !scheduledEndTime || !reasonForVisit) {
      return res.status(400).json({
        message:
          "patientId, doctorId, scheduledStartTime, scheduledEndTime, and reasonForVisit are required.",
      });
    }

    const startDate = new Date(scheduledStartTime);
    const endDate = new Date(scheduledEndTime);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Appointment times must be valid dates." });
    }

    if (endDate <= startDate) {
      return res.status(400).json({ message: "scheduledEndTime must be after scheduledStartTime." });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      scheduledStartTime: startDate,
      scheduledEndTime: endDate,
      status: getAppointmentStatus(startDate, status),
      reasonForVisit,
      notes: notes || "",
    });

    const populated = await populateAppointment(Appointment.findById(appointment._id));

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({
      message: "Server error while booking appointment.",
      error: error.message,
    });
  }
};

const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      doctorId,
      scheduledStartTime,
      scheduledEndTime,
      reasonForVisit,
      notes,
      status,
    } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (doctorId) appointment.doctorId = doctorId;
    if (reasonForVisit) appointment.reasonForVisit = reasonForVisit;
    if (notes !== undefined) appointment.notes = notes;

    if (scheduledStartTime) {
      const startDate = new Date(scheduledStartTime);
      if (Number.isNaN(startDate.getTime())) {
        return res.status(400).json({ message: "scheduledStartTime must be a valid date." });
      }
      appointment.scheduledStartTime = startDate;
    }

    if (scheduledEndTime) {
      const endDate = new Date(scheduledEndTime);
      if (Number.isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "scheduledEndTime must be a valid date." });
      }
      appointment.scheduledEndTime = endDate;
    }

    if (appointment.scheduledEndTime <= appointment.scheduledStartTime) {
      return res.status(400).json({ message: "scheduledEndTime must be after scheduledStartTime." });
    }

    appointment.status = getAppointmentStatus(appointment.scheduledStartTime, status);

    await appointment.save();

    const populated = await populateAppointment(Appointment.findById(appointment._id));

    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({
      message: "Server error while rescheduling appointment.",
      error: error.message,
    });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    appointment.status = "cancelled";
    await appointment.save();

    await WaitingRoom.findOneAndDelete({ appointmentId: appointment._id });

    const populated = await populateAppointment(Appointment.findById(appointment._id));

    return res.status(200).json({
      message: "Appointment cancelled.",
      appointment: populated,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while cancelling appointment.",
      error: error.message,
    });
  }
};

const getPatientName = (patient) => {
  if (!patient) return "Unknown patient";
  return [patient.firstName, patient.lastName].filter(Boolean).join(" ");
};

const getDoctorName = (doctor) => {
  if (!doctor) return "Unknown provider";
  const name = [doctor.firstName, doctor.lastName].filter(Boolean).join(" ");
  return name ? `Dr. ${name}` : "Unknown provider";
};

const getAppointmentForDocument = async (appointmentId) => {
  if (!appointmentId) return null;
  return populateAppointment(Appointment.findById(appointmentId));
};

const generateSickNote = async (req, res) => {
  try {
    const { appointmentId, startDate, endDate, reason, restrictions } = req.body;
    const appointment = await getAppointmentForDocument(appointmentId);

    return res.status(200).json({
      type: "sick-note",
      appointmentId: appointment?._id || null,
      patientName: getPatientName(appointment?.patientId),
      doctorName: getDoctorName(appointment?.doctorId),
      startDate,
      endDate,
      reason: reason || appointment?.reasonForVisit || "",
      restrictions: restrictions || "",
      generatedAt: new Date(),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while generating sick note.",
      error: error.message,
    });
  }
};

const generatePrescription = async (req, res) => {
  try {
    const { appointmentId, medications, instructions } = req.body;
    const appointment = await getAppointmentForDocument(appointmentId);

    return res.status(200).json({
      type: "prescription",
      appointmentId: appointment?._id || null,
      patientName: getPatientName(appointment?.patientId),
      doctorName: getDoctorName(appointment?.doctorId),
      medications: medications || [],
      instructions: instructions || "",
      generatedAt: new Date(),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while generating prescription.",
      error: error.message,
    });
  }
};

const generateReferralLetter = async (req, res) => {
  try {
    const { appointmentId, specialist, reason, notes } = req.body;
    const appointment = await getAppointmentForDocument(appointmentId);

    return res.status(200).json({
      type: "referral-letter",
      appointmentId: appointment?._id || null,
      patientName: getPatientName(appointment?.patientId),
      doctorName: getDoctorName(appointment?.doctorId),
      specialist: specialist || "",
      reason: reason || appointment?.reasonForVisit || "",
      notes: notes || "",
      generatedAt: new Date(),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while generating referral letter.",
      error: error.message,
    });
  }
};

const generateBillingSummary = async (req, res) => {
  try {
    const { appointmentId, billingCode, amount, notes } = req.body;
    const appointment = await getAppointmentForDocument(appointmentId);

    return res.status(200).json({
      type: "billing-summary",
      appointmentId: appointment?._id || null,
      patientName: getPatientName(appointment?.patientId),
      doctorName: getDoctorName(appointment?.doctorId),
      billingCode: billingCode || "",
      amount: amount || null,
      notes: notes || "",
      generatedAt: new Date(),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while generating billing summary.",
      error: error.message,
    });
  }
};

module.exports = {
  getMyCalendar,
  getMyQueue,
  getMyTasks,
  getMasterCalendar,
  bookAppointment,
  rescheduleAppointment,
  cancelAppointment,
  generateSickNote,
  generatePrescription,
  generateReferralLetter,
  generateBillingSummary,
};
