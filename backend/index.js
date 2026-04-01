// server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 1. Import the route files
const authRoutes = require('./routes/authRoutes');

// 2. Mount the routes to their base URLs
// If a request starts with '/api/patients', send it to Student 2's file
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/clinical', clinicalRoutes); 
app.use('/api/scheduling', schedulingRoutes);

// Fallback for 404s
app.use((req, res) => {
    res.status(404).json({ error: "Route not found." });
});

app.listen(PORT, () => {
    console.log(`EMR Backend running on http://localhost:${PORT}`);
});