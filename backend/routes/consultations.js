const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../verifyToken");

const {
  getFlowConfig,
  updateFlowConfig,
  createConsultation,
  getActiveConsultation,
  getConsultationByPatient,
  getConsultation,
  switchPatient,
  updateConsultationStep,
  skipStep,
  unskipStep,
  completeConsultation,
} = require("../controllers/consultationController");

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
