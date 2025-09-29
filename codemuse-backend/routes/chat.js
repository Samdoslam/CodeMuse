// routes/chat.js
import express from "express";
import Chat from "../models/chat.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// -----------------------------
// GET all chats for logged-in user
// -----------------------------
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const chats = await Chat.find({ userId: user._id });
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// POST create new chat
// -----------------------------
router.post("/", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const chat = await Chat.create({
      userId: user._id,
      name: req.body.name || "New Chat",
      codeSnippets: [],
    });
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// PUT update chat name
// -----------------------------
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const updated = await Chat.findOneAndUpdate(
      { _id: id, userId: user._id },
      { name: name.trim() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Chat not found" });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// DELETE chat
// -----------------------------
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const deleted = await Chat.findOneAndDelete({ _id: id, userId: user._id });
    if (!deleted) return res.status(404).json({ error: "Chat not found" });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// POST save code snippet to a chat
// -----------------------------
router.post("/:chatId/code", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { chatId } = req.params;
    const { code, language = "javascript" } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: "Code is required" });
    }

    const chat = await Chat.findOne({ _id: chatId, userId: user._id });
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    chat.codeSnippets.push({ code, language, timestamp: new Date() });
    await chat.save();

    res.json({
      success: true,
      lastCode: chat.codeSnippets[chat.codeSnippets.length - 1],
    });
  } catch (err) {
    console.error("❌ Error saving code:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// -----------------------------
// GET all code snippets for a chat
// -----------------------------
router.get("/:chatId/code", requireAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    res.json(chat.codeSnippets || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
