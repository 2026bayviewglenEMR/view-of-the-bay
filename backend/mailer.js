const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD
  }
});

async function sendAppointmentReminder(toEmail, patientName, doctorName, appointmentTime) {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: toEmail,
    subject: 'Appointment Reminder - View of the Bay',
    text: `Hi ${patientName},\n\nThis is a reminder that you have an appointment tomorrow with ${doctorName} at ${appointmentTime.toLocaleString()}.\n\nPlease arrive 10 minutes early.\n\nView of the Bay EMR`
  });
}

module.exports = { sendAppointmentReminder };