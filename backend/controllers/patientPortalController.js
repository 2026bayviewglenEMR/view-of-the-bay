const mongoose = require("mongoose");

const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Consultation = require("../models/Consultations");

const getPatientPortalData = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found.",
      });
    }

    const appointments = await Appointment.find({ patientId }).sort({
      date: -1,
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

module.exports = {
  getPatientPortalData,
  listPatientsForTesting,
  debugDatabase,
};

