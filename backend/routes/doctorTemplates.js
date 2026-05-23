const express = require("express");

const {
  createDoctorTemplate,
  deleteDoctorTemplate,
  getDoctorTemplates,
  updateDoctorTemplate,
} = require("../controllers/doctorTemplateController");

const {
  authenticateToken,
  requireRole,
} = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, requireRole("doctor"), getDoctorTemplates);
router.post("/", authenticateToken, requireRole("doctor"), createDoctorTemplate);
router.patch("/:templateId", authenticateToken, requireRole("doctor"), updateDoctorTemplate);
router.delete("/:templateId", authenticateToken, requireRole("doctor"), deleteDoctorTemplate);

module.exports = router;