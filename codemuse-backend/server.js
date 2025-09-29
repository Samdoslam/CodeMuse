// server.js
import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import authRoutes from "./routes/auth.js";
import User from "./models/users.js";
import transcriptionRoutes from "./routes/transcriptions.js";
import chatRoutes from "./routes/chat.js";
import codeRoutes from "./routes/code.js";
import { requireAuth } from './middleware/auth.js';

const app = express();

// Allow frontend to access backend
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Setup multer (memory storage + filter)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only audio allowed!"));
    }
  },
});

// Test route: check multer is working (protected by your JWT middleware)
app.post(
  "/api/test-audio",
  requireAuth,
  upload.single("audio"),
  (req, res) => {
    console.log("📥 Received file:", req.file);
    if (!req.file) {
      return res.status(400).json({ error: "No audio uploaded" });
    }
    res.json({ message: "Audio received OK", file: req.file });
  }
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transcriptions", transcriptionRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/code", codeRoutes);


// Optional: keep a protected endpoint to list users (for admin/dev)
app.get("/api/users", requireAuth, async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash -refreshTokens -resetToken -verifyToken");
    res.json(users);
  } catch (err) {
    console.error("❌ GET /api/users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Connect to MongoDB
mongoose.connect(
  process.env.MONGO_URI ,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("✅ Connected to MongoDB"));

// Start server
app.listen(process.env.PORT || 5000, () =>
  console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`)
);
