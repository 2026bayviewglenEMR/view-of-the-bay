// controllers/messageController.js
const mongoose = require("mongoose");
const Message = require("../models/Message");

// Load all messages between two users
const getMessages = async (req, res) => {
  const { userId, otherUserId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    }).sort({ timestamp: 1 });

    // mark all messages sent TO the current user as read
    await Message.updateMany(
      { senderId: otherUserId, receiverId: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to load messages" });
  }
};

// Send a new message
const sendMessage = async (req, res) => {
  const { senderId, receiverId, content, attachments } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({ error: "senderId and receiverId are required" });
  }
  if (!content && (!attachments || attachments.length === 0)) {
    return res.status(400).json({ error: "Message must have content or an attachment" });
  }

  try {
    const newMessage = new Message({
      senderId,
      receiverId,
      content: content || "",
      attachments: attachments || [],
      timestamp: new Date(),
    });

    const saved = await newMessage.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Mark a message as read
const markAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!message) return res.status(404).json({ error: "Message not found" });
    res.status(200).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
};

// Get all conversations for a user
const getConversations = async (req, res) => {
  const { userId } = req.params;
  try {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ timestamp: -1 });

    const seen = new Set();
    const conversations = [];

    for (const msg of messages) {
      const otherId = msg.senderId.toString() === userId
        ? msg.receiverId.toString()
        : msg.senderId.toString();

      if (!seen.has(otherId)) {
        seen.add(otherId);

        const unreadCount = await Message.countDocuments({
            senderId: new mongoose.Types.ObjectId(otherId),
            receiverId: new mongoose.Types.ObjectId(userId),
            isRead: false
          });
          console.log('unreadCount for', otherId, ':', unreadCount);
        

        conversations.push({
          otherUserId: otherId,
          lastMessage: msg.content,
          lastTimestamp: msg.timestamp,
          isRead: unreadCount === 0,
          unreadCount
        });
      }
    }

    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ error: "Failed to load conversations" });
  }
};
module.exports = { getMessages, sendMessage, markAsRead, getConversations };