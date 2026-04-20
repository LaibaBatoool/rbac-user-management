const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    // Check for token in headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to request (without password)
            // NOTE: role is a String, not a reference, so no .populate() needed
            req.user = await User.findById(decoded.id).select("-password");

            next();
        } catch (error) {
            console.log("Token error:", error.message);
            return res.status(401).json({ message: "Not authorized, token failed", error: error.message });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

module.exports = { protect };
