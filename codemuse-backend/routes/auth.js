// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/users.js";

const router = express.Router();
const jwtToken = process.env.JWT_SECRET;
// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // create user
    const newUser = new User({
      name,
      email,
      password: hashed,
    });

    await newUser.save();

    // generate token
    const token = jwt.sign(
      { sub: newUser._id, email: newUser.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  // SIGN JWT properly
const token = jwt.sign(
  { id: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

 res.json({
  success: true,
  user: { id: user.id, name: user.name, email: user.email },
  token
});

});

export default router;
