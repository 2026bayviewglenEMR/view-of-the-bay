const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../verifyToken");

const {
  getPatientPortalData,
  listPatientsForTesting,
  debugDatabase,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/patientPortalController");

router.get("/debug/db", debugDatabase);
router.get("/debug/patients", listPatientsForTesting);

router.get("/me", authenticateToken, getPatientPortalData);
router.get("/:patientId", authenticateToken, getPatientPortalData);
router.post("/:patientId/appointments", authenticateToken, createAppointment);
router.put("/:patientId/appointments/:appointmentId", authenticateToken, updateAppointment);
router.delete("/:patientId/appointments/:appointmentId", authenticateToken, deleteAppointment);

module.exports = router;
