const express = require('express')
const router = express.Router()

router.get('/patients/:patientId/alerts', async (req, res) => {
    const alerts = await Alert.find({
        patientId: req.params.patientId,
        dismissedAt: null
    });
    res.json(alerts);
});

modules.exports = router;

