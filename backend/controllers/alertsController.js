const alertsService = require('../services/alertsService');

const getPatientAlerts = async (req, res) => {
    try {
        const alerts = await alertsService.getPatientAlerts(req.params.patientId);
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createAlert = async (req, res) => {
    try {
        const alert = await alertsService.createAlert(req.body);
        res.status(201).json(alert);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const dismissAlert = async (req, res) => {
    try {
        const alert = await alertsService.dismissAlert(req.params.id);
        res.json(alert);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const completeTask = async (req, res) => {
    try {
        const alert = await alertsService.completeTask(req.params.id);
        res.json(alert);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getScreeningReminders = async (req, res) => {
    try {
        const alerts = await alertsService.getScreeningReminders();
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDoctorTasks = async (req, res) => {
    try {
        const alerts = await alertsService.getDoctorTasks(req.params.doctorId);
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getPatientAlerts,
    createAlert,
    dismissAlert,
    completeTask,
    getScreeningReminders,
    getDoctorTasks
};