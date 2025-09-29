// routes/transcriptions.js
import express from "express";
import multer from "multer";
import FormData from "form-data";
import fetch from "node-fetch";
import Transcription from "../models/transcription.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) cb(null, true);
    else cb(new Error("Invalid file type, only audio allowed!"));
  },
});

// GET all transcriptions for a chat (public or protected based on your choice)
// Here: no auth to view by chatId — change to requireAuth if you want to restrict
router.get("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const transcriptions = await Transcription.find({ chatId });
    res.json(transcriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load transcriptions" });
  }
});

// POST audio transcription (protected)
router.post(
  "/local",
  requireAuth,
  upload.single("audio"),
  async (req, res) => {
    try {
      const { chatId } = req.body;

      if (!chatId) {
        return res.status(400).json({ error: "Missing chatId" });
      }

      if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

      console.log("📥 Received audio:", req.file.mimetype, req.file.size);

      // Send audio to Flask transcription service
      const formData = new FormData();
      formData.append("audio", req.file.buffer, {
        filename: "audio.wav",
        contentType: req.file.mimetype,
      });

      const response = await fetch("http://127.0.0.1:8000/transcribe", {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      });

      if (!response.ok)
        throw new Error(`Flask service error: ${response.statusText}`);

      const data = await response.json();
      const transcriptText = data.text || "";

      if (!transcriptText.trim())
        return res.status(200).json({ message: "No speech detected", text: "" });

      const newTranscript = new Transcription({
        userId: req.user._id,
        chatId,
        text: transcriptText,
        createdAt: new Date(),
      });

      await newTranscript.save();
      res.json(newTranscript);
    } catch (err) {
      console.error("❌ /local error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
