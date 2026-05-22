const express = require('express');
const router = express.Router();

// TODO: Lab routes for Feature 6

const {
  getMyTemplates,
  createMyTemplate,
  updateMyTemplate,
  deleteMyTemplate,
  getClinicTemplates,
  createClinicTemplate,
  updateClinicTemplate,
  useTemplate
} = require('../controllers/tfController');

const {
  getFavorites,
  createFavorite,
  deleteFavorite
} = require('../controllers/favoriteController');


const { authenticateToken: requireAuth, requireRole } = require('../verifyToken');


router.get('/templates/my',
  requireAuth,
  requireRole(['doctor']),
  getMyTemplates
);

router.post('/templates/my',
  requireAuth,
  requireRole(['doctor']),
  createMyTemplate
);

router.put('/templates/my/:id',
  requireAuth,
  requireRole(['doctor']),
  updateMyTemplate
);

// added
router.get('/templates/clinic',
  requireAuth,
  requireRole(['doctor', 'admin']),
  getClinicTemplates
);


router.post('/templates/clinic',
  requireAuth,
  requireRole(['admin']),
  createClinicTemplate
);


router.put('/templates/clinic/:id',
  requireAuth,
  requireRole(['admin']),
  updateClinicTemplate
);

module.exports = router;
