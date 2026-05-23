const express = require("express");

const {
  completeConsultation,
  getConsultation,
  getConsultations,
} = require("../controllers/consultationController");

const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.post("/complete", authenticateToken, completeConsultation);
router.get("/", authenticateToken, getConsultations);
router.get("/:consultationId", authenticateToken, getConsultation);

module.exports = router;
