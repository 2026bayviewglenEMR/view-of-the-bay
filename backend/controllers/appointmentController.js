const Appointment = require("../models/Appointment.js");

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate("patientId") 
      .populate("doctorId")  
      .sort({ scheduledStartTime: 1 }); 

    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAppointments };