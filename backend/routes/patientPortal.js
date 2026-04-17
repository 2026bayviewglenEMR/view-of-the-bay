//still need to make changes
//------------------------


// const express = require('express');
// const router = express.Router();

// const Patient = require('../models/Patient');
// const { authenticateToken } = require('../verifyToken');

// const requireAuth = authenticateToken;

// // Best-effort patient guard for current project state
// const requirePatient = (req, res, next) => {
//   authenticateToken(req, res, (err) => {
//     if (err) return res.status(401).json({ message: 'Unauthorized' });

//     if (!req.user) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }

//     // Current project note:
//     // Your User model does not yet include a "patient" role.
//     // This guard allows access if role is "patient" in the future,
//     // but for now you may comment this out during testing if needed.
//     if (req.user.role && req.user.role.toLowerCase() !== 'patient') {
//       return res.status(403).json({ message: 'Access denied. Patients only.' });
//     }

//     next();
//   });
// };

// // Best-effort way to resolve the current patient's record
// // Assumes req.user.id might match Patient._id for now.
// const getCurrentPatient = async (req) => {
//   const userId = req.user?.id || req.user?._id;

//   if (!userId) return null;

//   const patient = await Patient.findById(userId);
//   return patient;
// };

// // GET /api/patient-portal/dashboard
// router.get('/dashboard', requireAuth, requirePatient, async (req, res) => {
//   try {
//     const patient = await getCurrentPatient(req);

//     if (!patient) {
//       return res.status(404).json({
//         message: 'Patient record not found for logged-in user.'
//       });
//     }

//     res.json({
//       message: 'Patient portal dashboard loaded successfully.',
//       patient: {
//         id: patient._id,
//         fullName: `${patient.firstName} ${patient.lastName}`,
//         photoUrl: patient.photoUrl,
//       },
//       summary: {
//         allergies: patient.executiveSummary?.allergies || [],
//         activeMedications: patient.executiveSummary?.activeMedications || [],
//       },
//       alerts: [
//         'Welcome to your patient portal.',
//         'You can view your profile, allergies, and medications here.'
//       ]
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to load dashboard.', error: error.message });
//   }
// });

// // GET /api/patient-portal/profile
// router.get('/profile', requireAuth, requirePatient, async (req, res) => {
//   try {
//     const patient = await getCurrentPatient(req);

//     if (!patient) {
//       return res.status(404).json({ message: 'Patient record not found.' });
//     }

//     res.json({
//       id: patient._id,
//       firstName: patient.firstName,
//       lastName: patient.lastName,
//       dateOfBirth: patient.dateOfBirth,
//       photoUrl: patient.photoUrl,
//       demographics: patient.demographics
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to load profile.', error: error.message });
//   }
// });

// // PUT /api/patient-portal/profile
// // Allow patient to update limited contact info only
// router.put('/profile', requireAuth, requirePatient, async (req, res) => {
//   try {
//     const patient = await getCurrentPatient(req);

//     if (!patient) {
//       return res.status(404).json({ message: 'Patient record not found.' });
//     }

//     const { phone, address, emergencyContact } = req.body;

//     if (phone !== undefined) patient.demographics.phone = phone;
//     if (address !== undefined) patient.demographics.address = address;
//     if (emergencyContact !== undefined) {
//       patient.demographics.emergencyContact = emergencyContact;
//     }

//     await patient.save();

//     res.json({
//       message: 'Profile updated successfully.',
//       demographics: patient.demographics
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to update profile.', error: error.message });
//   }
// });

// // GET /api/patient-portal/records/summary
// router.get('/records/summary', requireAuth, requirePatient, async (req, res) => {
//   try {
//     const patient = await getCurrentPatient(req);

//     if (!patient) {
//       return res.status(404).json({ message: 'Patient record not found.' });
//     }

//     res.json({
//       fullName: `${patient.firstName} ${patient.lastName}`,
//       dateOfBirth: patient.dateOfBirth,
//       allergies: patient.executiveSummary?.allergies || [],
//       activeMedications: patient.executiveSummary?.activeMedications || []
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to load record summary.', error: error.message });
//   }
// });

// // GET /api/patient-portal/allergies
// router.get('/allergies', requireAuth, requirePatient, async (req, res) => {
//   try {
//     const patient = await getCurrentPatient(req);

//     if (!patient) {
//       return res.status(404).json({ message: 'Patient record not found.' });
//     }

//     res.json({
//       allergies: patient.executiveSummary?.allergies || []
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to load allergies.', error: error.message });
//   }
// });

// // GET /api/patient-portal/medications
// router.get('/medications', requireAuth, requirePatient, async (req, res) => {
//   try {
//     const patient = await getCurrentPatient(req);

//     if (!patient) {
//       return res.status(404).json({ message: 'Patient record not found.' });
//     }

//     res.json({
//       activeMedications: patient.executiveSummary?.activeMedications || []
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to load medications.', error: error.message });
//   }
// });

// // Placeholder routes for future expansion

// // GET /api/patient-portal/appointments
// router.get('/appointments', requireAuth, requirePatient, async (req, res) => {
//   try {
//     res.json({
//       message: 'Appointments route ready. Connect this to your scheduling model/controller later.',
//       appointments: []
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to load appointments.', error: error.message });
//   }
// });

// // POST /api/patient-portal/appointments/request
// router.post('/appointments/request', requireAuth, requirePatient, async (req, res) => {
//   try {
//     const { preferredDate, preferredTime, reason } = req.body;

//     res.status(201).json({
//       message: 'Appointment request submitted successfully.',
//       request: {
//         preferredDate,
//         preferredTime,
//         reason
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to submit appointment request.', error: error.message });
//   }
// });

// // GET /api/patient-portal/labs
// router.get('/labs', requireAuth, requirePatient, async (req, res) => {
//   try {
//     res.json({
//       message: 'Labs route ready. Connect this to your labs model/controller later.',
//       labResults: []
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to load labs.', error: error.message });
//   }
// });

// // GET /api/patient-portal/messages
// router.get('/messages', requireAuth, requirePatient, async (req, res) => {
//   try {
//     res.json({
//       message: 'Messages route ready. Connect this to your communications model/controller later.',
//       messages: []
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to load messages.', error: error.message });
//   }
// });

// // POST /api/patient-portal/messages
// router.post('/messages', requireAuth, requirePatient, async (req, res) => {
//   try {
//     const { subject, body } = req.body;

//     res.status(201).json({
//       message: 'Message sent successfully.',
//       data: {
//         subject,
//         body
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to send message.', error: error.message });
//   }
// });

// module.exports = router;