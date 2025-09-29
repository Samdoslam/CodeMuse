// src/auth/Verify.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function Verify() {
  const [search] = useSearchParams();
  const token = search.get("token");
  const email = search.get("email");
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    if (!token || !email) return setStatus("invalid");
    (async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });
      if (res.ok) setStatus("ok");
      else setStatus("error");
    })();
  }, [token, email]);

  return <div>{status}</div>;
}
