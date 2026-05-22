const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const controller = require("../controllers/documentController");
const { authenticateToken } = require("../verifyToken");

// Upload document
router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  controller.uploadDocument
);

// Get documents for a patient
router.get(
  "/patient/:patientId",
  authenticateToken,
  controller.getDocumentsByPatient
);

// Delete document
router.delete(
  "/:id",
  authenticateToken,
  controller.deleteDocument
);

module.exports = router;
