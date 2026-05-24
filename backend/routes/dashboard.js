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

const { authenticateToken, requireRole } = require('../middleware/auth');

// ─── Role-Specific Dashboard Views ───────────────────────────────────────────

// GET /api/dashboard/doctor
router.get(
  '/doctor',
  authenticateToken,
  requireRole('doctor'),
  getDoctorDashboard
);

// GET /api/dashboard/nurse
router.get(
  '/nurse',
  authenticateToken,
  requireRole('admin'),
  getNurseDashboard
);

// GET /api/dashboard/admin
router.get(
  '/admin',
  authenticateToken,
  requireRole('admin'),
  getAdminDashboard
);

// GET /api/dashboard/receptionist
router.get(
  '/receptionist',
  authenticateToken,
  requireRole('admin'),
  getReceptionistDashboard
);

// ─── Shared Dashboard Widgets ─────────────────────────────────────────────────

// GET /api/dashboard/appointments/today
router.get(
  '/appointments/today',
  authenticateToken,
  requireRole('doctor', 'admin'),
  getTodaysAppointments
);

// GET /api/dashboard/tasks
router.get(
  '/tasks',
  authenticateToken,
  requireRole('doctor', 'admin'),
  getPendingTasks
);

// PATCH /api/dashboard/tasks/:taskId/complete
router.patch(
  '/tasks/:taskId/complete',
  authenticateToken,
  requireRole('doctor', 'admin'),
  completeTask
);

// GET /api/dashboard/activity
router.get(
  '/activity',
  authenticateToken,
  requireRole('doctor', 'admin'),
  getRecentActivity
);

// ─── Clinic-Wide Metrics (Admin / Management) ─────────────────────────────────

// GET /api/dashboard/metrics
router.get(
  '/metrics',
  authenticateToken,
  requireRole('admin'),
  getClinicMetrics
);

// GET /api/dashboard/workload
router.get(
  '/workload',
  authenticateToken,
  requireRole('admin'),
  getProviderWorkload
);

module.exports = router;
