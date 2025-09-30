// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/users.js";

export const requireAuth = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token)
      return res.status(401).json({ error: "Unauthorized: No token" });

    // Verify token with the SAME secret used in sign()
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload._id).select(
      "-passwordHash -refreshTokens"
    );

    if (!user)
      return res.status(401).json({ error: "Unauthorized: User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
