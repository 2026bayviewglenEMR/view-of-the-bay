// 1. Change 'import' to 'require'
const express = require('express');
const router = express.Router();

// 2. Change these imports to match CommonJS destructuring
const { authenticateToken, requireRole } = require('../verifyToken.js');
const {
  createMyTemplate,
  deleteMyTemplate,
  getClinicTemplate,
  getClinicTemplates,
  getMyTemplates,
  getTemplates,
  updateMyTemplate,
} = require("../controllers/templatesController.js");

// This part stays exactly the same
router.get('/', authenticateToken, requireRole(['doctor']), getTemplates);
router.get('/my', authenticateToken, requireRole(['doctor']), getMyTemplates);
router.post('/my', authenticateToken, requireRole(['doctor']), createMyTemplate);
router.patch('/my/:templateId', authenticateToken, requireRole(['doctor']), updateMyTemplate);
router.delete('/my/:templateId', authenticateToken, requireRole(['doctor']), deleteMyTemplate);
router.get('/clinic', authenticateToken, requireRole(['admin']), getClinicTemplates);
router.get('/clinic/:templateId', authenticateToken, requireRole(['admin']), getClinicTemplate);

// 3. Change 'export default' to 'module.exports'
module.exports = router;
