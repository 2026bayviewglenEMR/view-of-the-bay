const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = decodedUser;

    next();
  });
};

// Accepts one or more roles: requireRole('admin') or requireRole('doctor', 'admin')
const requireRole = (...requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const userRole = req.user.role.toLowerCase();
    const allowed = requiredRoles.map(r => r.toLowerCase());

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${requiredRoles.join(' or ')}.`,
      });
    }

    next();
  };
};

module.exports = { authenticateToken, requireRole };
