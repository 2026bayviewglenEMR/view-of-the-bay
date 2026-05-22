const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided. "});
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        req.user = decodedUser;

        next();
    })
}

const requireRole = (requiredRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        if (!requiredRoles.includes(req.user.role.toLowerCase())) {
            return res.status(403).json({ 
                error: `Access denied. This action requires one of ${requiredRoles.join(", ")}.` 
            });
        }

        next();
    };
};

module.exports = { requireRole };

module.exports = { authenticateToken, requireRole };