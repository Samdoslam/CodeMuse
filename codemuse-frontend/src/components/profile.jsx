// src/components/Profile.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function Profile({ onClose }) {
  const { user, setUser, getToken } = useAuth(); // use getToken()
  const [username, setUsername] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const ref = useRef();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSave = async () => {
    setLoading(true);
    setMsg("");

    try {
      // ✅ Get a valid token from AuthProvider
      const token = await getToken();
      if (!token) throw new Error("No auth token found");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: username, password }),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setMsg("Profile updated successfully!");
        setPassword("");
      } else if (res.status === 401) {
        setMsg("Session expired. Please log in again.");
      } else {
        setMsg(data.error || "Failed to update profile");
      }
    } catch (err) {
      setLoading(false);
      setMsg(err.message || "Failed to update profile");
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* slide-in card */}
      <div
        ref={ref}
        className="relative mt-16 mr-4 w-80 p-6 bg-gray-800/90 rounded-2xl shadow-xl border border-white/10 transform transition-transform duration-300 ease-out translate-x-0"
      >
        <h2 className="text-xl font-bold mb-4">Profile</h2>

        <label className="block text-sm mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 mb-3 rounded-lg bg-gray-900 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          value={user?.email || ""}
          disabled
          className="w-full px-3 py-2 mb-3 rounded-lg bg-gray-700 border border-white/20 text-gray-400 cursor-not-allowed"
        />

        <label className="block text-sm mb-1">New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank to keep current"
          className="w-full px-3 py-2 mb-4 rounded-lg bg-gray-900 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {msg && <p className="text-sm text-green-400 mb-3">{msg}</p>}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
