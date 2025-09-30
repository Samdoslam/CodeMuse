// src/components/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    const success = await login(email, password);

    setLoading(false);

    if (success) {
      navigate("/app"); // redirect to main app
    } else {
      setErr("Invalid email or password");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white px-6">
      <div className="bg-gray-800/70 p-8 rounded-2xl shadow-xl w-full max-w-sm text-center border border-white/10">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">
          Login to CodeMuse
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          {err && <div className="text-red-400 text-sm">{err}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 btn-gradient rounded-lg font-semibold mt-2"
          >
            {loading ? "Logging in..." : "Continue"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-400">
          Don’t have an account?{" "}
          <a href="/signup" className="text-purple-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
