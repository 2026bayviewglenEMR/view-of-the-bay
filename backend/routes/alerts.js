const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { authenticateToken } = require("../middleware/auth");

router.get('/', authenticateToken, async (req, res) => {
  try {
    const alerts = await Alert.find({ status: { $ne: 'dismissed' } })
      .populate('patientId', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { text, type, patientId } = req.body;
    const alert = new Alert({
      assignedTo: req.user.id,
      patientId,
      type,
      description: text,
      dueDate: new Date(),
      status: 'active',
    });
    await alert.save();
    res.status(201).json(alert);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: 'Alert deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
