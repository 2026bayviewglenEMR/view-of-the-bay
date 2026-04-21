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

router.get('/templates/:id/use',
  requireAuth,
  requireRole('DOCTOR', 'ADMINISTRATOR'),
  useTemplate
);


router.get('/favorites',
  requireAuth,
  requireRole('DOCTOR'),
  getFavorites
);

router.post('/favorites',
  requireAuth,
  requireRole('DOCTOR'),
  createFavorite
);


router.delete('/favorites/:id',
  requireAuth,
  requireRole('DOCTOR'),
  deleteFavorite
);

module.exports = router;