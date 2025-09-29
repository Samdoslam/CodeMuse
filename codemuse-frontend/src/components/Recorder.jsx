import { useState, useRef } from "react";

export default function Recorder({ chatId }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const file = new File([blob], "recording.webm");

      // send to backend
      const API_URL = import.meta.env.VITE_API_URL;
      const formData = new FormData();
      formData.append("audio", file);

      const res = await fetch(`${API_URL}/api/audio/transcribe/${chatId}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Transcription result:", data);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div>
      {!recording ? (
        <button
          onClick={startRecording}
          className="px-4 py-2 rounded bg-purple-600 hover:opacity-90"
        >
          🎤 Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="px-4 py-2 rounded bg-red-600 hover:opacity-90"
        >
          ⏹ Stop Recording
        </button>
      )}
    </div>
  );
}
