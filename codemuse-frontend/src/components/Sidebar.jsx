import { useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiPlus,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiTrash2,
} from "react-icons/fi";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  chats,
  setChats,
  selectedChatId,
  setSelectedChatId,
  onNewChat,
  user, // pass in user from parent
  setUser, // function to update user on logout
  openSignIn, // your custom login modal trigger
  logout,
}) {
  const navigate = useNavigate();
  const [editingChatId, setEditingChatId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showHistory, setShowHistory] = useState(true);

  const startEdit = (chat) => {
    if (!chat?._id) return;
    setEditingChatId(chat._id);
    setEditValue(chat.name || "");
  };

  const saveEdit = async (id) => {
    if (!id) return;
    const base = (editValue || "Untitled").trim();
    let name = base;
    let n = 1;
    while (chats.some((c) => c.name === name && c._id !== id)) {
      name = `${base} (${n++})`;
    }

    try {
      const token = localStorage.getItem("token"); // JWT from custom auth
      const res = await fetch(`http://localhost:5000/api/chats/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to update chat");
      const updated = await res.json();
      setChats(chats.map((c) => (c._id === id ? updated : c)));
    } catch (err) {
      console.error("❌ Failed to update chat:", err);
    }

    setEditingChatId(null);
    setEditValue("");
  };

  const deleteChat = async (id) => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/chats/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete chat");

      setChats(chats.filter((c) => c._id !== id));
      if (selectedChatId === id) setSelectedChatId(chats[0]?._id || null);
    } catch (err) {
      console.error("❌ Failed to delete chat:", err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    logout(); // ✅ now defined
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } h-screen bg-[#0a0f1c] text-white flex flex-col transition-all duration-300`}
    >
      {/* Top Section */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-4 border-b border-white/10">
          {!isCollapsed && (
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate("/")}>
              Code Muse
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded hover:bg-gray-800 transition"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        <div className="px-2 mt-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-white/10 transition ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiClock />
              {!isCollapsed && <span>History</span>}
            </div>
            {!isCollapsed &&
              (showHistory ? <FiChevronUp /> : <FiChevronDown />)}
          </button>
        </div>

        {/* Chat list */}
        <div
          className={`flex-1 overflow-auto transition-[max-height] duration-500 ease-in-out custom-scroll ${
            showHistory ? "max-h-[100%]" : "max-h-0"
          } mt-2 px-2 space-y-2`}
        >
          {chats.map((chat, index) => {
            if (!chat || !chat._id) return null; // 🔥 Prevents crashes

            return (
              <div
                key={chat._id || index}
                className={`group flex items-center justify-between px-2 py-2 rounded hover:bg-white/10 transition cursor-pointer ${
                  selectedChatId === chat._id ? "bg-white/10" : ""
                }`}
                onClick={() => setSelectedChatId(chat._id)}
              >
                {editingChatId === chat._id ? (
                  <input
                    className="w-full bg-transparent border-b border-purple-500 focus:outline-none text-sm"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit(chat._id)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(chat._id)}
                    autoFocus
                  />
                ) : (
                  <>
                    {!isCollapsed && (
                      <span
                        className={`truncate text-sm ${
                          selectedChatId === chat._id ? "text-purple-400" : ""
                        }`}
                      >
                        {chat.name || "unnamed chat"}
                      </span>
                    )}
                    {!isCollapsed && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(chat);
                          }}
                          className="text-gray-400 hover:text-white transition"
                          title="Rename"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat._id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* New Chat */}
        {!isCollapsed && (
          <div className="p-2">
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center gap-2 py-2 rounded bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition text-sm"
            >
              <FiPlus /> New Chat
            </button>
          </div>
        )}
      </div>

      {/* Bottom Auth Section */}
      <div className="p-3 border-t border-white/10 flex items-center justify-between w-full mt-auto">
        {user ? (
          !isCollapsed ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm truncate max-w-[100px]">
                  {user.name || user.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-red-500 transition"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 w-full">
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-red-500 transition"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )
        ) : (
          <div className="flex justify-center w-full">
            <button
              onClick={openSignIn}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-sm hover:opacity-90 transition w-full"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
