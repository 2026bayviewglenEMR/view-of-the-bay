const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../verifyToken.js");

const ROLES = {
    DOCTOR: "D",
    ADMINISTRATOR: "A",
}

//TODO: connect to actual users database
const u = (username, password, role) => {
    return {username, password, role};
}

const users = [
    u("Armaan", "password", ROLES.DOCTOR),
    u("Dlo", "password", ROLES.ADMINISTRATOR),
]

router.post('/signIn', (req, res) => {
    const {username, password} = req.body;

    const user = users.find(u => u.username===username);
    if (user && user.password===password) {
        const token = jwt.sign(
            user,
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        return res.status(200).json(token);
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
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