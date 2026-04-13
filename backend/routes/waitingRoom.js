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

const { authenticateToken } = require('../verifyToken');

const requireAuth = authenticateToken;

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    authenticateToken(req, res, (err) => {
      if (err) return res.status(401).json({ message: "Unauthorized" });
      
      if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "Access denied. No role information." });
      }

      const userRole = req.user.role.toLowerCase();
      const hasPermission = allowedRoles.some(role => 
        role.toLowerCase() === userRole
      );

      if (!hasPermission) {
        return res.status(403).json({ message: "Access denied. Insufficient permissions." });
      }

      next();
    });
  };
};

// ─── Queue Overview ───────────────────────────────────────────────────────────

// GET /api/waiting-room
// Returns the full current waiting room queue, ordered by check-in time.
// Optional query params: status (waiting|in-progress|called), providerId
router.get(
  '/',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'ADMIN'),
  getWaitingRoom
);

// GET /api/waiting-room/stats
// Aggregate stats: avg wait time today, # waiting, # in-progress, longest wait
router.get(
  '/stats',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'ADMIN'),
  getWaitingRoomStats
);

// ─── Patient Check-in / Check-out ─────────────────────────────────────────────

// POST /api/waiting-room/check-in
// Adds a patient to the waiting room queue on arrival.
// Body: { patientId, appointmentId?, chiefComplaint, providerId?, priority }
router.post(
  '/check-in',
  requireAuth,
  requireRole('RECEPTIONIST', 'NURSE', 'ADMIN'),
  checkInPatient
);

// PATCH /api/waiting-room/:queueEntryId/check-out
// Removes a patient from the queue when their encounter is complete.
router.patch(
  '/:queueEntryId/check-out',
  requireAuth,
  requireRole('RECEPTIONIST', 'NURSE', 'ADMIN'),
  checkOutPatient
);

// ─── Queue Entry Management ───────────────────────────────────────────────────

// GET /api/waiting-room/:queueEntryId/position
// Returns the patient's current position in queue and estimated wait time
router.get(
  '/:queueEntryId/position',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'ADMIN'),
  getQueuePosition
);

// PATCH /api/waiting-room/:queueEntryId/status
// Update status: 'waiting' | 'called' | 'in-progress' | 'no-show' | 'completed'
// Body: { status: String }
router.patch(
  '/:queueEntryId/status',
  requireAuth,
  requireRole('NURSE', 'RECEPTIONIST', 'ADMIN'),
  updateWaitingRoomStatus
);

// PATCH /api/waiting-room/:queueEntryId/assign-room
// Assigns an exam room to the patient when called back
// Body: { roomNumber: String }
router.patch(
  '/:queueEntryId/assign-room',
  requireAuth,
  requireRole('NURSE', 'RECEPTIONIST', 'ADMIN'),
  assignRoom
);

// PATCH /api/waiting-room/:queueEntryId/flag-urgent
// Elevates a patient to urgent/priority in the queue
// Body: { reason: String }
router.patch(
  '/:queueEntryId/flag-urgent',
  requireAuth,
  requireRole('NURSE', 'DOCTOR'),
  flagUrgent
);

// ─── Queue Reordering ─────────────────────────────────────────────────────────

// PUT /api/waiting-room/reorder
// Accepts an ordered array of queueEntryIds and persists the new order.
// Body: { orderedIds: [String] }
// Typically called by a drag-and-drop UI in the waiting room dashboard.
router.put(
  '/reorder',
  requireAuth,
  requireRole('NURSE', 'ADMIN'),
  reorderQueue
);

module.exports = router;