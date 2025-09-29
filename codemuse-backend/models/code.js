import mongoose from "mongoose";

const CodeSnippetSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("CodeSnippet", CodeSnippetSchema);
