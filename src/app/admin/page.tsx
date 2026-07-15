"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ReportSummary {
  reportId: string;
  customerName: string;
  customerEmail: string;
  birthDate: string;
  status: string;
  generatedAt: string;
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending_review" | "approved">("pending_review");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/reports", { signal: AbortSignal.timeout(10000) })
      .then(r => r.json())
      .then(d => { if (d?.reports) setReports(d.reports); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? reports : reports.filter(r => (r.status || "pending_review") === filter);

  const pending = reports.filter(r => (r.status || "pending_review") === "pending_review").length;
  const approved = reports.filter(r => r.status === "approved").length;

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#666" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontWeight: 600, fontSize: 28, color: "#1a1a2e", margin: 0 }}>命理师工作台</h1>
          <p style={{ color: "#666", fontSize: 14, margin: "4px 0 0" }}>审核并编辑客户报告，确认后发送</p>
        </div>
        <button onClick={() => { fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: "logout" }) }); router.push("/admin/login"); }}
          style={{ padding: "8px 20px", border: "1px solid #ddd", background: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
          退出
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "全部报告", count: reports.length, color: "#1a1a2e" },
          { label: "待审核", count: pending, color: "#e67e22" },
          { label: "已发送", count: approved, color: "#27ae60" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", padding: 20, borderRadius: 4, border: `2px solid ${s.color}20` }}>
            <p style={{ color: "#666", fontSize: 12, margin: "0 0 4px" }}>{s.label}</p>
            <p style={{ fontSize: 32, fontWeight: 600, color: s.color, margin: 0 }}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["pending_review", "approved", "all"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: "8px 20px", border: filter === f ? "2px solid #1a1a2e" : "1px solid #ddd",
              background: filter === f ? "#1a1a2e" : "#fff", color: filter === f ? "#fff" : "#333",
              borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 500
            }}>
            {f === "pending_review" ? `待审核 (${pending})` : f === "approved" ? `已发送 (${approved})` : `全部 (${reports.length})`}
          </button>
        ))}
      </div>

      {/* Report list */}
      <div style={{ background: "#fff", borderRadius: 4, border: "1px solid #eee" }}>
        {filtered.length === 0 ? (
          <p style={{ padding: 40, textAlign: "center", color: "#999" }}>暂无报告</p>
        ) : (
          filtered.map((r, i) => (
            <div key={r.reportId} onClick={() => router.push(`/admin/report/${r.reportId}`)}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 24px", borderBottom: i < filtered.length - 1 ? "1px solid #f0f0f0" : "none",
                cursor: "pointer", transition: "background 0.2s"
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
              <div>
                <p style={{ fontWeight: 500, fontSize: 14, color: "#1a1a2e", margin: "0 0 2px" }}>
                  {r.customerName || "未命名"} <span style={{ color: "#999", fontWeight: 400, fontSize: 12 }}>{r.reportId}</span>
                </p>
                <p style={{ color: "#666", fontSize: 12, margin: 0 }}>{r.birthDate} · {r.customerEmail}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  padding: "4px 12px", borderRadius: 12, fontSize: 11, fontWeight: 500,
                  background: (r.status || "pending_review") === "approved" ? "#27ae6020" : "#e67e2220",
                  color: (r.status || "pending_review") === "approved" ? "#27ae60" : "#e67e22"
                }}>
                  {(r.status || "pending_review") === "approved" ? "已发送" : "待审核"}
                </span>
                <span style={{ color: "#999" }}>→</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
