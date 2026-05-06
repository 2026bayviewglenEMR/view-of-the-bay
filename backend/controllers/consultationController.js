const Consultation = require('../models/Consultation');

const getConsultationWorkspace = async (req, res) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        allowed: false,
        message: 'Access denied. No role information.'
      });
    }

    const role = req.user.role.toUpperCase();

    if (role === 'DOCTOR') {
      return res.status(200).json({
        allowed: true,
        role: 'DOCTOR',
        tabs: ['Symptoms', 'Vitals', 'Diagnose/Prescribe', 'Plan'],
        actionButton: 'Save & Complete Visit',
        integrations: {
          templates: true,
          documentExports: true
        }
      });
    }

    if (role === 'ADMINISTRATOR') {
      return res.status(403).json({
        allowed: false,
        role: 'ADMINISTRATOR',
        screen: 'LOCK_SCREEN',
        message: 'Access denied. Administrators are not allowed to perform clinical consultations.'
      });
    }

    return res.status(403).json({
      allowed: false,
      message: 'Access denied for this role.'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while loading consultation workspace.',
      error: error.message
    });
  }
};

const saveAndCompleteVisit = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const {
      patientId,
      symptoms,
      vitals,
      diagnosis,
      prescriptions,
      plan,
      templateIds,
      exportedDocuments
    } = req.body;

    if (!patientId) {
      return res.status(400).json({
        message: 'patientId is required.'
      });
    }

    const consultation = await Consultation.create({
      doctorId,
      patientId,
      symptoms: symptoms || [],
      vitals: vitals || {},
      diagnosis: diagnosis || '',
      prescriptions: prescriptions || [],
      plan: plan || '',
      templateIds: templateIds || [],
      exportedDocuments: exportedDocuments || [],
      status: 'COMPLETED'
    });

    return res.status(201).json({
      message: 'Visit saved and completed successfully.',
      consultation
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while saving consultation.',
      error: error.message
    });
  }
};

module.exports = {
  getConsultationWorkspace,
  saveAndCompleteVisit
};