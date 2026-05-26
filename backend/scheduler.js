const cron = require('node-cron');
const Appointment = require('./models/Appointment');
const Patient = require('./models/Patient');
const User = require('./models/User');
const { sendAppointmentReminder, sendHourReminder } = require('./mailer');

function start() {
  // runs every day at 9am
  cron.schedule('0 9 * * *', async () => {
    console.log('Running appointment reminder job...');

    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    try {
      const appointments = await Appointment.find({
        scheduledStartTime: { $gte: tomorrowStart, $lte: tomorrowEnd },
        status: { $ne: 'cancelled' }
      });

      for (const appt of appointments) {
        try {
          const patient = await Patient.findById(appt.patientId);
          const doctor = await User.findById(appt.doctorId);

          if (!patient || !doctor) continue;

          // get email from the linked user account
          const patientUser = await User.findOne({ patientId: appt.patientId })
          const email = patientUser?.email

          if (!email) {
            console.log(`No email found for patient ${patient.firstName} ${patient.lastName}`)
            continue
          }

          const patientName = `${patient.firstName} ${patient.lastName}`;
          const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;

          await sendAppointmentReminder(email, patientName, doctorName, appt.scheduledStartTime);
          console.log(`Reminder sent to ${email} for appointment on ${appt.scheduledStartTime}`);
        } catch (err) {
          console.error(`Failed to send reminder for appointment ${appt._id}:`, err);
        }
      }
    } catch (err) {
      console.error('Scheduler error:', err);
    }
  });

  // runs every hour on the hour — sends a reminder for appointments starting in ~1 hour
  // checks a 55–65 min window so nothing gets missed or double-sent
  cron.schedule('0 * * * *', async () => {
    console.log('Running 1-hour appointment reminder job...');

    const now = new Date();
    const windowStart = new Date(now.getTime() + 55 * 60 * 1000);
    const windowEnd   = new Date(now.getTime() + 65 * 60 * 1000);

    try {
      const appointments = await Appointment.find({
        scheduledStartTime: { $gte: windowStart, $lte: windowEnd },
        status: { $ne: 'cancelled' }
      });

      for (const appt of appointments) {
        try {
          const patient = await Patient.findById(appt.patientId);
          const doctor  = await User.findById(appt.doctorId);
          if (!patient || !doctor) continue;

          const patientUser = await User.findOne({ patientId: appt.patientId });
          const email = patientUser?.email;

          if (!email) {
            console.log(`No email for patient ${patient.firstName} ${patient.lastName}`);
            continue;
          }

          const patientName = `${patient.firstName} ${patient.lastName}`;
          const doctorName  = `Dr. ${doctor.firstName} ${doctor.lastName}`;

          await sendHourReminder(email, patientName, doctorName, appt.scheduledStartTime);
          console.log(`1-hour reminder sent to ${email}`);
        } catch (err) {
          console.error(`Failed to send 1-hour reminder for appointment ${appt._id}:`, err);
        }
      }
    } catch (err) {
      console.error('1-hour scheduler error:', err);
    }
  });

  console.log('Appointment reminder scheduler started');
}

module.exports = { start };