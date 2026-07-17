"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

export default function AdminReportEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/report/${id}`, { signal: AbortSignal.timeout(10000) })
      .then(r => r.json()).then(d => {
        if (d?.report) {
          const c = typeof d.report.content === "string" ? JSON.parse(d.report.content) : d.report.content;
          setReport({ ...d.report, content: c });
        }
      }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const updateField = (path: string, value: string) => {
    const keys = path.split(".");
    const newContent = JSON.parse(JSON.stringify(report.content));
    let obj = newContent;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    setReport({ ...report, content: newContent });
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/approve-send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reportId: id, email: null, editedContent: JSON.stringify(report.content) }) });
    setSaving(false); alert("已保存");
  };

  const approveAndSend = async () => {
    if (!confirm("确认审核通过并发送邮件给客户？")) return;
    setSending(true);
    const res = await fetch("/api/admin/approve-send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reportId: id, email: report?.customerEmail, name: report?.customerName, editedContent: JSON.stringify(report.content) }) });
    setSending(false);
    const data = await res.json();
    alert(data.success ? (data.emailSent ? "已发送！" : "已审核但邮件发送失败") : "操作失败");
    if (data.success) router.push("/admin");
  };

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#666", fontFamily: "system-ui, sans-serif" }}>加载中...</div>;
  if (!report) return <div style={{ padding: 60, textAlign: "center", color: "#666" }}>报告未找到</div>;

  const c = report.content;
  const ms = c?.mingShu || {};
  const dm = c?.dayMaster;
  const dmC = ({"木":"#7A9A7B","火":"#C0806E","土":"#B8956A","金":"#8C827A","水":"#6A8AA0"} as any)[dm?.wuxing] || "#B8956A";
  const s = c?.shiShen || {};
  const cg = c?.cangGan || {};
  const ss = c?.shenSha || [];
  const gj = c?.geJu || {};
  const dy = c?.dayun || [];
  const ys = c?.disuitianshu || {};

  return (
    <div style={{ fontFamily: "Georgia,'Noto Serif SC',serif", background: "#f5efe6", minHeight: "100vh", color: "#3c342e" }}>
      {/* Top bar */}
      <div style={{ background: "#2c2824", color: "#fff", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{report.customerName || "未命名"}</span>
          <span style={{ color: "#999", fontSize: 12 }}>{id}</span>
          <span style={{ color: "#999", fontSize: 12 }}>{report.customerEmail}</span>
          <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: 11, background: (report.status || "pending_review") === "approved" ? "#27ae6020" : "#e67e2220", color: (report.status || "pending_review") === "approved" ? "#27ae60" : "#e67e22" }}>{(report.status || "pending_review") === "approved" ? "已发送" : "待审核"}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowEdit(!showEdit)} style={{ padding: "8px 16px", border: "1px solid #555", background: "transparent", color: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>{showEdit ? "隐藏编辑" : "编辑字段"}</button>
          <button onClick={save} disabled={saving} style={{ padding: "8px 16px", border: "1px solid #555", background: "transparent", color: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>{saving ? "保存中..." : "保存"}</button>
          <button onClick={approveAndSend} disabled={sending} style={{ padding: "8px 18px", border: "none", background: "#27ae60", color: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{sending ? "发送中..." : "审核通过·发送"}</button>
          <button onClick={() => router.push("/admin")} style={{ padding: "8px 14px", border: "1px solid #555", background: "transparent", color: "#999", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>← 返回</button>
        </div>
      </div>

      {/* ═══ 命书预览 ═══ */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
        {/* Header */}
        <div style={{ background: "#faf6f0", border: "1px solid #e5dcd1", padding: 32, marginBottom: 24, textAlign: "center" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "#8c8076", margin: "0 0 16px" }}>Five Elements · Life Blueprint</p>
          <h1 style={{ fontSize: 36, fontWeight: 300, margin: "0 0 8px" }}>五行命书</h1>
          <p style={{ fontSize: 15, color: "#8c8076", margin: "0 0 16px" }}>{report.customerName} · {c?.birthDate} · 日主{dm?.gan}({dm?.wuxing})</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            {ss.map((s2: string, i: number) => <span key={i} style={{ padding: "3px 12px", border: `1px solid ${dmC}`, color: dmC, fontSize: 10, borderRadius: 2 }}>{s2}</span>)}
          </div>
        </div>

        {/* 八字四柱 */}
        <Section title="八字排盘">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 12 }}>
            {[{l:"年柱",v:c?.baziDisplay?.year,e:c?.baziDisplay?.yearEn},{l:"月柱",v:c?.baziDisplay?.month,e:c?.baziDisplay?.monthEn},{l:"日柱",v:c?.baziDisplay?.day,e:c?.baziDisplay?.dayEn},{l:"时柱",v:c?.baziDisplay?.hour,e:c?.baziDisplay?.hourEn}].map((p,i)=><div key={i} style={{background:"#fff",border:"1px solid #e5dcd1",padding:"16px 12px",textAlign:"center"}}><p style={{fontSize:10,color:"#8c8076",margin:"0 0 6px"}}>{p.l}</p><p style={{fontSize:22,fontWeight:300,margin:"0 0 2px"}}>{p.v}</p><p style={{fontSize:11,color:"#8c8076",margin:0}}>{p.e}</p></div>)}
          </div>
          {showEdit && <EditFields prefix="baziDisplay" obj={c?.baziDisplay} update={updateField} fields={["year","month","day","hour","yearEn","monthEn","dayEn","hourEn"]} />}
        </Section>

        {/* 排盘正文 */}
        {ms.paiPan && <Section title="排盘详解"><P>{ms.paiPan}</P></Section>}

        {/* 日主 */}
        {ms.riZhu && <Section title="日主分析"><P>{ms.riZhu}</P></Section>}

        {/* 格局 */}
        {gj.name && <Section title={`格局：${gj.name}`}><P>{gj.analysis}</P></Section>}

        {/* 十神 */}
        {s.explanation && <Section title="十神"><P>{s.explanation}</P></Section>}

        {/* 藏干 */}
        {cg.analysis && <Section title="藏干"><P>{cg.analysis}</P></Section>}

        {/* 用神 */}
        {ys.analysis && <Section title="用神"><P>{ys.analysis}{ys.yongshenEn && <><br/><span style={{fontSize:12,color:"#8c8076"}}>{ys.analysisEn}</span></>}</P></Section>}

        {/* 性格/事业/财运/感情/健康 */}
        {ms.personality && <Section title="性格分析"><P>{ms.personality}</P></Section>}
        {ms.career && <Section title="事业方向"><P>{ms.career}</P></Section>}
        {ms.wealth && <Section title="财运分析"><P>{ms.wealth}</P></Section>}
        {ms.relationships && <Section title="感情婚姻"><P>{ms.relationships}</P></Section>}
        {ms.health && <Section title="健康提示"><P>{ms.health}</P></Section>}

        {/* 流年 */}
        {ms.fortune2026 && <Section title="2026 丙午流年"><P>{ms.fortune2026}</P></Section>}

        {/* 大运 */}
        {dy.length > 0 && <Section title="大运流年"><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>{dy.map((d2:any,i:number)=><div key={i} style={{background:"#fff",border:"1px solid #e5dcd1",padding:"14px 16px"}}><p style={{fontSize:13,fontWeight:600,margin:"0 0 2px"}}>{d2.age} {d2.ganzhi} · 纳音{d2.nayin}</p><p style={{fontSize:12,lineHeight:1.8,color:"#5c4a3e",margin:0}}>{d2.analysis}</p></div>)}</div></Section>}

        {/* 建议 */}
        {ms.advice && <Section title="综合建议"><P style={{whiteSpace:"pre-line"}}>{ms.advice}</P></Section>}

        {/* 可编辑字段(折叠) */}
        {showEdit && (
          <div style={{ marginTop: 48, padding: 24, background: "#fff", border: "1px solid #e5dcd1" }}>
            <h2 style={{ fontSize: 18, margin: "0 0 16px" }}>编辑字段</h2>
            <EditSection title="日主" obj={dm} update={updateField} fields={["gan","wuxing"]} prefix="dayMaster" />
            <EditSection title="排盘" obj={ms} update={updateField} fields={["paiPan","riZhu","personality","career","wealth","relationships","health","fortune2026","advice"]} prefix="mingShu" textarea />
            <EditSection title="用神" obj={ys} update={updateField} fields={["yongshen","analysis"]} prefix="disuitianshu" />
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: any) {
  return <div style={{ marginBottom: 24, background: "#fff", border: "1px solid #e5dcd1", padding: 24 }}>
    <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 12px", color: "#2c2824", borderBottom: "2px solid #B8956A", paddingBottom: 8 }}>{title}</h2>
    {children}
  </div>;
}

function P({ children, style }: any) {
  return <p style={{ fontSize: 14, lineHeight: 2, color: "#5c4a3e", margin: 0, ...style }}>{children}</p>;
}

function EditFields({ obj, update, fields, prefix }: any) {
  if (!obj) return null;
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
    {fields.map((f: string) => (
      <div key={f}><label style={{ fontSize: 11, color: "#999" }}>{f}</label>
        <input value={obj[f] || ""} onChange={e => update(`${prefix}.${f}`, e.target.value)} style={{ width: "100%", padding: "6px 10px", border: "1px solid #ddd", fontSize: 12, borderRadius: 3, boxSizing: "border-box" }} />
      </div>
    ))}
  </div>;
}

function EditSection({ title, obj, update, fields, prefix, textarea }: any) {
  if (!obj) return null;
  return <div style={{ marginBottom: 20 }}>
    <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>{title}</h3>
    <div style={{ display: "grid", gap: 10 }}>
      {fields.map((f: string) => (
        <div key={f}>
          <label style={{ fontSize: 11, color: "#999", display: "block", marginBottom: 3 }}>{f}</label>
          {textarea ? (
            <textarea value={obj[f] || ""} onChange={e => update(`${prefix}.${f}`, e.target.value)} rows={4} style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", fontSize: 12, borderRadius: 3, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
          ) : (
            <input value={obj[f] || ""} onChange={e => update(`${prefix}.${f}`, e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", fontSize: 13, borderRadius: 3, boxSizing: "border-box" }} />
          )}
        </div>
      ))}
    </div>
  </div>;
}
