const express = require("express");
const router = express.Router();

const { authenticateToken, requireRole } = require("../verifyToken");

const {
  getFlowConfig,
  updateFlowConfig,
  createConsultation,
  getConsultations,
  getConsultationsByDoctor,
  getActiveConsultation,
  getConsultationByPatient,
  getConsultation,
  updateConsultation,
  deleteConsultation,
  getPatientClinicalRecord,
  switchPatient,
  updateConsultationStep,
  skipStep,
  unskipStep,
  completeConsultation,
  completeTemplateConsultation,
  saveFinalTreatmentPlan,
  getFinalTreatmentPlan,
  createTestOrderDocument,
  getTestOrderDocuments,
} = require("../controllers/consultationController");

const doctorOnly = [authenticateToken, requireRole(["doctor"])];
const doctorOrAdmin = [authenticateToken, requireRole(["doctor", "admin"])];

router.get("/flow-config", ...doctorOnly, getFlowConfig);
router.put("/flow-config", ...doctorOnly, updateFlowConfig);

router.post("/complete", ...doctorOnly, completeTemplateConsultation);
router.post("/", ...doctorOnly, createConsultation);
router.get("/", ...doctorOnly, getConsultations);
router.get("/active", ...doctorOnly, getActiveConsultation);
router.get("/doctor/:doctorId", ...doctorOnly, getConsultationsByDoctor);
router.get("/patient/:patientId/records", ...doctorOrAdmin, getPatientClinicalRecord);
router.get("/patient/:patientId", ...doctorOrAdmin, getConsultationByPatient);

router.post("/switch-patient", ...doctorOnly, switchPatient);

router.get("/:id/treatment-plan", ...doctorOnly, getFinalTreatmentPlan);
router.post("/:id/treatment-plan", ...doctorOnly, saveFinalTreatmentPlan);
router.get("/:id/test-orders", ...doctorOnly, getTestOrderDocuments);
router.post("/:id/test-orders", ...doctorOnly, createTestOrderDocument);

router.get("/:id", ...doctorOnly, getConsultation);
router.put("/:id", ...doctorOnly, updateConsultation);
router.delete("/:id", ...doctorOnly, deleteConsultation);
router.patch("/:id/step", ...doctorOnly, updateConsultationStep);
router.post("/:id/skip-step", ...doctorOnly, skipStep);
router.post("/:id/unskip-step", ...doctorOnly, unskipStep);
router.post("/:id/complete", ...doctorOnly, completeConsultation);

module.exports = router;
