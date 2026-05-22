const express = require('express');
const router = express.Router();
const { authenticateToken } = require("../verifyToken.js");
const Drug = require("../models/Drugs.js");

router.get("/:id1/:id2", async (req, res) => {
    const { id1, id2 } = req.params;
    const drug1 = await Drug.findOne({ id: id1 });
    const drug2 = await Drug.findOne({ id: id2 });

    if (!drug1 || !drug2) {
        res.status(404).json({ message: "Drugs not found" });
    }
    
    const interactions = drug1.drug_interactions.filter(d => d.drug_id===drug2.id);
    res.status(200).json(interactions);
});

module.exports = router;