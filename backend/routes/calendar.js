const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../verifyToken");

const {
  getMyCalendar,
  getMyQueue,
  getMyTasks,
  getMasterCalendar,
  bookAppointment,
  rescheduleAppointment,
  cancelAppointment,
  generateSickNote,
  generatePrescription,
  generateReferralLetter,
  generateBillingSummary,
} = require("../controllers/calendarController");

// DOCTOR routes
router.get("/my-calendar", authenticateToken, getMyCalendar);
router.get("/my-queue", authenticateToken, getMyQueue);
router.get("/my-tasks", authenticateToken, getMyTasks);

router.post("/generate/sick-note", authenticateToken, generateSickNote);
router.post("/generate/prescription", authenticateToken, generatePrescription);

// ADMINISTRATOR routes
router.get("/master-calendar", authenticateToken, getMasterCalendar);

router.post("/appointments", authenticateToken, bookAppointment);
router.put(
  "/appointments/:id/reschedule",
  authenticateToken,
  rescheduleAppointment,
);
router.delete("/appointments/:id/cancel", authenticateToken, cancelAppointment);

router.post(
  "/generate/referral-letter",
  authenticateToken,
  generateReferralLetter,
);
router.post(
  "/generate/billing-summary",
  authenticateToken,
  generateBillingSummary,
);

module.exports = router;

