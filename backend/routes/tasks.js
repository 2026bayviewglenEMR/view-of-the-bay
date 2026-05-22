const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  completeTask,
} = require("../controllers/taskController");

const { authenticateToken } = require("../verifyToken");

router.post("/", authenticateToken, createTask);
router.get("/", authenticateToken, getTasks);
router.get("/:id", authenticateToken, getTaskById);
router.patch("/:id", authenticateToken, updateTask);
router.delete("/:id", authenticateToken, deleteTask);
router.post("/:id/complete", authenticateToken, completeTask);

module.exports = router;
