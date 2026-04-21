const express = require('express');
const router = express.Router();

const {
  getDoctorDashboard,
  getNurseDashboard,
  getAdminDashboard,
  getReceptionistDashboard,
  getClinicMetrics,
  getTodaysAppointments,
  getPendingTasks,
  completeTask,
  getRecentActivity,
  getProviderWorkload,
} = require('../controllers/dashboardController');

const { requireAuth, requireRole } = require('../middleware/auth');

// ─── Role-Specific Dashboard Views ───────────────────────────────────────────

// GET /api/dashboard/doctor
// Today's appointments, assigned patients in waiting room, pending lab reviews,
// incomplete notes, active alerts for their patients.
router.get(
  '/doctor',
  requireAuth,
  requireRole('DOCTOR'),
  getDoctorDashboard
);

// GET /api/dashboard/nurse
// Waiting room queue, vitals pending, medication tasks, flagged patients.
router.get(
  '/nurse',
  requireAuth,
  requireRole('NURSE'),
  getNurseDashboard
);

// GET /api/dashboard/admin
// Clinic-wide metrics, provider schedules, billing flags, system alerts.
router.get(
  '/admin',
  requireAuth,
  requireRole('ADMIN'),
  getAdminDashboard
);

// GET /api/dashboard/receptionist
// Today's schedule, check-in queue, unconfirmed appointments, incoming calls log.
router.get(
  '/receptionist',
  requireAuth,
  requireRole('RECEPTIONIST'),
  getReceptionistDashboard
);

// ─── Shared Dashboard Widgets ─────────────────────────────────────────────────

// GET /api/dashboard/appointments/today
// Returns today's appointment list for the authenticated provider,
// or all appointments if admin/receptionist.
// Optional query: providerId (admin use), status (scheduled|arrived|completed|no-show)
router.get(
  '/appointments/today',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'ADMIN', 'RECEPTIONIST'),
  getTodaysAppointments
);

// GET /api/dashboard/tasks
// Returns outstanding tasks assigned to the authenticated user.
// Types: lab-review, prescription-renewal, incomplete-note, referral, follow-up
router.get(
  '/tasks',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'ADMIN'),
  getPendingTasks
);

// PATCH /api/dashboard/tasks/:taskId/complete
// Marks a task as done. Body can include { notes: String } for audit.
router.patch(
  '/tasks/:taskId/complete',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'ADMIN'),
  completeTask
);

// GET /api/dashboard/activity
// Recent activity feed for the authenticated user: chart updates, lab results,
// messages, check-ins. Query params: limit (default 20), page
router.get(
  '/activity',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'ADMIN'),
  getRecentActivity
);

// ─── Clinic-Wide Metrics (Admin / Management) ─────────────────────────────────

// GET /api/dashboard/metrics
// Aggregated clinic KPIs: patients seen today, avg wait time, no-show rate,
// appointments by status, revenue summary (if billing integrated).
// Query params: from, to (ISO date strings for date range)
router.get(
  '/metrics',
  requireAuth,
  requireRole('ADMIN'),
  getClinicMetrics
);

// GET /api/dashboard/workload
// Per-provider patient count and appointment load for the day/week.
// Used to surface scheduling imbalances.
// Query params: date (defaults to today), view (day|week)
router.get(
  '/workload',
  requireAuth,
  requireRole('ADMIN'),
  getProviderWorkload
);

module.exports = router;