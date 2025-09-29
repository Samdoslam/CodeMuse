// routes/code.js
import express from "express";
import fetch from "node-fetch";
import { requireAuth } from "../middleware/auth.js";
import CodeSnippet from "../models/code.js";

const router = express.Router();

const GEMINI_KEY = process.env.GEMINI_KEY;

// Save or update code snippet
router.post("/:chatId", requireAuth, async (req, res) => {
  const { code, language } = req.body;
  try {
    let snippet = await CodeSnippet.findOne({ chatId: req.params.chatId });
    if (snippet) {
      snippet.code = code;
      snippet.language = language || snippet.language;
      snippet.createdAt = new Date();
      await snippet.save();
    } else {
      snippet = await CodeSnippet.create({
        chatId: req.params.chatId,
        code,
        language,
      });
    }
    res.json(snippet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get code snippet for a chat
router.get("/:chatId", requireAuth, async (req, res) => {
  try {
    const snippet = await CodeSnippet.findOne({ chatId: req.params.chatId });
    res.json(snippet || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Gemini proxy (open to authenticated users; remove requireAuth if you want public)
router.post("/gemini", requireAuth, async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Gemini proxy error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
