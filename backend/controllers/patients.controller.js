const Patient = require("../models/Patient");
const Consultation = require("../models/Consultations");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const canReadPatient = (req, patientId) => {
  const role = req.user?.role?.toLowerCase();

  if (role === "doctor" || role === "admin") {
    return true;
  }

  if (role === "patient") {
    return req.user.patientId?.toString() === patientId?.toString();
  }

  return false;
};

const canEditPatientClinicalData = (req) => {
  return req.user?.role?.toLowerCase() === "doctor";
};

const getAllPatients = async (req, res) => {
  try {
    if (req.user?.role?.toLowerCase() === "patient") {
      return res.status(403).json({
        message: "Patients cannot view other patient records.",
      });
    }

    const patients = await Patient.find().populate('userId', 'email');

    const mappedPatients = patients.map(p => {
      const obj = p.toObject();
      if (obj.userId && obj.userId.email) {
        obj.demographics = {
          ...obj.demographics,
          email: obj.userId.email
        };
      }
      return obj;
    });

    res.json(mappedPatients);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch patients",
    });
  }
};

const getPatientById = async (req, res) => {
  try {
    if (!canReadPatient(req, req.params.id)) {
      return res.status(403).json({
        message: "You can only access your own patient record.",
      });
    }

    const patient = await Patient.findById(req.params.id).populate('userId', 'email');

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const obj = patient.toObject();
    if (obj.userId && obj.userId.email) {
      obj.demographics = {
        ...obj.demographics,
        email: obj.userId.email
      };
    }

    res.json(obj);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch patient",
    });
  }
};

const getPatientSummary = async (req, res) => {
  try {
    if (!canReadPatient(req, req.params.id)) {
      return res.status(403).json({
        message: "You can only access your own patient summary.",
      });
    }

    const patient = await Patient.findById(req.params.id).populate('userId', 'email');

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.json({
      id: patient._id,
      name: `${patient.firstName} ${patient.lastName}`,
      allergies: patient.executiveSummary?.allergies || [],
      medications:
        patient.executiveSummary?.activeMedications || [],
      email: patient.userId?.email || patient.demographics?.email,
      phone: patient.demographics?.phone,
      emergencyContact:
        patient.demographics?.emergencyContact,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch summary",
    });
  }
};

const getPatientEncounters = async (req, res) => {
  try {
    if (!canReadPatient(req, req.params.id)) {
      return res.status(403).json({
        message: "You can only access your own patient encounters.",
      });
    }

    const encounters = await Consultation.find({
      patientId: req.params.id,
    })
      .populate("doctorId")
      .sort({ createdAt: -1 });

    res.json(encounters);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch encounters",
    });
  }
};

const addPatientNote = async (req, res) => {
  try {
    if (!canEditPatientClinicalData(req)) {
      return res.status(403).json({
        message: "Only doctors can add clinical notes.",
      });
    }

    const { note } = req.body;

    if (!note) {
      return res.status(400).json({
        message: "Note is required",
      });
    }

    const consultation = await Consultation.findOne({
      patientId: req.params.id,
    }).sort({ createdAt: -1 });

    if (!consultation) {
      return res.status(404).json({
        message: "No consultation found",
      });
    }

    consultation.notes =
      (consultation.notes || "") +
      "\n" +
      note;

    await consultation.save();

    res.json({
      message: "Note added",
      notes: consultation.notes,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to add note",
    });
  }
};

