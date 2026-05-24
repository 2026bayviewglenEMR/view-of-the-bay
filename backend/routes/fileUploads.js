const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const verifyToken = require('../verifyToken');
const { uploadDocument, getDocumentsByPatient, deleteDocument } = require('../controllers/documentController');

// Upload a document
router.post('/upload', verifyToken, upload.single('file'), uploadDocument);

// Get documents for a patient
router.get('/patient/:patientId', verifyToken, getDocumentsByPatient);

// Delete a document
router.delete('/:id', verifyToken, deleteDocument);

module.exports = router;