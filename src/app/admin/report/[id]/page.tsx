"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import type { ReportContent } from "@/lib/report-generator";

export default function AdminReportEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/admin/report/${id}`, { signal: AbortSignal.timeout(10000) })
      .then(r => r.json())
      .then(d => {
        if (d?.report) {
          const doc = d.report;
          const content = typeof doc.content === "string" ? JSON.parse(doc.content) : doc.content;
          setReport({ ...doc, content });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const updateField = (path: string, value: string) => {
    setEditedFields(prev => ({ ...prev, [path]: value }));
    // Update nested content in-place
    const keys = path.split(".");
    const newContent = JSON.parse(JSON.stringify(report.content));
    let obj = newContent;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    setReport({ ...report, content: newContent });
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/approve-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: id,
        email: null, // Don't send yet, just save
        name: report?.customerName,
        editedContent: JSON.stringify(report.content),
      }),
    });
    setSaving(false);
    alert("已保存");
  };

  const approveAndSend = async () => {
    if (!confirm("确认审核通过并发送邮件给客户？")) return;
    setSending(true);
    const res = await fetch("/api/admin/approve-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: id,
        email: report?.customerEmail,
        name: report?.customerName,
        editedContent: JSON.stringify(report.content),
      }),
    });
    const data = await res.json();
    setSending(false);
    if (data.success) {
      alert(data.emailSent ? "已发送邮件给客户！" : "已审核通过（邮件发送失败，请检查 Resend 配置）");
      router.push("/admin");
    } else {
      alert("操作失败");
    }
  };

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#666" }}>加载中...</div>;
  if (!report) return <div style={{ padding: 60, textAlign: "center", color: "#666" }}>报告未找到</div>;

  const c = report.content as ReportContent;
  const dm = c?.dayMaster;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#F5F1E9", minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{ background: "#1a1a2e", color: "#fff", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: 16 }}>{report.customerName || "未命名"}</span>
          <span style={{ color: "#999", marginLeft: 12, fontSize: 13 }}>{id}</span>
          <span style={{ color: "#999", marginLeft: 8, fontSize: 12 }}>{report.customerEmail}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={save} disabled={saving}
            style={{ padding: "8px 20px", border: "1px solid #555", background: "transparent", color: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
            {saving ? "保存中..." : "保存修改"}
          </button>
          <button onClick={approveAndSend} disabled={sending}
            style={{ padding: "8px 20px", border: "none", background: "#27ae60", color: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {sending ? "发送中..." : "审核通过 · 发送客户"}
          </button>
          <button onClick={() => router.push("/admin")}
            style={{ padding: "8px 16px", border: "1px solid #555", background: "transparent", color: "#999", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
            ← 返回
          </button>
        </div>
      </div>

      {/* Editor */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
        {/* Day Master */}
        <Section title="日主 Day Master">
          <FieldRow label="天干 (EN)" value={dm?.ganEn || ""} onChange={v => updateField("dayMaster.ganEn", v)} />
          <FieldRow label="天干 (中文)" value={dm?.gan || ""} onChange={v => updateField("dayMaster.gan", v)} />
          <FieldRow label="五行 (EN)" value={dm?.wuxingEn || ""} onChange={v => updateField("dayMaster.wuxingEn", v)} />
          <FieldRow label="五行 (中文)" value={dm?.wuxing || ""} onChange={v => updateField("dayMaster.wuxing", v)} />
        </Section>

        {/* Element Profile */}
        <Section title="五行分析 Element Analysis">
          <FieldRow label="五行概述" value={c?.elementAnalysis?.profile || ""} onChange={v => updateField("elementAnalysis.profile", v)} textarea />
          <FieldRow label="主导元素 (EN)" value={c?.elementAnalysis?.dominant?.nameEn || ""} onChange={v => updateField("elementAnalysis.dominant.nameEn", v)} />
          <FieldRow label="主导元素 (中文)" value={c?.elementAnalysis?.dominant?.name || ""} onChange={v => updateField("elementAnalysis.dominant.name", v)} />
          <FieldRow label="主导元素描述 (EN)" value={c?.elementAnalysis?.dominant?.descEn || ""} onChange={v => updateField("elementAnalysis.dominant.descEn", v)} textarea />
          <FieldRow label="主导元素描述 (中文)" value={c?.elementAnalysis?.dominant?.desc || ""} onChange={v => updateField("elementAnalysis.dominant.desc", v)} textarea />
          <FieldRow label="次要元素 (EN)" value={c?.elementAnalysis?.secondary?.nameEn || ""} onChange={v => updateField("elementAnalysis.secondary.nameEn", v)} />
          <FieldRow label="次要元素描述 (EN)" value={c?.elementAnalysis?.secondary?.descEn || ""} onChange={v => updateField("elementAnalysis.secondary.descEn", v)} textarea />
          <FieldRow label="次要元素描述 (中文)" value={c?.elementAnalysis?.secondary?.desc || ""} onChange={v => updateField("elementAnalysis.secondary.desc", v)} textarea />
        </Section>

        {/* Lifestyle Tips */}
        <Section title="生活指引 Lifestyle Tips">
          {c?.lifestyleTips?.map((t: any, i: number) => (
            <div key={i} style={{ marginBottom: 16, padding: "12px 16px", background: "#fff", borderRadius: 4, border: "1px solid #eee" }}>
              <FieldRow label={`建议 ${i + 1} 标题 (EN)`} value={t.titleEn || ""} onChange={v => updateField(`lifestyleTips.${i}.titleEn`, v)} />
              <FieldRow label={`建议 ${i + 1} 标题 (中文)`} value={t.title || ""} onChange={v => updateField(`lifestyleTips.${i}.title`, v)} />
              <FieldRow label={`建议 ${i + 1} 内容 (EN)`} value={t.tipEn || ""} onChange={v => updateField(`lifestyleTips.${i}.tipEn`, v)} textarea />
              <FieldRow label={`建议 ${i + 1} 内容 (中文)`} value={t.tip || ""} onChange={v => updateField(`lifestyleTips.${i}.tip`, v)} textarea />
            </div>
          ))}
        </Section>

        {/* Color Palette */}
        <Section title="色彩体系 Color Palette">
          {c?.colorPalette?.map((col: any, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, padding: "8px 12px", background: "#fff", borderRadius: 4, border: "1px solid #eee" }}>
              <div style={{ width: 32, height: 32, background: col.hex, borderRadius: 4 }} />
              <input value={col.hex} onChange={e => updateField(`colorPalette.${i}.hex`, e.target.value)}
                style={{ width: 90, padding: "6px 8px", border: "1px solid #ddd", fontSize: 13, borderRadius: 3 }} />
              <input value={col.name} onChange={e => updateField(`colorPalette.${i}.name`, e.target.value)}
                style={{ flex: 1, padding: "6px 8px", border: "1px solid #ddd", fontSize: 13, borderRadius: 3 }} />
              <input value={col.use} onChange={e => updateField(`colorPalette.${i}.use`, e.target.value)}
                style={{ flex: 1, padding: "6px 8px", border: "1px solid #ddd", fontSize: 13, borderRadius: 3 }} />
            </div>
          ))}
        </Section>

        {/* Space Tips */}
        <Section title="空间建议 Space Tips">
          {c?.spaceTips?.map((s: any, i: number) => (
            <div key={i} style={{ marginBottom: 12, padding: "12px 16px", background: "#fff", borderRadius: 4, border: "1px solid #eee" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={s.areaEn || ""} onChange={e => updateField(`spaceTips.${i}.areaEn`, e.target.value)} placeholder="区域 (EN)" style={{ flex: 1, padding: "6px 8px", border: "1px solid #ddd", fontSize: 13, borderRadius: 3 }} />
                <input value={s.area || ""} onChange={e => updateField(`spaceTips.${i}.area`, e.target.value)} placeholder="区域 (中文)" style={{ flex: 1, padding: "6px 8px", border: "1px solid #ddd", fontSize: 13, borderRadius: 3 }} />
                <input value={s.color || ""} onChange={e => updateField(`spaceTips.${i}.color`, e.target.value)} placeholder="颜色" style={{ width: 80, padding: "6px 8px", border: "1px solid #ddd", fontSize: 13, borderRadius: 3 }} />
              </div>
              <FieldRow label="建议 (EN)" value={s.adviceEn || ""} onChange={v => updateField(`spaceTips.${i}.adviceEn`, v)} textarea />
              <FieldRow label="建议 (中文)" value={s.advice || ""} onChange={v => updateField(`spaceTips.${i}.advice`, v)} textarea />
            </div>
          ))}
        </Section>

        {/* Totem */}
        <Section title="图腾 Totem">
          <FieldRow label="图腾描述 (EN)" value={c?.totemDescription?.en || ""} onChange={v => updateField("totemDescription.en", v)} textarea />
          <FieldRow label="图腾描述 (中文)" value={c?.totemDescription?.cn || ""} onChange={v => updateField("totemDescription.cn", v)} textarea />
        </Section>
      </div>

      {/* Bottom bar */}
      <div style={{ position: "sticky", bottom: 0, background: "#1a1a2e", color: "#fff", padding: "16px 24px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button onClick={save} disabled={saving} style={{ padding: "10px 24px", border: "1px solid #555", background: "transparent", color: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 14 }}>{saving ? "保存中..." : "保存修改"}</button>
        <button onClick={approveAndSend} disabled={sending} style={{ padding: "10px 24px", border: "none", background: "#27ae60", color: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>{sending ? "发送中..." : "审核通过 · 发送客户"}</button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", margin: "0 0 12px", paddingBottom: 8, borderBottom: "2px solid #1a1a2e" }}>{title}</h2>
      {children}
    </div>
  );
}

function FieldRow({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ fontSize: 11, color: "#999", margin: "0 0 4px" }}>{label}</p>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
          style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", fontSize: 13, borderRadius: 3, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)}
          style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", fontSize: 13, borderRadius: 3, boxSizing: "border-box" }} />
      )}
    </div>
  );
}
