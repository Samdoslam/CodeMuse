const API_URL = import.meta.env.VITE_API_URL;

// Create new chat
await fetch(`${API_URL}/api/chats`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "New Chat" })
});

// Upload audio and transcribe
const formData = new FormData();
formData.append("audio", file); // file = your recorded Blob

await fetch(`${API_URL}/api/audio/transcribe/${chatId}`, {
  method: "POST",
  body: formData
});
