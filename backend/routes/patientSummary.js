const express = require('express');
const router = express.Router();

const {
  getExecutiveSummary,
  generateSummary,
  updateSummaryNote,
  getSummaryHistory,
  exportSummaryPDF,
  getSummaryAlerts,
  dismissAlert,
} = require('../controllers/patientSummaryController');

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

// GET /api/summary/:patientId
// Returns full executive summary: demographics, active conditions, recent visits, meds, alerts
router.get(
  '/:patientId',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'ADMIN'),
  getExecutiveSummary
);

// POST /api/summary/:patientId/generate
// Triggers a fresh AI-assisted or rule-based summary generation and saves it
router.post(
  '/:patientId/generate',
  requireAuth,
  requireRole('DOCTOR', 'NURSE'),
  generateSummary
);

// PATCH /api/summary/:patientId/note
// Allows a clinician to add or update a free-text clinical note on the summary
// Body: { note: String }
router.patch(
  '/:patientId/note',
  requireAuth,
  requireRole('DOCTOR', 'NURSE'),
  updateSummaryNote
);

// GET /api/summary/:patientId/history
// Returns previous versions of the executive summary (audit trail)
router.get(
  '/:patientId/history',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'ADMIN'),
  getSummaryHistory
);

// GET /api/summary/:patientId/export
// Streams a PDF of the current executive summary
router.get(
  '/:patientId/export',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'ADMIN'),
  exportSummaryPDF
);

// GET /api/summary/:patientId/alerts
// Returns active clinical alerts (drug interactions, overdue screenings, abnormal labs)
router.get(
  '/:patientId/alerts',
  requireAuth,
  requireRole('DOCTOR', 'NURSE'),
  getSummaryAlerts
);

// PATCH /api/summary/:patientId/alerts/:alertId/dismiss
// Marks a specific alert as acknowledged by the current user
router.patch(
  '/:patientId/alerts/:alertId/dismiss',
  requireAuth,
  requireRole('DOCTOR', 'NURSE'),
  dismissAlert
);

module.exports = router;