const Template = require("../models/Templates.js");

const getTemplates = async(req, res) =>{
  try {
    const userId = req.user.id;

    const templates = await Template.find({$or: [
        { _id: userId },
        { isGlobal: true }
    ]});

    res.status(200).json(templates);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getTemplates }
