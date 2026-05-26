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
    from: `"View of the Bay Clinic" <${process.env.EMAIL}>`,
    to: toEmail,
    subject: 'Appointment Reminder - View of the Bay',
    text: `Hi ${patientName},\n\nThis is a reminder that you have an appointment tomorrow with ${doctorName} at ${appointmentTime.toLocaleString()}.\n\nPlease arrive 10 minutes early.\n\nView of the Bay EMR`
  });
}

async function sendHourReminder(toEmail, patientName, doctorName, appointmentTime) {
  await transporter.sendMail({
    from: `"View of the Bay Clinic" <${process.env.EMAIL}>`,
    to: toEmail,
    subject: 'Your Appointment is in 1 Hour - View of the Bay',
    text: `Hi ${patientName},\n\nJust a heads up — your appointment with ${doctorName} is in approximately 1 hour at ${appointmentTime.toLocaleString()}.\n\nPlease arrive 10 minutes early.\n\nView of the Bay EMR`
  });
}

module.exports = { sendAppointmentReminder, sendHourReminder };