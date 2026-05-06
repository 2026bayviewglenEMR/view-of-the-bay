const express = require("express");
const router = express.Router();

const {
  getFlowConfig,
  updateFlowConfig,
  createConsultation,
  getConsultation,
  getConsultationByPatient,
  switchPatient,
  updateConsultationStep,
  skipStep,
  unskipStep,
  completeConsultation,
  getActiveConsultation,
} = require("../controllers/consultationController");

const { authenticateToken, requireRole } = require("../middleware/auth");

router.get("/flow-config", authenticateToken, getFlowConfig);
router.put("/flow-config", authenticateToken, updateFlowConfig);

router.post("/", authenticateToken, createConsultation);
router.get("/active", authenticateToken, getActiveConsultation);
router.get("/patient/:patientId", authenticateToken, getConsultationByPatient);
router.get("/:id", authenticateToken, getConsultation);

router.post("/switch-patient", authenticateToken, switchPatient);

router.patch("/:id/step", authenticateToken, updateConsultationStep);
router.post("/:id/skip-step", authenticateToken, skipStep);
router.post("/:id/unskip-step", authenticateToken, unskipStep);
router.post("/:id/complete", authenticateToken, completeConsultation);

module.exports = router;