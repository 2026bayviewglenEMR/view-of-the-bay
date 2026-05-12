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

const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/summary/:patientId
// Returns full executive summary: demographics, active conditions, recent visits, meds, alerts
router.get(
  '/:patientId',
  requireAuth,
  requireRole('DOCTOR', 'NURS3E', 'ADMIN'), //NO NURSE/RECEPTIONIST/PHARMACIST ROLE
  getExecutiveSummary
);

// POST /api/summary/:patientId/generate
// Triggers a fresh AI-assisted or rule-based summary generation and saves it
// THERE IS NO NURSE ROLE. UPDATE PLZ
router.post(
  '/:patientId/generate',
  requireAuth,
  requireRole('DOCTOR', 'NURS3E'), //NO NURSE/RECEPTIONIST/PHARMACIST ROLE
  generateSummary
);

// PATCH /api/summary/:patientId/note
// Allows a clinician to add or update a free-text clinical note on the summary
// THERE IS NO NURSE ROLE. UPDATE PLZ
// Body: { note: String }
router.patch(
  '/:patientId/note',
  requireAuth,
  requireRole('DOCTOR', 'NURS3E'), //NO NURSE/RECEPTIONIST/PHARMACIST ROLE
  updateSummaryNote
);

// GET /api/summary/:patientId/history
// Returns previous versions of the executive summary (audit trail)
router.get(
  '/:patientId/history',
  requireAuth,
  requireRole('DOCTOR', 'NURS3E', 'ADMIN'),//NO NURSE/RECEPTIONIST/PHARMACIST ROLE
  getSummaryHistory
);

// GET /api/summary/:patientId/export
// Streams a PDF of the current executive summary
router.get(
  '/:patientId/export',
  requireAuth,
  requireRole('DOCTOR', 'NURS3E', 'ADMIN'), //NO NURSE/RECEPTIONIST/PHARMACIST ROLE
  exportSummaryPDF
);

// GET /api/summary/:patientId/alerts
// Returns active clinical alerts (drug interactions, overdue screenings, abnormal labs)
// THERE IS NO NURSE ROLE. UPDATE PLZ
router.get(
  '/:patientId/alerts',
  requireAuth,
  requireRole('DOCTOR', 'NURS3E'), //NO NURSE/RECEPTIONIST/PHARMACIST ROLE
  getSummaryAlerts
);

// PATCH /api/summary/:patientId/alerts/:alertId/dismiss
// Marks a specific alert as acknowledged by the current user
// THERE IS NO NURSE ROLE. UPDATE PLZ
router.patch(
  '/:patientId/alerts/:alertId/dismiss',
  requireAuth,
  requireRole('DOCTOR', 'NURS3E'), //NO NURSE/RECEPTIONIST/PHARMACIST ROLE
  dismissAlert
);

module.exports = router;