const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const controller = require("../controllers/documentController");
const auth = require("../middleware/auth");

// Upload document
router.post(
  "/upload",
  auth,
  upload.single("file"),
  controller.uploadDocument
);

// Get documents for a patient
router.get(
  "/patient/:patientId",
  auth,
  controller.getDocumentsByPatient
);

// Delete document
router.delete(
  "/:id",
  auth,
  controller.deleteDocument
);

module.exports = router;