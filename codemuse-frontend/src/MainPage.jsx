import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function MainPage({ user, setUser }) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user && user.token) {
      // User is logged in, go to app
      navigate("/app");
    } else {
      // Not logged in → redirect to login page
      navigate("/login");
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white text-center px-6">
      <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
        CodeMuse
      </h1>
      <p className="text-lg max-w-2xl mb-10 opacity-80">
        Your AI-powered coding companion. Speak, transcribe, and generate code
        effortlessly with CodeMuse.
      </p>

      <button
        onClick={handleGetStarted}
        className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-medium hover:opacity-90 transition"
      >
        Get Started <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
