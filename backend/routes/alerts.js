const express = require('express')
const router = express.Router()
const alertsController = require('../controllers/alertsController')

// TODO: Alerts, Reminders & Tasks
// Features:
// Patient-specific alerts (e.g., "discuss stress")
// Screening reminders (overdue tests)
// Personal task list for doctors
// Task scheduling & completion tracking

router.get('/patients/:patientId/alerts', alertsController.getPatientAlerts);
router.post('/alerts', alertsController.createAlert);
router.patch('/alerts/:id/dismiss', alertsController.dismissAlert);
router.patch('/alerts/:id/complete', alertsController.completeTask);
router.get('/screening-reminders', alertsController.getScreeningReminders);
router.get('/doctors/:doctorId/tasks', alertsController.getDoctorTasks);

module.exports = router;