// src/components/MicButton.jsx
import { motion } from "framer-motion";
import { useState } from "react";

function IconMic({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="text-white">
      <path
        d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"
        fill="currentColor"
      />
      <path
        d="M5 11a7 7 0 0 0 14 0"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconStop({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="text-white">
      <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
    </svg>
  );
}

// Helper to get JWT from localStorage
const getToken = () => localStorage.getItem("jwt");

export default function MicButton({ isRecording, onClick, onStop, chatId }) {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        if (onStop) onStop(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
    } catch (err) {
      console.error("❌ Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) mediaRecorder.stop();
  };

  const handleClick = () => {
    if (isRecording) stopRecording();
    else startRecording();
    if (onClick) onClick();
  };

  return (
    <div className="relative">
      {isRecording && (
        <span className="absolute -inset-3 rounded-full bg-fuchsia-500/30 blur-xl animate-pulse" />
      )}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleClick}
        aria-pressed={isRecording}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center border border-white/10 ${
          isRecording
            ? "bg-gradient-to-br from-rose-500 to-fuchsia-600 shadow-[0_0_30px_rgba(168,85,247,0.6)]"
            : "bg-gradient-to-br from-indigo-600 to-fuchsia-600 shadow-[0_0_30px_rgba(168,85,247,0.6)]"
        }`}
      >
        {isRecording ? <IconStop /> : <IconMic />}
      </motion.button>
    </div>
  );
}
