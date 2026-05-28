const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { getMessages, sendMessage, markAsRead, getConversations } = require("../controllers/messageController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get("/conversations/:userId", getConversations);
router.get("/:userId/:otherUserId", getMessages);
router.post("/", sendMessage);
router.patch("/:id/read", markAsRead);
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const baseUrl = process.env.VITE_SERVER_URL || "http://localhost:3000";
  res.status(200).json({
    name: req.file.originalname,
    url: `${baseUrl}/uploads/${req.file.filename}`
  });
});

module.exports = router;