const saveOrderedTests = async (req, res) => {
  try {
    if (!canEditPatientClinicalData(req)) {
      return res.status(403).json({ message: "Only doctors can order tests." });
    }

    const { tests } = req.body; // [{ testId, testName }]
    if (!Array.isArray(tests) || tests.length === 0) {
      return res.status(400).json({ message: "tests array is required." });
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found." });

    // Only add tests that aren't already pending for this patient
    const pendingIds = new Set(
      patient.orderedTests
        .filter(t => t.status === 'pending')
        .map(t => t.testId)
    );

    const newTests = tests
      .filter(t => !pendingIds.has(t.testId))
      .map(t => ({
        testId: t.testId,
        testName: t.testName,
        orderedBy: req.user.firstName && req.user.lastName
          ? `Dr. ${req.user.firstName} ${req.user.lastName}`
          : req.user.username,
        orderedById: req.user.id,
        orderedAt: new Date(),
        status: 'pending',
      }));

    patient.orderedTests.push(...newTests);
    await patient.save();

    res.json({ orderedTests: patient.orderedTests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save ordered tests." });
  }
};

const saveDraft = async (req, res) => {
  try {
    if (!canEditPatientClinicalData(req)) {
      return res.status(403).json({ message: "Only doctors can save consultation drafts." });
    }

    const { forms, currentIndex } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found." });

    patient.consultationDraft = {
      forms: forms || {},
      currentIndex: currentIndex ?? 0,
      savedBy: req.user.firstName && req.user.lastName
        ? `Dr. ${req.user.firstName} ${req.user.lastName}`
        : req.user.username,
      savedById: req.user.id,
      savedAt: new Date(),
    };
    await patient.save();
    res.json({ consultationDraft: patient.consultationDraft });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save draft." });
  }
};
const updateExecutiveSummary = async (req, res) => {
  try {
    if (!canEditPatientClinicalData(req)) {
      return res.status(403).json({
        message:
          "Only doctors can update medications and allergies."
      });
    }

    const {
      allergies,
      activeMedications
    } = req.body;

    const patient =
      await Patient.findById(
        req.params.id
      );

    if (!patient) {
      return res.status(404).json({
        message:
          "Patient not found."
      });
    }

    patient.executiveSummary =
      patient.executiveSummary || {};

    patient.executiveSummary.allergies =
      Array.isArray(allergies)
        ? allergies
        : (
          allergies
            ?.split(",")
            .map(a => a.trim())
            .filter(Boolean)
        ) || [];

    patient.executiveSummary.activeMedications =
      activeMedications || [];

    await patient.save();

    res.json({
      executiveSummary:
        patient.executiveSummary
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message:
        "Failed to update executive summary."
    });
  }
};
const clearDraft = async (req, res) => {
  try {
    if (!canEditPatientClinicalData(req)) {
      return res.status(403).json({ message: "Only doctors can clear consultation drafts." });
    }

    await Patient.findByIdAndUpdate(req.params.id, { $unset: { consultationDraft: "" } });
    res.json({ message: "Draft cleared." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to clear draft." });
  }
};

const createPatient = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, demographics } = req.body;

    if (!firstName || !lastName || !dateOfBirth) {
      return res.status(400).json({ message: "First name, last name, and date of birth are required." });
    }

    // 1. Generate unique username
    let baseUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, "");
    let username = baseUsername;
    let userExists = await User.findOne({ username });
    while (userExists) {
      const suffix = Math.floor(Math.random() * 1000);
      username = `${baseUsername}${suffix}`;
      userExists = await User.findOne({ username });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash("password", 10);

    // 3. Create User
    const newUser = new User({
      username,
      password: hashedPassword,
      role: "patient",
      firstName,
      lastName,
      email: demographics?.email || `${username}@example.com`,
      isActive: true,
    });
    const savedUser = await newUser.save();

    // 4. Create Patient
    const newPatient = new Patient({
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      gender: gender || "",
      demographics: demographics || {},
      userId: savedUser._id,
    });
    const savedPatient = await newPatient.save();

    // 5. Update User pointing to Patient
    savedUser.patientId = savedPatient._id;
    await savedUser.save();

    const obj = savedPatient.toObject();
    obj.demographics = {
      ...obj.demographics,
      email: savedUser.email
    };

    res.status(201).json(obj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create patient record." });
  }
};

const updatePatient = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, demographics } = req.body;
    const { id } = req.params;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    if (firstName) patient.firstName = firstName;
    if (lastName) patient.lastName = lastName;
    if (dateOfBirth) patient.dateOfBirth = new Date(dateOfBirth);
    if (gender !== undefined) patient.gender = gender;
    if (demographics) {
      patient.demographics = {
        ...patient.demographics?.toObject(),
        ...demographics
      };
    }

    const savedPatient = await patient.save();

    let email = "";
    if (patient.userId) {
      const user = await User.findById(patient.userId);
      if (user) {
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (demographics && demographics.email !== undefined) {
          user.email = demographics.email;
          email = demographics.email;
        } else {
          email = user.email;
        }
        await user.save();
      }
    }

    const obj = savedPatient.toObject();
    obj.demographics = {
      ...obj.demographics,
      email: email || obj.demographics?.email || ""
    };

    res.json(obj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update patient record." });
  }
};

const updateOwnPatient = async (req, res) => {
  try {
    const patientId = req.user?.patientId;
    if (!patientId) {
      return res.status(403).json({ message: "No patient record linked to this account." });
    }

    const { firstName, lastName, dateOfBirth, gender, demographics } = req.body;
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    if (firstName) patient.firstName = firstName;
    if (lastName) patient.lastName = lastName;
    if (dateOfBirth) patient.dateOfBirth = new Date(dateOfBirth);
    if (gender !== undefined) patient.gender = gender;
    if (demographics) {
      patient.demographics = { ...patient.demographics?.toObject(), ...demographics };
    }

    const savedPatient = await patient.save();

    let email = "";
    if (patient.userId) {
      const user = await User.findById(patient.userId);
      if (user) {
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (demographics && demographics.email !== undefined) {
          user.email = demographics.email;
          email = demographics.email;
        } else {
          email = user.email;
        }
        await user.save();
      }
    }

    const obj = savedPatient.toObject();
    obj.demographics = {
      ...obj.demographics,
      email: email || obj.demographics?.email || ""
    };

    res.json(obj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update patient record." });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  getPatientSummary,
  getPatientEncounters,
  addPatientNote,
  saveOrderedTests,
  saveDraft,
  clearDraft,
  updateExecutiveSummary,
  createPatient,
  updatePatient,
  updateOwnPatient,
};
