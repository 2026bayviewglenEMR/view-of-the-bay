const express = require("express");
const router = express.Router();

const { authenticateToken, requireRole } = require("../verifyToken");
const {
  completeTemplateConsultation,
} = require("../controllers/consultationController");

router.post(
  "/",
  authenticateToken,
  requireRole(["doctor"]),
  completeTemplateConsultation
);

module.exports = router;
