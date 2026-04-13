const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const User = require("../models/User");

const appointmentsIO = require("../services/appointmentsSocket");

const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, scheduledStartTime, scheduledEndTime, appointmentType, reasonForVisit, notes } = req.body;

    if (!patientId || !doctorId || !scheduledStartTime || !scheduledEndTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const start = new Date(scheduledStartTime);
    const end = new Date(scheduledEndTime);

    const conflict = await Appointment.findOne({
      doctorId,
      status: { $nin: ["cancelled", "no-show"] },
      $or: [
        { scheduledStartTime: { $lt: end }, scheduledEndTime: { $gt: start } }
      ]
    });

    if (conflict) {
      return res.status(409).json({ error: "Time slot conflicts with existing appointment" });
    }

    const appointment = new Appointment({
      patientId,
      doctorId,
      scheduledStartTime: start,
      scheduledEndTime: end,
      appointmentType: appointmentType || "in-person",
      reasonForVisit,
      notes,
      status: "scheduled"
    });

    await appointment.save();

    appointmentsIO.emitNewAppointment(appointment);

    const populated = await Appointment.findById(appointment._id)
      .populate("patientId", "firstName lastName")
      .populate("doctorId", "firstName lastName");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const { startDate, endDate, doctorId, patientId, status, appointmentType } = req.query;

    const filter = {};

    if (startDate || endDate) {
      filter.scheduledStartTime = {};
      if (startDate) filter.scheduledStartTime.$gte = new Date(startDate);
      if (endDate) filter.scheduledStartTime.$lte = new Date(endDate);
    }

    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
    if (status) filter.status = status;
    if (appointmentType) filter.appointmentType = appointmentType;

    const appointments = await Appointment.find(filter)
      .populate("patientId", "firstName lastName demographics")
      .populate("doctorId", "firstName lastName")
      .sort({ scheduledStartTime: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      doctorId,
      scheduledStartTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ["cancelled", "no-show"] }
    })
      .populate("patientId", "firstName lastName demographics phone")
      .sort({ scheduledStartTime: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCalendarView = async (req, res) => {
  try {
    const { startDate, endDate, doctorId } = req.query;

    const filter = {
      status: { $nin: ["cancelled", "no-show"] }
    };

    if (startDate || endDate) {
      filter.scheduledStartTime = {};
      if (startDate) filter.scheduledStartTime.$gte = new Date(startDate);
      if (endDate) filter.scheduledStartTime.$lte = new Date(endDate);
    }

    if (doctorId) filter.doctorId = doctorId;

    const appointments = await Appointment.find(filter)
      .populate("patientId", "firstName lastName")
      .populate("doctorId", "firstName lastName")
      .select("scheduledStartTime scheduledEndTime appointmentType status reasonForVisit");

    const calendarEvents = appointments.map(apt => ({
      id: apt._id,
      title: `${apt.patientId?.lastName}, ${apt.patientId?.firstName} - ${apt.reasonForVisit}`,
      start: apt.scheduledStartTime,
      end: apt.scheduledEndTime,
      type: apt.appointmentType,
      status: apt.status,
      doctor: apt.doctorId,
      isTelehealth: apt.appointmentType === "telehealth"
    }));

    res.json(calendarEvents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id)
      .populate("patientId")
      .populate("doctorId", "firstName lastName email");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledStartTime, scheduledEndTime, appointmentType, reasonForVisit, notes, status } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (scheduledStartTime || scheduledEndTime) {
      const start = scheduledStartTime ? new Date(scheduledStartTime) : appointment.scheduledStartTime;
      const end = scheduledEndTime ? new Date(scheduledEndTime) : appointment.scheduledEndTime;

      const conflict = await Appointment.findOne({
        _id: { $ne: id },
        doctorId: appointment.doctorId,
        status: { $nin: ["cancelled", "no-show"] },
        scheduledStartTime: { $lt: end },
        scheduledEndTime: { $gt: start }
      });

      if (conflict) {
        return res.status(409).json({ error: "Time slot conflicts with existing appointment" });
      }

      appointment.scheduledStartTime = start;
      appointment.scheduledEndTime = end;
    }

    if (appointmentType) appointment.appointmentType = appointmentType;
    if (reasonForVisit) appointment.reasonForVisit = reasonForVisit;
    if (notes !== undefined) appointment.notes = notes;
    if (status) appointment.status = status;

    await appointment.save();

    appointmentsIO.emitAppointmentUpdated(appointment);

    const populated = await Appointment.findById(appointment._id)
      .populate("patientId", "firstName lastName")
      .populate("doctorId", "firstName lastName");

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    appointment.status = "cancelled";
    appointment.notes = reason ? `Cancelled: ${reason}` : appointment.notes;

    await appointment.save();

    appointmentsIO.emitAppointmentCancelled(appointment);

    res.json({ message: "Appointment cancelled", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkInAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomNumber } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.status !== "scheduled") {
      return res.status(400).json({ error: "Appointment is not in scheduled status" });
    }

    appointment.status = "checked-in";
    if (roomNumber) appointment.roomNumber = roomNumber;

    await appointment.save();

    appointmentsIO.emitPatientCheckedIn(appointment);

    const populated = await Appointment.findById(appointment._id)
      .populate("patientId", "firstName lastName")
      .populate("doctorId", "firstName lastName");

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const startAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    appointment.status = "in-progress";
    await appointment.save();

    appointmentsIO.emitAppointmentStarted(appointment);

    const populated = await Appointment.findById(appointment._id)
      .populate("patientId", "firstName lastName")
      .populate("doctorId", "firstName lastName");

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    appointment.status = "completed";
    if (notes) appointment.notes = notes;

    await appointment.save();

    appointmentsIO.emitAppointmentCompleted(appointment);

    const populated = await Appointment.findById(appointment._id)
      .populate("patientId", "firstName lastName")
      .populate("doctorId", "firstName lastName");

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ error: "doctorId and date are required" });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      doctorId,
      scheduledStartTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ["cancelled", "no-show"] }
    }).select("scheduledStartTime scheduledEndTime");

    const slots = [];
    const slotDuration = 30;

    let current = new Date(startOfDay);
    current.setHours(8, 0, 0, 0);
    const dayEnd = new Date(startOfDay);
    dayEnd.setHours(17, 0, 0, 0);

    while (current < dayEnd) {
      const slotEnd = new Date(current.getTime() + slotDuration * 60000);

      const isAvailable = !appointments.some(apt =>
        apt.scheduledStartTime < slotEnd && apt.scheduledEndTime > current
      );

      if (isAvailable) {
        slots.push({
          start: new Date(current),
          end: new Date(slotEnd),
          available: true
        });
      }

      current = slotEnd;
    }

    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAppointmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { upcoming, past } = req.query;

    const filter = { patientId };

    if (upcoming === "true") {
      filter.scheduledStartTime = { $gte: new Date() };
      filter.status = { $in: ["scheduled", "checked-in"] };
    } else if (past === "true") {
      filter.$or = [
        { scheduledStartTime: { $lt: new Date() } },
        { status: { $in: ["completed", "cancelled", "no-show"] } }
      ];
    }

    const appointments = await Appointment.find(filter)
      .populate("doctorId", "firstName lastName")
      .sort({ scheduledStartTime: upcoming === "true" ? 1 : -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAppointmentStats = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const filter = {
      scheduledStartTime: { $gte: startOfDay, $lte: endOfDay }
    };

    if (doctorId) filter.doctorId = doctorId;

    const stats = await Appointment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      scheduled: 0,
      checkedIn: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
      telehealth: 0,
      inPerson: 0
    };

    stats.forEach(s => {
      if (s._id === "scheduled") result.scheduled = s.count;
      if (s._id === "checked-in") result.checkedIn = s.count;
      if (s._id === "in-progress") result.inProgress = s.count;
      if (s._id === "completed") result.completed = s.count;
      if (s._id === "cancelled") result.cancelled = s.count;
      if (s._id === "no-show") result.noShow = s.count;
    });

    const typeStats = await Appointment.aggregate([
      { $match: { ...filter, appointmentType: "telehealth" } },
      { $count: "telehealth" }
    ]);
    const tp = typeStats[0];
    if (tp) {
      result.telehealth = tp.telehealth;
      result.inPerson = result.scheduled + result.checkedIn + result.completed - result.telehealth;
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentsByDoctor,
  getCalendarView,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  checkInAppointment,
  startAppointment,
  completeAppointment,
  getAvailableSlots,
  getAppointmentsByPatient,
  getAppointmentStats
};