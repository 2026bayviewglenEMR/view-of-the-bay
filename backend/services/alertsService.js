const Alert = require('../models/Alert');

const getPatientAlerts = async (patientId) => {
    return Alert.find({
        patientId,
        dismissedAt: null
    });
};

const createAlert = async (alertData) => {
    const alert = new Alert(alertData);
    return alert.save();
};

const dismissAlert = async (id) => {
    return Alert.findByIdAndUpdate(
        id,
        { dismissedAt: new Date() },
        { new: true }
    );
};

const completeTask = async (id) => {
    return Alert.findByIdAndUpdate(
        id,
        { 
            completedAt: new Date(),
            status: 'completed'
        },
        { new: true }
    );
};

const getScreeningReminders = async () => {
    const today = new Date();
    return Alert.find({
        type: 'screening',
        dueDate: { $lte: today },
        dismissedAt: null
    });
};

const getDoctorTasks = async (doctorId) => {
    return Alert.find({
        assignedTo: doctorId,
        status: { $ne: 'completed' }
    });
};

module.exports = {
    getPatientAlerts,
    createAlert,
    dismissAlert,
    completeTask,
    getScreeningReminders,
    getDoctorTasks
};