// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const { authenticateToken, requireRole } = require("./verifyToken.js");

const User = require("./models/User.js");
const scheduler = require('./scheduler'); // 👈 ADD THIS

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI.trim().replace(/['"]+/g, '');;
console.log(`MURI: [${MONGO_URI}]`);
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

mongoose.connection.once("open", () => {
  console.log("DB NAME:", mongoose.connection.name);
  console.log("HOST:", mongoose.connection.host);
  scheduler.start(); // 👈 ADD THIS
});

//middleware to log requests
app.use((req, res, next) => {
    if (!req.url.startsWith("/api/messages/conversations")){
        const time = new Date().toLocaleTimeString();
        console.log('New request --------------------')
        console.log(`[${time}] ${req.method} request to ${req.url}`);
        console.log('Auth', JSON.stringify(req.headers?.authorization, null, 2));
        console.log('Body:', JSON.stringify(req.body, null, 2));
        console.log('--------------------------------')
    }
    next();
});

// 1. Import the route files
const authRoutes = require('./routes/authRoutes');
const labsRouter = require('./routes/labs');
const commsRouter = require('./routes/comms');
//const fileUploadsRouter = require('./routes/fileUploads');
const alertsRouter = require('./routes/alerts');
const consultationsRouter = require('./routes/consultations');
const consultationTemplatesRouter = require('./routes/consultationTemplates');
const tasksRouter = require('./routes/tasks');
const patientPortalRoutes = require("./routes/patientPortal");
const drugsRoutes = require("./routes/drugsRoutes")
const waitingRoomRouter = require('./routes/waitingRoom');
const templatesRoutes = require('./routes/templatesRoutes.js');
const calendarRouter = require('./routes/calendar');
const patientRoutes = require("./routes/patients.routes");
const userRoutes = require("./routes/users.routes");
const messageRoutes = require('./routes/messageRoutes');
const appointmentRoutes = require('./routes/appointments');
const dashboardRouter = require('./routes/dashboard');
const patientSearchRouter = require('./routes/patientSearch');

// 2. Mount the routes to their base URLs
app.use('/api/auth', authRoutes);
app.use("/api/patients", patientRoutes);
app.use('/api/labs', labsRouter);
app.use('/api/comms', commsRouter);
//app.use('/api/fileUploads', fileUploadsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/consultations', consultationsRouter);
app.use('/api/consultation-templates', consultationTemplatesRouter);
app.use('/api/tasks', tasksRouter);
app.use("/api/patient-portal", patientPortalRoutes);
app.use("/api/drugs", drugsRoutes)
app.use('/api/waiting-room', waitingRoomRouter);
app.use('/api/templates', templatesRoutes);
app.use("/api/users", userRoutes);
app.use('/api/calendar', calendarRouter);
app.use('/api/messages', messageRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/patient-search', patientSearchRouter);

app.get('/api/doctors', authenticateToken, async (req, res) => {
    const doctors = await User.find({ role: 'doctor' });
    return res.status(200).json(doctors);
});

app.get('/api', (req, res) => {
    return res.status(200).json({ message: "Server is live"})
});

app.get('/api/doctorOnly', authenticateToken, requireRole(['doctor']), (req, res) => {
    return res.status(200).json({ message: "Doctor Only"})
});

app.get('/api/adminOnly', authenticateToken, requireRole(['admin']), (req, res) => {
    return res.status(200).json({ message: "Admin Only"})
});

app.get('/api/patientOnly', authenticateToken, requireRole(['patient']), (req, res) => {
    return res.status(200).json({ message: "Patient Only"})
})

// Fallback for 404s
app.use((req, res) => {
    res.status(404).json({ error: "Route not found." });
});

app.listen(PORT, () => {
    console.log(`EMR Backend running on http://localhost:${PORT}`);
});