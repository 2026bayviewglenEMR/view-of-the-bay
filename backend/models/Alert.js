const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    },
    type: {
        type: String,
        enum: ['patient', 'screening', 'task'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String
    },
    dueDate: {
        type: Date
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    },
    dismissedAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);