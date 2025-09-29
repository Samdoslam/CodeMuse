// src/components/LandingPage.jsx
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
      {/* background layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.25),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)]" />
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>

      {/* content */}
      <div className="relative z-10 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 text-transparent bg-clip-text">
          Code Muse
        </h1>
        <p className="mt-3 text-gray-300">Your AI-powered code companion</p>
        <button
          className="mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-80 transition"
          onClick={() => navigate("/login")}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
