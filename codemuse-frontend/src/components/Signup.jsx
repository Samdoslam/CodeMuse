// src/components/SignupPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setTimeout(() => navigate("/login"), 2500);
      } else {
        setMsg(data.error || "Signup failed");
      }
    } catch (err) {
      setLoading(false);
      setMsg("Signup failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white px-6">
      <div className="bg-gray-800/70 p-8 rounded-2xl shadow-xl w-full max-w-sm text-center border border-white/10">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          {msg && <div className="text-sm text-gray-300">{msg}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 btn-gradient rounded-lg font-semibold mt-2"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-purple-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
