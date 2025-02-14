const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token || req.header("Authorization")?.split(" ")[1]; // Check cookies first, then header

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Attach decoded user data to `req.user`
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;
