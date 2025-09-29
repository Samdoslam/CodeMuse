// src/App.jsx
import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage"; // you’ll create this
import CodeMuseApp from "./CodeMuseApp";
import Signup from "./components/Signup";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<CodeMuseApp />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}
