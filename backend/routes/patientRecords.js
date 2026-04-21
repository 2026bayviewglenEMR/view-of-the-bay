const express = require('express');
const router = express.Router();

const {
  getPatientRecord,
  createPatientRecord,
  updatePatientRecord,
  deletePatientRecord,
  searchPatients,
  getPatientVisitHistory,
  addVisit,
  updateVisit,
  getPatientMedications,
  addMedication,
  updateMedication,
  discontinueMedication,
  getPatientAllergies,
  addAllergy,
  deleteAllergy,
  getPatientDiagnoses,
  addDiagnosis,
  updateDiagnosis,
  getPatientDocuments,
  uploadDocument,
  deleteDocument,
} = require('../controllers/patientRecordsController');

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

const { upload } = require('../middleware/multer');

// ─── Patient CRUD ────────────────────────────────────────────────────────────

// GET /api/records?name=&dob=&mrn=
// Search / list patients. Supports query params: name, dob, mrn, page, limit
router.get(
  '/',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'ADMIN', 'RECEPTIONIST'),
  searchPatients
);

// POST /api/records
// Register a new patient record
// Body: { firstName, lastName, dob, gender, contact, insurance, ... }
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'RECEPTIONIST'),
  createPatientRecord
);

// GET /api/records/:patientId
// Full patient chart: demographics, problem list, meds, allergies, vitals snapshot
router.get(
  '/:patientId',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'ADMIN', 'RECEPTIONIST'),
  getPatientRecord
);

// PUT /api/records/:patientId
// Update demographic or insurance information for a patient
router.put(
  '/:patientId',
  requireAuth,
  requireRole('ADMIN', 'RECEPTIONIST'),
  updatePatientRecord
);

// DELETE /api/records/:patientId
// Soft-delete (deactivate) a patient record — admin only
router.delete(
  '/:patientId',
  requireAuth,
  requireRole('ADMIN'),
  deletePatientRecord
);

// ─── Visit History ────────────────────────────────────────────────────────────

// GET /api/records/:patientId/visits
// List all visits with pagination. Query params: page, limit, from, to
router.get(
  '/:patientId/visits',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'ADMIN'),
  getPatientVisitHistory
);

// POST /api/records/:patientId/visits
// Create a new visit/encounter note
// Body: { visitDate, chiefComplaint, notes, vitals, providerId }
router.post(
  '/:patientId/visits',
  requireAuth,
  requireRole('DOCTOR', 'NURSE'),
  addVisit
);

// PUT /api/records/:patientId/visits/:visitId
// Amend an existing visit note (locked after 24 h in production; enforce in controller)
router.put(
  '/:patientId/visits/:visitId',
  requireAuth,
  requireRole('DOCTOR', 'NURSE'),
  updateVisit
);

// ─── Medications ─────────────────────────────────────────────────────────────

// GET /api/records/:patientId/medications
// Active (and optionally historical) medication list
router.get(
  '/:patientId/medications',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'PHARMACIST'),
  getPatientMedications
);

// POST /api/records/:patientId/medications
// Prescribe / add a medication
// Body: { drugName, dose, route, frequency, startDate, prescriberId }
router.post(
  '/:patientId/medications',
  requireAuth,
  requireRole('DOCTOR'),
  addMedication
);

// PUT /api/records/:patientId/medications/:medicationId
// Update dosage or frequency
router.put(
  '/:patientId/medications/:medicationId',
  requireAuth,
  requireRole('DOCTOR'),
  updateMedication
);

// PATCH /api/records/:patientId/medications/:medicationId/discontinue
// Mark a medication as discontinued without deleting history
router.patch(
  '/:patientId/medications/:medicationId/discontinue',
  requireAuth,
  requireRole('DOCTOR'),
  discontinueMedication
);

// ─── Allergies ────────────────────────────────────────────────────────────────

// GET /api/records/:patientId/allergies
router.get(
  '/:patientId/allergies',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'PHARMACIST'),
  getPatientAllergies
);

// POST /api/records/:patientId/allergies
// Body: { allergen, reaction, severity, onsetDate }
router.post(
  '/:patientId/allergies',
  requireAuth,
  requireRole('DOCTOR', 'NURSE'),
  addAllergy
);

// DELETE /api/records/:patientId/allergies/:allergyId
// Remove an incorrectly entered allergy
router.delete(
  '/:patientId/allergies/:allergyId',
  requireAuth,
  requireRole('DOCTOR'),
  deleteAllergy
);

// ─── Diagnoses / Problem List ─────────────────────────────────────────────────

// GET /api/records/:patientId/diagnoses
router.get(
  '/:patientId/diagnoses',
  requireAuth,
  requireRole('DOCTOR', 'NURSE'),
  getPatientDiagnoses
);

// POST /api/records/:patientId/diagnoses
// Body: { icdCode, description, diagnosedDate, status }
router.post(
  '/:patientId/diagnoses',
  requireAuth,
  requireRole('DOCTOR'),
  addDiagnosis
);

// PUT /api/records/:patientId/diagnoses/:diagnosisId
// Update status (active, resolved, chronic) or description
router.put(
  '/:patientId/diagnoses/:diagnosisId',
  requireAuth,
  requireRole('DOCTOR'),
  updateDiagnosis
);

// ─── Documents / Attachments ──────────────────────────────────────────────────

// GET /api/records/:patientId/documents
// List uploaded documents (imaging reports, consent forms, referrals, etc.)
router.get(
  '/:patientId/documents',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'ADMIN'),
  getPatientDocuments
);

// POST /api/records/:patientId/documents
// Upload a document (PDF, image). Uses multer middleware.
router.post(
  '/:patientId/documents',
  requireAuth,
  requireRole('DOCTOR', 'NURSE', 'ADMIN'),
  upload.single('file'),
  uploadDocument
);

// DELETE /api/records/:patientId/documents/:documentId
router.delete(
  '/:patientId/documents/:documentId',
  requireAuth,
  requireRole('DOCTOR', 'ADMIN'),
  deleteDocument
);

module.exports = router;