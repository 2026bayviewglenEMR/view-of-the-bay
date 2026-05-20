const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../verifyToken.js");
const bcrypt = require("bcrypt");
const User = require("../models/User.js");

const passwordSaltRounds = 10;

router.post('/signIn', async (req, res) => {
    const {username, password} = req.body;

    const user = await User.findOne({ username });
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
                role: user.role,
                patientId: user.patientId ?? null
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        const userToReturn = {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            id: user.id,
            email: user.email,
            role: user.role,
            patientId: user.patientId ?? null
        }
        return res.status(200).json({token, user: userToReturn});
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

router.post('/createUser', authenticateToken, async (req, res) => {
    const { username, password, firstName, lastName, email, role, patientId } = req.body;

    try {

    const hash = await bcrypt.hash(password, passwordSaltRounds);

    const newUser = new User({
        username,
        password: hash,
        role,
        firstName,
        lastName,
        email,
        patientId: patientId || null,
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