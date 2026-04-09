exports.getDoctorDashboard = async (req, res) => {
  try {
    // TODO: parallel fetch — today's appointments, waiting room patients assigned to doctor,
    //        pending lab reviews, incomplete encounter notes, active patient alerts
    res.json({ appointments: [], waitingPatients: [], pendingLabs: [], incompletNotes: [], alerts: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNurseDashboard = async (req, res) => {
  try {
    // TODO: waiting room queue, patients needing vitals, medication tasks, flagged patients
    res.json({ queue: [], vitalsPending: [], medicationTasks: [], flaggedPatients: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    // TODO: clinic metrics, provider schedules, billing flags, system-level alerts
    res.json({ metrics: {}, schedules: [], billingFlags: [], systemAlerts: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReceptionistDashboard = async (req, res) => {
  try {
    // TODO: today's schedule, check-in queue, unconfirmed appointments
    res.json({ todaySchedule: [], checkInQueue: [], unconfirmed: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTodaysAppointments = async (req, res) => {
  try {
    const { providerId, status } = req.query;
    // TODO: Appointment.find({ date: today, ...(providerId && {providerId}), ...(status && {status}) })
    res.json({ appointments: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingTasks = async (req, res) => {
  try {
    // TODO: Task.find({ assignedTo: req.user._id, completed: false }).sort({ dueDate: 1 })
    res.json({ tasks: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { notes } = req.body;
    // TODO: Task.findByIdAndUpdate(taskId, { completed: true, completedAt: Date.now(), completedBy: req.user._id, notes })
    res.json({ message: 'Task completed', taskId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    // TODO: ActivityLog.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip().limit()
    res.json({ activity: [], total: 0, page });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getClinicMetrics = async (req, res) => {
  try {
    const { from, to } = req.query;
    // TODO: aggregate Appointment, QueueEntry, and Billing collections for date range
    res.json({ patientsSeen: 0, avgWaitTime: 0, noShowRate: 0, appointmentsByStatus: {} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProviderWorkload = async (req, res) => {
  try {
    const { date, view = 'day' } = req.query;
    // TODO: group Appointment by providerId for the given date/week, return counts per provider
    res.json({ workload: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};