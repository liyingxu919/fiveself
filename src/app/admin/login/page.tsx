"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) { router.push("/admin"); }
      else { setError("密码错误"); }
    } catch { setError("网络错误"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
      <div style={{ background: "#fff", padding: 48, borderRadius: 4, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <h1 style={{ textAlign: "center", fontWeight: 300, fontSize: 24, color: "#1a1a2e", margin: "0 0 4px" }}>FiveSelf</h1>
        <p style={{ textAlign: "center", color: "#666", fontSize: 13, margin: "0 0 32px" }}>命理师工作台</p>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          placeholder="输入管理密码"
          style={{ width: "100%", padding: "12px 16px", border: "1px solid #ddd", fontSize: 14, marginBottom: 12, boxSizing: "border-box", outline: "none" }} />
        {error && <p style={{ color: "#c0392b", fontSize: 12, margin: "0 0 8px" }}>{error}</p>}
        <button onClick={login} disabled={loading}
          style={{ width: "100%", padding: "12px", background: "#1a1a2e", color: "#fff", border: "none", fontSize: 14, cursor: "pointer", fontWeight: 500 }}>
          {loading ? "验证中..." : "进入工作台"}
        </button>
      </div>
    </div>
  );
}
