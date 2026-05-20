const express = require('express');
const router = express.Router();

const {
  getWaitingRoom,
  checkInPatient,
  checkOutPatient,
  updateWaitingRoomStatus,
  getQueuePosition,
  reorderQueue,
  getWaitingRoomStats,
  assignRoom,
  flagUrgent,
} = require('../controllers/waitingRoomController');

const { authenticateToken, requireRole } = require('../middleware/auth');

// ─── Queue Overview ───────────────────────────────────────────────────────────

// GET /api/waiting-room
// Returns the full current waiting room queue, ordered by check-in time.
// Optional query params: status (waiting|in-progress|called), providerId
router.get(
  '/',
  authenticateToken,
  requireRole('doctor', 'admin'),
  getWaitingRoom
);

// GET /api/waiting-room/stats
// Aggregate stats: avg wait time today, # waiting, # in-progress, longest wait
router.get(
  '/stats',
  authenticateToken,
  requireRole('doctor', 'admin'),
  getWaitingRoomStats
);

// ─── Patient Check-in / Check-out ─────────────────────────────────────────────

// POST /api/waiting-room/check-in
// Adds a patient to the waiting room queue on arrival.
// Body: { patientId, appointmentId?, chiefComplaint, providerId?, priority }
router.post(
  '/check-in',
  authenticateToken,
  requireRole('admin'),
  checkInPatient
);

// PATCH /api/waiting-room/:queueEntryId/check-out
// Removes a patient from the queue when their encounter is complete.
router.patch(
  '/:queueEntryId/check-out',
  authenticateToken,
  requireRole('admin'),
  checkOutPatient
);

// ─── Queue Entry Management ───────────────────────────────────────────────────

// GET /api/waiting-room/:queueEntryId/position
// Returns the patient's current position in queue and estimated wait time
router.get(
  '/:queueEntryId/position',
  authenticateToken,
  requireRole('doctor', 'admin'),
  getQueuePosition
);

// PATCH /api/waiting-room/:queueEntryId/status
// Update status: 'waiting' | 'called' | 'in-progress' | 'no-show' | 'completed'
// Body: { status: String }
router.patch(
  '/:queueEntryId/status',
  authenticateToken,
  requireRole('admin'),
  updateWaitingRoomStatus
);

// PATCH /api/waiting-room/:queueEntryId/assign-room
// Assigns an exam room to the patient when called back
// Body: { roomNumber: String }
router.patch(
  '/:queueEntryId/assign-room',
  authenticateToken,
  requireRole('admin'),
  assignRoom
);

// PATCH /api/waiting-room/:queueEntryId/flag-urgent
// Elevates a patient to urgent/priority in the queue
// Body: { reason: String }
router.patch(
  '/:queueEntryId/flag-urgent',
  authenticateToken,
  requireRole('doctor', 'admin'),
  flagUrgent
);

// ─── Queue Reordering ─────────────────────────────────────────────────────────

// PUT /api/waiting-room/reorder
// Accepts an ordered array of queueEntryIds and persists the new order.
// Body: { orderedIds: [String] }
router.put(
  '/reorder',
  authenticateToken,
  requireRole('admin'),
  reorderQueue
);

module.exports = router;
