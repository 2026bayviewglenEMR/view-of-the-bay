import { Router } from 'express';
const router = Router();

import { authenticateToken, requireRole } from '../verifyToken.js';

import { getTemplates } from "../controllers/templatesController.js";

router.get('/', authenticateToken, requireRole(['doctor']), getTemplates);

export default router;