const express = require('express');
const router = express.Router();
const { authenticateToken } = require("../verifyToken.js");
const Drug = require("../models/Drugs.js");

router.get("/:id1/:id2", authenticateToken, async (req, res) => {
    const { id1, id2 } = req.params;
    const drug1 = await Drug.findOne({ id: id1 });
    const drug2 = await Drug.findOne({ id: id2 });

    if (!drug1 || !drug2) {
        res.status(404).json({ message: "Drugs not found" });
    }
    
    const interactions = drug1.drug_interactions.filter(d => d.drug_id===drug2.id);
    res.status(200).json(interactions);
});

router.get('/:query', authenticateToken, async (req, res) => {
    try{
        const { query } = req.params;
        console.log("query", JSON.stringify(query));
        const drugs = await Drug.find(
            { name: { $regex: `^${query}`, $options: 'i' } },
            { drug_interactions: 0, _id: 0, description: 0 }
        );
        res.status(200).json(drugs);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Error getting all drugs" });
    }
});

module.exports = router;