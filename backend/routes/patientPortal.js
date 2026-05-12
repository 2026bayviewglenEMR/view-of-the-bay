const express = require("express");
const router = express.Router();

const {
  getPatientPortalData,
  listPatientsForTesting,
  debugDatabase,
} = require("../controllers/patientPortalController");

router.get("/debug/db", debugDatabase);
router.get("/debug/patients", listPatientsForTesting);

router.get("/:patientId", getPatientPortalData);

module.exports = router;