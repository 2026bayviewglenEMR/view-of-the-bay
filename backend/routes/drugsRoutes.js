const express = require('express');
const router = express.Router();
const { authenticateToken } = require("../verifyToken.js");
const Drug = require("../models/Drugs.js");

router.get("/:id1/:id2", authenticateToken, async (req, res) => {
    try {
        const { id1, id2 } = req.params;

        const drug1 = await Drug.findOne({
            $or: [
                { id: id1 },
                { name: new RegExp(`^${id1}$`, "i") }
            ]
        });

        const drug2 = await Drug.findOne({
            $or: [
                { id: id2 },
                { name: new RegExp(`^${id2}$`, "i") }
            ]
        });

        if (!drug1 || !drug2) {
            return res.status(404).json({ message: "Drugs not found" });
        }

        const compareId = drug2.id || id2;

        const interactions = (drug1.drug_interactions || []).filter(
            d => d.drug_id === compareId
        );

        return res.status(200).json(interactions);
    } catch (e) {
        console.log("Drug interaction error:", e);
        return res.status(500).json({ message: "Error checking interactions" });
    }
});

router.get('/:query', authenticateToken, async (req, res) => {
    try {
        const { query } = req.params;
        console.log("query", JSON.stringify(query));
        const drugs = await Drug.find(
            { name: { $regex: `^${query}`, $options: 'i' } },
            { drug_interactions: 0, description: 0 }
        );
        res.status(200).json(drugs);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Error getting all drugs" });
    }
});

module.exports = router;