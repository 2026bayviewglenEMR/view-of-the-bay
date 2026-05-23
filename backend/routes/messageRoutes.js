// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const { getMessages, sendMessage, markAsRead, getConversations } = require("../controllers/messageController");

router.get("/conversations/:userId", getConversations);  
router.get("/:userId/:otherUserId", getMessages);
router.post("/", sendMessage);
router.patch("/:id/read", markAsRead);

module.exports = router;