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


const { requireAuth, requireRole } = require('../middleware/auth');


router.get('/templates/my',
  requireAuth,
  requireRole('DOCTOR'),
  getMyTemplates
);

router.post('/templates/my',
  requireAuth,
  requireRole('DOCTOR'),
  createMyTemplate
);

router.put('/templates/my/:id',
  requireAuth,
  requireRole('DOCTOR'),
  updateMyTemplate
);

// added
router.get('/templates/clinic',
  requireAuth,
  requireRole('DOCTOR', 'ADMINISTRATOR'),
  getClinicTemplates
);


router.post('/templates/clinic',
  requireAuth,
  requireRole('ADMINISTRATOR'),
  createClinicTemplate
);


router.put('/templates/clinic/:id',
  requireAuth,
  requireRole('ADMINISTRATOR'),
  updateClinicTemplate
);

module.exports = router;