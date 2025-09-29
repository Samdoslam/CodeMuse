// models/chat.js
import mongoose from "mongoose";

const transcriptSchema = new mongoose.Schema({
  text: String,
  audioFile: String,
  timestamp: { type: Date, default: Date.now }
});

const codeSnippetSchema = new mongoose.Schema({
  language: String,
  code: String,
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  transcripts: [transcriptSchema],
  codeSnippets: [
    {
      language: String,
      code: String,
      timestamp: { type: Date, default: Date.now },
    }
  ]
}, { timestamps: true });


export default mongoose.model("Chat", chatSchema);
