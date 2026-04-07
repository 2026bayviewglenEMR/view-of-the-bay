const express = require('express');
const router = express.Router();

// get all the lab results for a patient 
router.get('/:patientId/results', (req, res) => {
    const { patientId } = req.params;
    // TODO: fetch from DB
    res.json({ patientId, results: [] });
});

// add a lab result for a patient
router.post('/:patientId/results', (req, res) => {
    const { patientId } = req.params;
    const result = req.body;
    // TODO: save to DB
    res.json({ message: 'Lab result added', patientId, result });
});

// notify patient of their result
router.post('/:patientId/results/:resultId/notify', (req, res) => {
    const { patientId, resultId } = req.params;
    // TODO: send notification
    res.json({ message: 'Patient notified', patientId, resultId });
});

// link a result to a patient's timeline
router.post('/:patientId/results/:resultId/link', (req, res) => {
    const { patientId, resultId } = req.params;
    // TODO: link to timeline in DB
    res.json({ message: 'Result linked to timeline', patientId, resultId });
});

// export the lab request as PDF
router.get('/:patientId/export-pdf', (req, res) => {
    const { patientId } = req.params;
    // TODO: generate PDF
    res.json({ message: 'PDF export triggered', patientId });
});

module.exports = router;