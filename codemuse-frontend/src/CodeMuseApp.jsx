// src/CodeMuseApp.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MicButton from "./components/MicButton";
import Waveform from "./components/Waveform";
import { useAuth } from "./auth/AuthProvider";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const GEMINI_KEY = "AIzaSyBo9-uVRvjE5IzQD5IgzJxekZeUTAofEQA";

export default function CodeMuseApp() {
  const { user, loading, getToken } = useAuth();
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ------------------ Auth & Token ------------------
  useEffect(() => {
    const fetchToken = async () => {
      const t = await getToken();
      if (t) {
        localStorage.setItem("token", t);
        setToken(t);
      }
    };
    fetchToken();
  }, [getToken]);

  useEffect(() => {
    if (!loading && (!user || !token)) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, token, navigate]);

  // ------------------ Chat state ------------------
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const selectedChat = useMemo(
    () => chats.find((c) => c._id === selectedChatId) || null,
    [chats, selectedChatId]
  );

  // ------------------ Recording ------------------
  const [isRecording, setIsRecording] = useState(false);

  // ------------------ Code ------------------
  const [chatCodes, setChatCodes] = useState({});
  const [codeEditing, setCodeEditing] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // ------------------ Transcriptions ------------------
  const [transcriptions, setTranscriptions] = useState([]);

  // ------------------ Fetch user chats ------------------
  useEffect(() => {
    if (!token) return;
    const fetchChats = async () => {
      try {
        const res = await fetch(`${API}/api/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load chats");
        const data = await res.json();
        setChats(Array.isArray(data) ? data : []);
        if (!selectedChatId && data.length > 0) setSelectedChatId(data[0]._id);
      } catch (err) {
        console.error("❌ Failed to fetch chats:", err);
      }
    };
    fetchChats();
  }, [token, selectedChatId]);

  // ------------------ Fetch transcriptions ------------------
  useEffect(() => {
    if (!selectedChatId || !token) return;
    const fetchTranscriptions = async () => {
      try {
        const res = await fetch(`${API}/api/transcriptions/${selectedChatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load transcriptions");
        const data = await res.json();
        setTranscriptions(data);
      } catch (err) {
        console.error("❌ Failed to fetch transcriptions:", err);
      }
    };
    fetchTranscriptions();
  }, [selectedChatId, token]);

  // ------------------ Fetch last code ------------------
  useEffect(() => {
    if (!selectedChatId || !token) return;
    const fetchLastCode = async () => {
      try {
        const res = await fetch(`${API}/api/chats/${selectedChatId}/code`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch code");
        const data = await res.json();
        const lastCode = data?.[data.length - 1]?.code || "";
        setChatCodes((prev) => ({ ...prev, [selectedChatId]: lastCode }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchLastCode();
  }, [selectedChatId, token]);

  // ------------------ Create new chat ------------------
  const createNewChat = async () => {
    if (!token) return null;
    try {
      const res = await fetch(`${API}/api/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: `Chat ${chats.length + 1}` }),
      });
      if (!res.ok) throw new Error("Failed to create chat");
      const data = await res.json();
      const newChat = data._id ? data : data.chat;
      setChats((prev) => [...prev, newChat]);
      setSelectedChatId(newChat._id);
      return newChat._id;
    } catch (err) {
      console.error("❌ Failed to create chat:", err);
      return null;
    }
  };

  // ------------------ Recording handlers ------------------
  const ensureChatBeforeRecording = async () => {
    if (selectedChatId) return selectedChatId;
    return await createNewChat();
  };

  const onMicClick = async () => {
    if (!isRecording) {
      const id = await ensureChatBeforeRecording();
      if (!id) return;
    }
    setIsRecording((prev) => !prev);
  };

  const onMicStop = async (blob) => {
    if (!blob || !selectedChatId || !token) return;
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.wav");
      formData.append("chatId", selectedChatId);

      const res = await fetch(`${API}/api/transcriptions/local`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      setTranscriptions((prev) => [...prev, saved]);
    } catch (err) {
      console.error("❌ Upload error:", err);
    }
  };

  // ------------------ Save transcription ------------------
  const saveTranscription = async (transcription) => {
    if (!token || !selectedChatId) return;
    try {
      if (transcription._id) {
        // Update existing
        const res = await fetch(
          `${API}/api/transcriptions/${transcription._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text: transcription.text }),
          }
        );
        if (!res.ok) throw new Error("Failed to update transcription");
      } else {
        // New transcription (text-only, no audio)
        const formData = new FormData();
        formData.append("text", transcription.text);
        formData.append("chatId", selectedChatId);

        const res = await fetch(`${API}/api/transcriptions/local`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to save transcription");
        const saved = await res.json();
        setTranscriptions((prev) =>
          prev.map((t) => (t === transcription ? { ...t, _id: saved._id } : t))
        );
      }
    } catch (err) {
      console.error("❌ Failed to save transcription:", err);
    }
  };

  // ------------------ Code handlers ------------------
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(chatCodes[selectedChatId] || "");
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 1200);
    } catch {}
  };

  const saveCode = async (code) => {
    if (!selectedChatId || !token) return;
    try {
      const res = await fetch(`${API}/api/chats/${selectedChatId}/code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error("Failed to save code");
    } catch (err) {
      console.error("❌ Failed to save code:", err);
    }
  };

  // ------------------ Gemini code generation ------------------
  const generateCode = async () => {
    if (!selectedChatId || transcriptions.length === 0) return;
    const last = transcriptions[transcriptions.length - 1];
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: last.text }] }],
          }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const code =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "// No code returned";
      setChatCodes((prev) => ({ ...prev, [selectedChatId]: code }));
      await saveCode(code);
      setCodeEditing(false);
    } catch (err) {
      console.error("❌ Gemini code generation error:", err);
    }
  };

  if (loading || !user) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar
        chats={chats}
        selectedChatId={selectedChatId}
        setChats={setChats}
        isCollapsed={isCollapsed} // pass collapsed state
        setIsCollapsed={setIsCollapsed}
        setSelectedChatId={setSelectedChatId}
        onNewChat={createNewChat}
        user={user}
        logout={() => {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
        }}
      />

      <main className="flex-1 h-screen overflow-y-auto flex flex-col custom-scroll">
        {/* Code Panel */}
        <section className="p-4">
          <div className="bg-[#0b1020]/80 border border-white/10 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-lg font-semibold">Generated Code</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition text-sm"
                >
                  {codeCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={async () => {
                    await saveCode(chatCodes[selectedChatId] || "");
                    setCodeEditing(false);
                  }}
                  className="px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition text-sm"
                >
                  Save
                </button>
              </div>
            </div>
            <div className="p-4">
              {!codeEditing ? (
                <pre className="bg-black/70 rounded-lg p-4 text-green-400 overflow-auto max-h-64 custom-scroll">
                  {chatCodes[selectedChatId] || "// Code will appear here"}
                </pre>
              ) : (
                <textarea
                  className="w-full h-64 bg-black/70 rounded-lg p-4 text-green-400 outline-none resize-none overflow-y-auto custom-scroll"
                  value={chatCodes[selectedChatId] || ""}
                  onChange={(e) =>
                    setChatCodes((prev) => ({
                      ...prev,
                      [selectedChatId]: e.target.value,
                    }))
                  }
                />
              )}
            </div>
          </div>
        </section>

        {/* Mic + Waveform */}
        <section className="px-4">
          <div className="mx-auto max-w-4xl w-full bg-[#0b1020]/80 border border-white/10 rounded-2xl shadow-lg px-4 py-5 flex items-center gap-4">
            <MicButton
              isRecording={isRecording}
              onClick={onMicClick}
              onStop={onMicStop}
              chatId={selectedChatId}
            />
            <Waveform isRecording={isRecording} />
          </div>
        </section>

        {/* Transcription Panel */}
        <section className="p-4 pb-6">
          <div className="bg-[#0b1020]/80 border border-white/10 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-lg font-semibold">
                {selectedChat ? selectedChat.name : "Transcription"}
              </h2>
              <button
                onClick={generateCode}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition text-sm"
              >
                <span>Code</span>
              </button>
            </div>
            <div className="p-4">
              <div className="bg-black/50 rounded-lg p-4 text-gray-200 overflow-y-auto max-h-[40vh] min-h-[20vh] space-y-3 custom-scroll">
                {transcriptions.length === 0 ? (
                  <div className="text-gray-400 italic">
                    {selectedChatId
                      ? "No transcriptions yet. Hit the mic to add one."
                      : "Select or create a chat to begin."}
                  </div>
                ) : (
                  transcriptions.map((t) => (
                    <div
                      key={t._id || t.timestamp || Math.random().toString(36)}
                      className="bg-black/40 rounded-md p-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-sm text-gray-400">
                          {new Date(
                            t.timestamp || t.createdAt
                          ).toLocaleString()}
                        </div>
                        {!t.isEditing && (
                          <button
                            onClick={() =>
                              setTranscriptions((prev) =>
                                prev.map((x) =>
                                  x._id === t._id
                                    ? { ...x, isEditing: true }
                                    : x
                                )
                              )
                            }
                            className="text-gray-400 hover:text-white text-xs ml-2"
                            title="Edit transcription"
                          >
                            ✏️
                          </button>
                        )}
                      </div>
                      {!t.isEditing ? (
                        <div className="whitespace-pre-wrap mt-1">{t.text}</div>
                      ) : (
                        <textarea
                          className="w-full bg-black/50 rounded p-2 mt-1 text-gray-200 custom-scroll"
                          value={t.text}
                          onChange={(e) =>
                            setTranscriptions((prev) =>
                              prev.map((x) =>
                                x._id === t._id
                                  ? { ...x, text: e.target.value }
                                  : x
                              )
                            )
                          }
                          onBlur={() => saveTranscription(t)}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
