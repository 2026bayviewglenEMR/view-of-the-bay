const mongoose = require("mongoose");

const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Consultation = require("../models/Consultations");

const canAccessPatientPortal = (req, patientId) => {
  if (req.user?.role?.toLowerCase() !== "patient") {
    return true;
  }

  return req.user.patientId?.toString() === patientId?.toString();
};

const getPatientPortalData = async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user?.patientId;

    if (!patientId) {
      return res.status(400).json({
        message: "No patient record is linked to this account.",
      });
    }

    if (!canAccessPatientPortal(req, patientId)) {
      return res.status(403).json({
        message: "You can only access your own patient record.",
      });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found.",
      });
    }

    await Appointment.updateMany(
      {
        patientId,
        status: "scheduled",
        scheduledStartTime: { $lt: new Date() },
      },
      {
        $set: { status: "completed" },
      }
    );

    const appointments = await Appointment.find({ patientId }).sort({
      scheduledStartTime: -1,
    });

    const consultations = await Consultation.find({ patientId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      patient,
      appointments,
      consultations,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while loading patient portal data.",
      error: error.message,
    });
  }
};

const listPatientsForTesting = async (req, res) => {
  try {
    const patients = await Patient.find({})
      .select("_id firstName lastName name email dateOfBirth")
      .limit(10);

    return res.status(200).json({
      count: patients.length,
      patients,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while listing patients.",
      error: error.message,
    });
  }
};

const debugDatabase = async (req, res) => {
  try {
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();

    const collectionData = await Promise.all(
      collections.map(async (collection) => {
        const count = await db.collection(collection.name).countDocuments();

        return {
          name: collection.name,
          count,
        };
      })
    );

    return res.status(200).json({
      databaseName: db.databaseName,
      collections: collectionData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while debugging database.",
      error: error.message,
    });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { doctorId, scheduledStartTime, scheduledEndTime, reasonForVisit, notes } = req.body;

    if (!canAccessPatientPortal(req, patientId)) {
      return res.status(403).json({
        message: "You can only manage your own appointments.",
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: "Patient not found." });

    const startDate = new Date(scheduledStartTime);

    const appointment = new Appointment({
      patientId,
      doctorId,
      scheduledStartTime,
      scheduledEndTime,
      status: startDate < new Date() ? "completed" : "scheduled",
      reasonForVisit,
      notes: notes || "",
    });

    const saved = await appointment.save();
    return res.status(201).json(saved);
  } catch (error) {
    return res.status(500).json({ message: "Error creating appointment.", error: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;
    const { doctorId, scheduledStartTime, scheduledEndTime, reasonForVisit, notes } = req.body;

    if (!canAccessPatientPortal(req, patientId)) {
      return res.status(403).json({
        message: "You can only manage your own appointments.",
      });
    }

    const startDate = new Date(scheduledStartTime);

    const updated = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        doctorId,
        scheduledStartTime,
        scheduledEndTime,
        reasonForVisit,
        notes,
        status: startDate < new Date() ? "completed" : "scheduled",
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Appointment not found." });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Error updating appointment.", error: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;

    if (!canAccessPatientPortal(req, patientId)) {
      return res.status(403).json({
        message: "You can only manage your own appointments.",
      });
    }

    const deleted = await Appointment.findByIdAndDelete(appointmentId);
    if (!deleted) return res.status(404).json({ message: "Appointment not found." });
    return res.status(200).json({ message: "Appointment deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting appointment.", error: error.message });
  }
};

module.exports = {
  getPatientPortalData,
  listPatientsForTesting,
  debugDatabase,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};

