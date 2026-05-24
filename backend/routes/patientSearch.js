const express = require('express')
const router = express.Router()
const Patient = require('../models/Patient')
const Appointment = require('../models/Appointment')
const { authenticateToken, requireRole } = require('../middleware/auth')

// GET /api/patients/search?q=john
// Returns matching patients with their next upcoming appointment pre-filled
router.get('/search', authenticateToken, requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.trim().length < 2) return res.json([])

    const patients = await Patient.find({
      $or: [
        { firstName: { $regex: q.trim(), $options: 'i' } },
        { lastName:  { $regex: q.trim(), $options: 'i' } },
      ]
    }).limit(8)

    const results = await Promise.all(patients.map(async (p) => {
      // Find their next upcoming appointment
      const appt = await Appointment.findOne({
        patientId: p._id,
        scheduledStartTime: { $gte: new Date() }
      })
        .populate('doctorId', 'firstName lastName')
        .sort({ scheduledStartTime: 1 })

      return {
        id: p._id,
        firstName: p.firstName,
        lastName: p.lastName,
        appointmentId: appt?._id || null,
        doctor: appt ? `Dr. ${appt.doctorId.firstName} ${appt.doctorId.lastName}` : null,
        appointmentTime: appt
          ? new Date(appt.scheduledStartTime).toLocaleTimeString('en-US', {
              hour: 'numeric', minute: '2-digit', hour12: false
            })
          : null,
      }
    }))

    res.json(results)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
