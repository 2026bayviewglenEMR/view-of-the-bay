const express = require("express");
const router = express.Router();

console.log("patients routes loaded");

const {
  getAllPatients,
  getPatientById,
  getPatientSummary,
  getPatientEncounters,
  addPatientNote,
} = require("../controllers/patients.controller");

router.get("/", getAllPatients);

router.get("/:id", getPatientById);

router.get("/:id/summary", getPatientSummary);

router.get("/:id/encounters", getPatientEncounters);

router.post("/:id/notes", addPatientNote);

module.exports = router;