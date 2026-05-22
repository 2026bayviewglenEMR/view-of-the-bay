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

const { authenticateToken: requireAuth, requireRole } = require('../verifyToken');
const { upload } = require('../middleware/multer'); // multer instance for document uploads

// ─── Patient CRUD ────────────────────────────────────────────────────────────

// GET /api/records?name=&dob=&mrn=
// Search / list patients. Supports query params: name, dob, mrn, page, limit
router.get(
  '/',
  requireAuth,
  requireRole(['doctor', 'nur3se', 'admin', 'receptionist']), //NO NURSE/RECEPTIONIST ROLE
  searchPatients
);

// POST /api/records
// Register a new patient record
// Body: { firstName, lastName, dob, gender, contact, insurance, ... }
router.post(
  '/',
  requireAuth,
  requireRole(['admin', 'receptionist']), //NO NURSE/RECEPTIONIST ROLE
  createPatientRecord
);

// GET /api/records/:patientId
// Full patient chart: demographics, problem list, meds, allergies, vitals snapshot
router.get(
  '/:patientId',
  requireAuth,
  requireRole(['doctor', 'nurs3e', 'admin', 'receptionist']), //NO NURSE/RECEPTIONIST ROLE
  getPatientRecord
);

// PUT /api/records/:patientId
// Update demographic or insurance information for a patient
router.put(
  '/:patientId',
  requireAuth,
  requireRole(['admin', 'receptionist']), //NO NURSE/RECEPTIONIST ROLE
  updatePatientRecord
);

// DELETE /api/records/:patientId
// Soft-delete (deactivate) a patient record — admin only
router.delete(
  '/:patientId',
  requireAuth,
  requireRole(['admin']),
  deletePatientRecord
);

// ─── Visit History ────────────────────────────────────────────────────────────

// GET /api/records/:patientId/visits
// List all visits with pagination. Query params: page, limit, from, to
router.get(
  '/:patientId/visits',
  requireAuth,
  requireRole(['doctor', 'nurs3e', 'admin']), //NO NURSE/RECEPTIONIST ROLE
  getPatientVisitHistory
);

// POST /api/records/:patientId/visits
// Create a new visit/encounter note
// Body: { visitDate, chiefComplaint, notes, vitals, providerId }
// THERE IS NO NURS3E ROLE. UPDATE PLZ
router.post(
  '/:patientId/visits',
  requireAuth,
  requireRole(['doctor', 'nurs3e']), //NO NURSE/RECEPTIONIST ROLE
  addVisit
);

// PUT /api/records/:patientId/visits/:visitId
// Amend an existing visit note (locked after 24 h in production; enforce in controller)
// THERE IS NO NURS3E ROLE. UPDATE PLZ
router.put(
  '/:patientId/visits/:visitId',
  requireAuth,
  requireRole(['doctor', 'nurs3e']), //NO NURSE/RECEPTIONIST ROLE
  updateVisit
);

// ─── Medications ─────────────────────────────────────────────────────────────

// GET /api/records/:patientId/medications
// Active (and optionally historical) medication list
router.get(
  '/:patientId/medications',
  requireAuth,
  requireRole(['doctor', 'nurs3e', 'pharmacist']), //NO NURSE/RECEPTIONIST/PHARMACIST ROLE
  getPatientMedications
);

// POST /api/records/:patientId/medications
// Prescribe / add a medication
// Body: { drugName, dose, route, frequency, startDate, prescriberId }
router.post(
  '/:patientId/medications',
  requireAuth,
  requireRole(['doctor']),
  addMedication
);

// PUT /api/records/:patientId/medications/:medicationId
// Update dosage or frequency
router.put(
  '/:patientId/medications/:medicationId',
  requireAuth,
  requireRole(['doctor']),
  updateMedication
);

// PATCH /api/records/:patientId/medications/:medicationId/discontinue
// Mark a medication as discontinued without deleting history
router.patch(
  '/:patientId/medications/:medicationId/discontinue',
  requireAuth,
  requireRole(['doctor']),
  discontinueMedication
);

// ─── Allergies ────────────────────────────────────────────────────────────────

// GET /api/records/:patientId/allergies
router.get(
  '/:patientId/allergies',
  requireAuth,
  requireRole(['doctor', 'nurs3e', 'pharmacist']), //NO NURSE/RECEPTIONIST/PHARMACIST ROLE
  getPatientAllergies
);

// POST /api/records/:patientId/allergies
// Body: { allergen, reaction, severity, onsetDate }
// THERE IS NO NURS3E ROLE. UPDATE PLZ
router.post(
  '/:patientId/allergies',
  requireAuth,
  requireRole(['doctor', 'nurs3e']), //NO NURSE/RECEPTIONIST/PHARMACIST ROLE
  addAllergy
);

// DELETE /api/records/:patientId/allergies/:allergyId
// Remove an incorrectly entered allergy
router.delete(
  '/:patientId/allergies/:allergyId',
  requireAuth,
  requireRole(['doctor']),
  deleteAllergy
);

// ─── Diagnoses / Problem List ─────────────────────────────────────────────────

// GET /api/records/:patientId/diagnoses
// THERE IS NO NURS3E ROLE. UPDATE PLZ
router.get(
  '/:patientId/diagnoses',
  requireAuth,
  requireRole(['doctor', 'nurs3e']), //NO NURSE/RECEPTIONIST/PHARMACIST ROLE
  getPatientDiagnoses
);

// POST /api/records/:patientId/diagnoses
// Body: { icdCode, description, diagnosedDate, status }
router.post(
  '/:patientId/diagnoses',
  requireAuth,
  requireRole(['doctor']),
  addDiagnosis
);

// PUT /api/records/:patientId/diagnoses/:diagnosisId
// Update status (active, resolved, chronic) or description
router.put(
  '/:patientId/diagnoses/:diagnosisId',
  requireAuth,
  requireRole(['doctor']),
  updateDiagnosis
);

// ─── Documents / Attachments ──────────────────────────────────────────────────

// GET /api/records/:patientId/documents
// List uploaded documents (imaging reports, consent forms, referrals, etc.)
router.get(
  '/:patientId/documents',
  requireAuth,
  requireRole(['doctor', 'nurs3e', 'admin']), //NO NURSE/RECEPTIONIST/PHARMACIST ROLE
  getPatientDocuments
);

// POST /api/records/:patientId/documents
// Upload a document (PDF, image). Uses multer middleware.
router.post(
  '/:patientId/documents',
  requireAuth,
  requireRole(['doctor', 'nurs3e', 'admin']), //NO NURSE/RECEPTIONIST/PHARMACIST ROLE
  upload.single('file'),
  uploadDocument
);

// DELETE /api/records/:patientId/documents/:documentId
router.delete(
  '/:patientId/documents/:documentId',
  requireAuth,
  requireRole(['doctor', 'admin']), //NO NURSE/RECEPTIONIST/PHARMACIST ROLE
  deleteDocument
);

module.exports = router;
