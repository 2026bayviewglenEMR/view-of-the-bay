// 1. Change 'import' to 'require'
const express = require('express');
const router = express.Router();

// 2. Change these imports to match CommonJS destructuring
const { authenticateToken, requireRole } = require('../verifyToken.js');
const { getTemplates } = require("../controllers/templatesController.js");

// This part stays exactly the same
router.get('/', authenticateToken, requireRole(['doctor']), getTemplates);

// 3. Change 'export default' to 'module.exports'
module.exports = router;