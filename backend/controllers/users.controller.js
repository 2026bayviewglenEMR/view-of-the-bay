const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};