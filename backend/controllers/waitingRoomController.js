exports.getWaitingRoom = async (req, res) => {
  try {
    const { status, providerId } = req.query;
    // TODO: QueueEntry.find({ ...filters }).populate('patientId').sort({ checkInTime: 1 })
    res.json({ queue: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWaitingRoomStats = async (req, res) => {
  try {
    // TODO: aggregate QueueEntry documents for today's date
    res.json({
      totalWaiting: 0,
      totalInProgress: 0,
      avgWaitTimeMinutes: 0,
      longestWaitMinutes: 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkInPatient = async (req, res) => {
  try {
    const { patientId, appointmentId, chiefComplaint, providerId, priority = 'normal' } = req.body;
    // TODO: new QueueEntry({ patientId, appointmentId, chiefComplaint, providerId, priority, status: 'waiting', checkInTime: Date.now() }).save()
    res.status(201).json({ message: 'Patient checked in', patientId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkOutPatient = async (req, res) => {
  try {
    const { queueEntryId } = req.params;
    // TODO: QueueEntry.findByIdAndUpdate(queueEntryId, { status: 'completed', checkOutTime: Date.now() })
    res.json({ message: 'Patient checked out', queueEntryId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getQueuePosition = async (req, res) => {
  try {
    const { queueEntryId } = req.params;
    // TODO: count QueueEntry docs with status='waiting' and checkInTime before this entry's
    res.json({ queueEntryId, position: 0, estimatedWaitMinutes: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateWaitingRoomStatus = async (req, res) => {
  try {
    const { queueEntryId } = req.params;
    const { status } = req.body;
    const validStatuses = ['waiting', 'called', 'in-progress', 'no-show', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    // TODO: QueueEntry.findByIdAndUpdate(queueEntryId, { status }, { new: true })
    res.json({ message: 'Status updated', queueEntryId, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignRoom = async (req, res) => {
  try {
    const { queueEntryId } = req.params;
    const { roomNumber } = req.body;
    // TODO: QueueEntry.findByIdAndUpdate(queueEntryId, { roomNumber, status: 'called' })
    res.json({ message: 'Room assigned', queueEntryId, roomNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.flagUrgent = async (req, res) => {
  try {
    const { queueEntryId } = req.params;
    const { reason } = req.body;
    // TODO: QueueEntry.findByIdAndUpdate(queueEntryId, { priority: 'urgent', urgentReason: reason })
    res.json({ message: 'Patient flagged as urgent', queueEntryId, reason });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reorderQueue = async (req, res) => {
  try {
    const { orderedIds } = req.body; // Array<String>
    // TODO: iterate orderedIds, update each QueueEntry's queueOrder field to its array index
    res.json({ message: 'Queue reordered', count: orderedIds?.length ?? 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
