const express = require("express");
const router = express.Router();

const { authenticateToken, requireRole } = require("../verifyToken.js");
const {
  createMyTemplate,
  deleteMyTemplate,
  getClinicTemplate,
  getClinicTemplates,
  getMyTemplates,
  getTemplates,
  updateMyTemplate,
} = require("../controllers/templatesController.js");

router.get("/", authenticateToken, requireRole(["doctor", "admin"]), getTemplates);

router.get("/my", authenticateToken, requireRole(["doctor"]), getMyTemplates);
router.post("/my", authenticateToken, requireRole(["doctor"]), createMyTemplate);
router.patch("/my/:templateId", authenticateToken, requireRole(["doctor"]), updateMyTemplate);
router.delete("/my/:templateId", authenticateToken, requireRole(["doctor"]), deleteMyTemplate);

router.get("/clinic", authenticateToken, requireRole(["admin"]), getClinicTemplates);
router.get("/clinic/:templateId", authenticateToken, requireRole(["admin"]), getClinicTemplate);

module.exports = router;
