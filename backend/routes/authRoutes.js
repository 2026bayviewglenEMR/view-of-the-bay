const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../verifyToken.js");
const bcrypt = require("bcrypt");
const User = require("../models/User.js");

const passwordSaltRounds = 10;

const ROLES = {
    DOCTOR: "doctor",
    ADMINISTRATOR: "admin",
}

//TODO: connect to actual users database
const u = (username, password, role) => {
    return {username, password, role};
}

router.post('/signIn', async (req, res) => {
    const {username, password} = req.body;

    const user = await User.findOne({ username });
    console.log(user);
    if (!user) return res.status(401).json({ message: "Invalid username or password" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (user && isMatch) {
        const token = jwt.sign(
            {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        return res.status(200).json(token);
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

router.post('/createUser', authenticateToken, async (req, res) => {
    const { username, password, firstName, lastName, email, role } = req.body;

    try {

    const hash = await bcrypt.hash(password, passwordSaltRounds);

    const newUser = new User({
        username,
        password: hash,
        role,
        firstName,
        lastName,
        email,
    });
    const savedUser = await newUser.save();
    return res.status(201).json(savedUser)
    } catch (e) {
        console.error(e);
        return res.status(500).json("An error occured");
    }
});

router.post('/updatePassword', authenticateToken, (req, res) => {
    const user = req.user;
    const { newPassword } = req.body;
    console.log("new Password", newPassword);
    console.log("u", user);
    //TODO: implement
    return res.status(200).json({ message: "UNIMPLEMENTED" })
});

module.exports = router;