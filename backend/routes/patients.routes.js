const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../verifyToken");

console.log("patients routes loaded");

const {
  getAllPatients,
  getPatientById,
  getPatientSummary,
  getPatientEncounters,
  addPatientNote,
  saveOrderedTests,
  saveDraft,
  clearDraft,
} = require("../controllers/patients.controller");

router.get("/", authenticateToken, getAllPatients);

router.get("/:id", authenticateToken, getPatientById);

router.get("/:id/summary", authenticateToken, getPatientSummary);

router.get("/:id/encounters", authenticateToken, getPatientEncounters);

router.post("/:id/notes", authenticateToken, addPatientNote);
router.post("/:id/ordered-tests", authenticateToken, saveOrderedTests);
router.put("/:id/consultation-draft", authenticateToken, saveDraft);
router.delete("/:id/consultation-draft", authenticateToken, clearDraft);

module.exports = router;
