const express = require('express');
const router = express.Router();

const {
  getWaitingRoom,
  getDoctorsOverview,
  checkInPatient,
  updatePatientStatus,
  removePatient,
  getPatientDetails,
  startPatientConsultation,
} = require('../controllers/waitingRoom.controller');

const { authenticateToken, requireRole } = require('../verifyToken');

// GET /api/waiting-room — full queue for today
router.get(
  '/',
  authenticateToken,
  requireRole(['doctor', 'admin']),
  getWaitingRoom
);

// GET /api/waiting-room/doctors — clinic overview (doctor statuses + queues)
router.get(
  '/doctors',
  authenticateToken,
  requireRole(['doctor', 'admin']),
  getDoctorsOverview
);

// POST /api/waiting-room/check-in — check a patient in
// Body: { appointmentId, note?, flag? }
router.post(
  '/check-in',
  authenticateToken,
  requireRole(['admin']),
  checkInPatient
);

// PATCH /api/waiting-room/:id/status — update patient status
// Body: { status: 'Checked-in' | 'Waiting' | 'In consultation' }
router.patch(
  '/:id/status',
  authenticateToken,
  requireRole(['doctor', 'admin']),
  updatePatientStatus
);

// DELETE /api/waiting-room/:id — remove patient from queue
router.delete(
  '/:id',
  authenticateToken,
  requireRole(['doctor', 'admin']),
  removePatient
);

// GET /api/waiting-room/patient/:id — full patient record for Open button
router.get(
  '/patient/:id',
  authenticateToken,
  requireRole(['doctor', 'admin']),
  getPatientDetails
);

// PATCH /api/waiting-room/patient/:patientId/start — start consultation
router.patch(
  '/patient/:patientId/start',
  authenticateToken,
  requireRole(['doctor', 'admin']),
  startPatientConsultation
);

module.exports = router;
