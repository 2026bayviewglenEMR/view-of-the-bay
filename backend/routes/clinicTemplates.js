const express = require("express");

const {
  getAllTemplates,
  getTemplate,
} = require("../controllers/templateController");

const {
  authenticateToken,
  requireRole,
} = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, requireRole("admin"), getAllTemplates);
router.get("/:templateId", authenticateToken, requireRole("admin"), getTemplate);

module.exports = router;