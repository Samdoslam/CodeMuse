// src/auth/Login.jsx
import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const r = await login(email, pw);
    if (!r.ok) setErr(r.error || "Login failed");
  };

  return (
    <form onSubmit={submit}>
      <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
      <input value={pw} onChange={(e)=>setPw(e.target.value)} type="password" placeholder="Password"/>
      <button type="submit">Login</button>
      {err && <div>{err}</div>}
    </form>
  );
}
