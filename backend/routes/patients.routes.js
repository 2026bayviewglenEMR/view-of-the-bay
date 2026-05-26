const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../verifyToken");

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
  updateExecutiveSummary,
  createPatient,
  updatePatient,
  updateOwnPatient,
} = require("../controllers/patients.controller");

router.get("/", authenticateToken, getAllPatients);

router.post("/", authenticateToken, requireRole(["admin", "doctor"]), createPatient);

router.put("/me", authenticateToken, updateOwnPatient);

router.get("/:id", authenticateToken, getPatientById);

router.put("/:id", authenticateToken, requireRole(["admin", "doctor"]), updatePatient);

router.get("/:id/summary", authenticateToken, getPatientSummary);

router.get("/:id/encounters", authenticateToken, getPatientEncounters);

router.post("/:id/notes", authenticateToken, addPatientNote);
router.post("/:id/ordered-tests", authenticateToken, saveOrderedTests);
router.put("/:id/consultation-draft", authenticateToken, saveDraft);
router.patch(
  "/:id/executive-summary",
  authenticateToken,
  updateExecutiveSummary
);
router.delete("/:id/consultation-draft", authenticateToken, clearDraft);

module.exports = router;
