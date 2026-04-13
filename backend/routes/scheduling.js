const express = require('express');
const router = express.Router();

const {
  createAppointment,
  getAppointments,
  getAppointmentsByDoctor,
  getCalendarView,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  checkInAppointment,
  startAppointment,
  completeAppointment,
  getAvailableSlots,
  getAppointmentsByPatient,
  getAppointmentStats
} = require('../controllers/schedulingController');

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

router.post('/',
  requireAuth,
  requireRole('RECEPTIONIST', 'NURSE', 'ADMIN'),
  createAppointment
);

router.get('/',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'ADMIN'),
  getAppointments
);

router.get('/calendar',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'ADMIN'),
  getCalendarView
);

router.get('/doctor/:doctorId',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'ADMIN'),
  getAppointmentsByDoctor
);

router.get('/doctor/:doctorId/slots',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'ADMIN'),
  getAvailableSlots
);

router.get('/patient/:patientId',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'ADMIN'),
  getAppointmentsByPatient
);

router.get('/stats',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'ADMIN'),
  getAppointmentStats
);

router.get('/:id',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'ADMIN'),
  getAppointmentById
);

router.put('/:id',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'ADMIN'),
  updateAppointment
);

router.patch('/:id/cancel',
  requireAuth,
  requireRole('RECEPTIONIST', 'NURSE', 'ADMIN'),
  cancelAppointment
);

router.patch('/:id/check-in',
  requireAuth,
  requireRole('RECEPTIONIST', 'NURSE', 'ADMIN'),
  checkInAppointment
);

router.patch('/:id/start',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'ADMIN'),
  startAppointment
);

router.patch('/:id/complete',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'ADMIN'),
  completeAppointment
);

module.exports = router;