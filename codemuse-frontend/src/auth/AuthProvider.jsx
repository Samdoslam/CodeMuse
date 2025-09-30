// src/auth/AuthProvider.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Load user & token from localStorage on mount
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(savedUser);
      setToken(savedToken);
    }

    setLoading(false);
  }, []);

  // ---------------- LOGIN ----------------
  const login = async (email, password) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Login failed");
      }

      const data = await res.json();
      setUser(data.user);
      setToken(data.token);

      // Save in localStorage for future sessions
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // ---------------- GET TOKEN ----------------
  const getToken = async () => {
  if (token) return token;
  const t = await fetchNewTokenSomehow();
  setToken(t);
  return t;
};

  // ---------------- AUTH FETCH ----------------
  // Helper for making authenticated requests
  const authFetch = async (url, options = {}) => {
    if (!token) throw new Error("No token available");
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };
    const res = await fetch(url, { ...options, headers });
    return res;
  };

  return (
    <AuthContext.Provider
      value={{ user,setUser, loading, login, logout, getToken,token, authFetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
