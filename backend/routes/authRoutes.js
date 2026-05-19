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
                role: user.role
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
            role: user.role
        }
        return res.status(200).json({token, user: userToReturn});
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

router.post('/updatePassword', authenticateToken, async (req, res) => {
    try {
        // req.user comes from your authenticateToken middleware
        const userId = req.user.id; 
        const { newPassword } = req.body;

        // 1. Validation check
        if (!newPassword) {
            return res.status(400).json({ message: "New password is required" });
        }

        // 2. Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, passwordSaltRounds);

        // 3. Update the user in the database
        // We use findByIdAndUpdate to target the specific user by their ID
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { password: hashedNewPassword },
            { new: true } // This option returns the updated document
        );

        // 4. Safety check: Did the user actually exist in the database?
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Error updating password:", error);
        return res.status(500).json({ message: "An error occurred" });
    }
});

module.exports = router;