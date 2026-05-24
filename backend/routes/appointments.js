const express = require("express");
const router = express.Router();
const { getAppointments } = require("../controllers/appointmentController.js");
const { authenticateToken, requireRole } = require("../verifyToken.js");

router.get("/", authenticateToken, requireRole(['doctor', 'admin']), getAppointments);

module.exports = router;