const Document = require("../models/Document");
const fs = require("fs");

// Helper: safely parse arrays (in case they come as JSON strings)
const parseArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

// upload document 
exports.uploadDocument = async (req, res) => {
  try {
    const { patientId, documentType, scope } = req.body;

    // Basic validation
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!patientId || !documentType || !scope) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Ensure valid scope
    if (!["public", "role", "restricted"].includes(scope)) {
      return res.status(400).json({ error: "Invalid access scope" });
    }

    const roles = parseArray(req.body.roles);
    const userIds = parseArray(req.body.userIds);

    // Ensure req.user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const newDoc = new Document({
      uploaderId: req.user.id,
      patientId,
      fileName: req.file.filename,
      originalName: req.body.originalName || req.file.originalname || req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`,
      documentType,
      access: {
        scope,
        roles,
        userIds,
      },
      uploadDate: new Date(),
    });

    await newDoc.save();

    res.status(201).json(newDoc);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

// get documents for a patient 
exports.getDocumentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    const docs = await Document.find({ patientId }).sort({ createdAt: -1 });

    const filteredDocs = docs.filter((doc) => {
      const access = doc.access || {};

      if (access.scope === "public") return true;

      if (
        access.scope === "role" &&
        Array.isArray(access.roles) &&
        access.roles.includes(userRole)
      ) {
        return true;
      }

      if (
        access.scope === "restricted" &&
        Array.isArray(access.userIds) &&
        access.userIds.some((id) => id.toString() === userId)
      ) {
        return true;
      }

      return false;
    });

    res.json(filteredDocs);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};

// delete document 
exports.deleteDocument = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Only uploader can delete
    if (doc.uploaderId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // delete file from disk 
    const filePath = `.${doc.fileUrl}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await doc.deleteOne();

    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};