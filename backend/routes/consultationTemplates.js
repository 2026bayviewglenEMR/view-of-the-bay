const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../verifyToken');

const {
  getConsultationWorkspace,
  saveAndCompleteVisit
} = require('../controllers/consultationController');

const {
  getMyTemplates,
  createMyTemplate,
  updateMyTemplate,
  getClinicTemplates
} = require('../controllers/templateController');

const requireAuth = authenticateToken;

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Access denied. No role information.' });
    }

    const userRole = req.user.role.toLowerCase();
    const allowed = allowedRoles.some(
      role => role.toLowerCase() === userRole
    );

    if (!allowed) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};


router.get(
  '/consultation/workspace',
  requireAuth,
  getConsultationWorkspace
);

router.post(
  '/consultation/complete',
  requireAuth,
  requireRole(['doctor']),
  saveAndCompleteVisit
);


router.get(
  '/templates/my',
  requireAuth,
  requireRole(['doctor']),
  getMyTemplates
);

router.post(
  '/templates/my',
  requireAuth,
  requireRole(['doctor']),
  createMyTemplate
);

router.put(
  '/templates/my/:id',
  requireAuth,
  requireRole(['doctor']),
  updateMyTemplate
);

router.get(
  '/templates/clinic',
  requireAuth,
  requireRole(['admin']),
  getClinicTemplates
);

module.exports = router;