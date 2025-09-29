import mongoose from "mongoose";
const TranscriptionSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  userId: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
export default mongoose.model("transcription", TranscriptionSchema);
