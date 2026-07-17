"use client";

import { useEffect, useState, use } from "react";

interface BaziData {
  reportId: string; customerName: string; birthDate: string; birthTime?: string;
  dayMaster: { gan: string; ganEn: string; wuxing: string; wuxingEn: string; color: string };
  baziDisplay: { year: string; month: string; day: string; hour: string; yearEn: string; monthEn: string; dayEn: string; hourEn: string };
  wuxingDistribution: Array<{ name: string; nameEn: string; count: number; percentage: number; color: string; barWidth: number }>;
  elementAnalysis: { profile: string; dominant: any; secondary: any; missing: any[] };
  colorPalette: Array<{ hex: string; name: string; use: string }>;
  lifestyleTips: Array<{ title: string; titleEn: string; tip: string; tipEn: string }>;
  spaceTips: Array<{ area: string; areaEn: string; color: string; advice: string; adviceEn: string }>;
  totemDescription: { cn: string; en: string; elements: string[] };
  shengXiao?: { name: string; nameEn: string };
  dayun?: Array<{ age: string; ganzhi: string; nayin: string; wuxing: string; desc: string }>;
  disuitianshu?: { yongshen: string; yongshenEn: string; analysis: string; analysisEn: string; grade: string };
  mangpai?: { pastTen: string; pastTenEn: string; currentTen: string; currentTenEn: string; flow: string };
  lucky?: { colors: string[]; environments: string[]; timing: string[] };
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<BaziData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/report/${id}`, { signal: AbortSignal.timeout(12000) })
      .then(r => r.json())
      .then(d => {
        if (d?.report?.content) {
          const c = typeof d.report.content === "string" ? JSON.parse(d.report.content) : d.report.content;
          setReport(c);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Centered><p>Loading your Blueprint...</p></Centered>;
  if (!report) return <Centered><h1>Report not found</h1><a href="/order">Generate a new report →</a></Centered>;

  const dm = report.dayMaster; const ed = report.wuxingDistribution; const an = report.elementAnalysis;

  return (
    <div style={{ fontFamily: "Georgia,'Noto Serif SC',serif", background: "#F9F6F0", minHeight: "100vh", color: "#2B2318" }}>
      <style>{`@media print{body{background:#fff!important;}.nop{display:none!important;}}@page{size:A4;margin:12mm;}`}</style>

      {/* PRINT BUTTON */}
      <div className="nop" style={{ position: "fixed", top: 20, right: 20, zIndex: 100 }}>
        <button onClick={() => window.print()} style={{ background: "#26382c", color: "#fff", border: "none", padding: "12px 24px", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Download PDF / 下载 PDF</button>
      </div>

      {/* ═══════ COVER ═══════ */}
      <Cover report={report} />

      {/* ═══════ SECTION 1: 完整生辰八字 ═══════ */}
      <Section title="完整生辰八字 · Complete Birth Chart" icon="Ⅰ">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {[
            { label: "年柱 Year", zh: report.baziDisplay.year, en: report.baziDisplay.yearEn, note: report.shengXiao ? `${report.shengXiao.nameEn}${report.shengXiao.name}` : "" },
            { label: "月柱 Month", zh: report.baziDisplay.month, en: report.baziDisplay.monthEn, note: "月令提纲" },
            { label: "日柱 Day", zh: report.baziDisplay.day, en: report.baziDisplay.dayEn, note: `日主 ${dm.gan}(${dm.wuxing})` },
            { label: "时柱 Hour", zh: report.baziDisplay.hour, en: report.baziDisplay.hourEn, note: "子时细分" },
          ].map((p, i) => (
            <div key={i} style={{ background: "#FBF7F0", border: "1px solid #E3DBCC", padding: 24, textAlign: "center" }}>
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8A8178", margin: "0 0 8px" }}>{p.label}</p>
              <p style={{ fontSize: 26, margin: "0 0 4px", fontWeight: 300 }}>{p.zh}</p>
              <p style={{ fontSize: 13, color: "#8A8178", margin: 0 }}>{p.en}</p>
              <p style={{ fontSize: 11, color: "#B8975A", margin: "4px 0 0" }}>{p.note}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#8A8178" }}>
          排盘采用早子时/晚子时细分法 · 23:00-00:00晚子时日柱用前一日 · 00:00-01:00早子时日柱用当日
        </div>
      </Section>

      {/* ═══════ SECTION 2: 五行分析彩图 ═══════ */}
      <Section title="五行分析彩图 · Five Elements Analysis" subtitle="采纳滴天髓理论 · Di Tian Sui Theory" icon="Ⅱ">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 24 }}>
          {ed.map((w, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ height: 100, background: w.color, borderRadius: "50%", width: 100, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 28, fontWeight: 300 }}>{w.count}</span>
              </div>
              <p style={{ fontSize: 14, color: "#2B2318", margin: "0 0 2px", fontWeight: 400 }}>{w.nameEn}</p>
              <p style={{ fontSize: 12, color: "#8A8178", margin: 0 }}>{w.name} {w.percentage}%</p>
            </div>
          ))}
        </div>

        {/* 滴天髓分析 */}
        <div style={{ background: "linear-gradient(135deg,#F3EFE7,#EDE8DE)", padding: 28, borderRadius: 2, border: "1px solid #E3DBCC" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h3 style={{ fontSize: 16, fontWeight: 400, margin: "0 0 12px", color: "#B8975A" }}>五行旺衰等级 · Element Strength</h3>
              <p style={{ fontSize: 13, lineHeight: 1.8, color: "#3A342C", margin: 0 }}>
                {an.dominant.nameEn}({an.dominant.name}) 为主导元素，{an.secondary.nameEn}({an.secondary.name}) 为次要元素。
                {an.missing.length > 0 && ` 命局缺${an.missing.map((m:any) => m.name).join("、")}。`}
              </p>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h3 style={{ fontSize: 16, fontWeight: 400, margin: "0 0 12px", color: "#B8975A" }}>滴天髓用神 · Yong Shen</h3>
              <p style={{ fontSize: 32, color: dm.color, margin: "0 0 6px", fontWeight: 300 }}>
                {report.disuitianshu?.yongshen || an.dominant.name}
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "#3A342C", margin: 0 }}>
                {report.disuitianshu?.analysis || `日主${dm.gan}(${dm.wuxing})，${an.profile}。取${an.dominant.name}为用神，扶抑得宜。`}
              </p>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#fff", borderRadius: 2, border: "1px solid #E3DBCC" }}>
            <span style={{ fontSize: 11, color: "#8A8178" }}>滴天髓云：</span>
            <span style={{ fontSize: 12, color: "#3A342C", fontStyle: "italic" }}>"道有体用，不可以一端论也，要在扶之抑之得其宜。旺极者抑之反激而有害，则宜从其强而扶之；弱极者扶之徒劳而无功，则宜从其弱而抑之。"</span>
          </div>
        </div>
      </Section>

      {/* ═══════ SECTION 3: 五行能量强弱 ═══════ */}
      <Section title="五行能量强弱 · Energy Dynamics" subtitle="采纳盲派理论 · Blind School Theory" icon="Ⅲ">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 24 }}>
          {ed.map((w, i) => (
            <div key={i} style={{ border: "1px solid #E3DBCC", padding: "14px 18px", background: "#FBF7F0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 400 }}>{w.nameEn} {w.name}</span>
                <span style={{ fontSize: 22, color: w.color, fontWeight: 300 }}>{w.count}</span>
              </div>
              <div style={{ height: 12, background: "#EDE8DE", borderRadius: 6 }}>
                <div style={{ height: 12, width: `${Math.max(2, w.barWidth)}%`, background: w.color, borderRadius: 6, transition: "width 1s ease" }} />
              </div>
              <p style={{ fontSize: 11, color: "#8A8178", margin: "4px 0 0" }}>{w.percentage}%</p>
            </div>
          ))}
        </div>
        <div style={{ background: "#F3EFE7", padding: 24, borderRadius: 2 }}>
          <h3 style={{ fontSize: 16, fontWeight: 400, margin: "0 0 8px", color: "#B8975A" }}>盲派能量做功分析</h3>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: "#3A342C", margin: 0 }}>
            {report.mangpai?.flow || `日主${dm.gan}(${dm.wuxing})${an.dominant.name}旺，能量流向${an.dominant.desc || ""}。${an.secondary.name}为辅助力量。五行流通${an.missing.length > 0 ? "受阻，需补" + an.missing.map((m:any) => m.name).join("、") : "顺畅，命局平衡。"}`}
          </p>
        </div>
      </Section>

      {/* ═══════ SECTION 4: 五行人生轨迹 ═══════ */}
      <Section title="五行人生轨迹 · Life Trajectory" subtitle="过去十年 · 现在十年" icon="Ⅳ">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 24 }}>
          {/* Past 10 years */}
          <div style={{ background: "#FBF7F0", border: "1px solid #E3DBCC", padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 400, margin: "0 0 12px", color: "#8A8178", textTransform: "uppercase", letterSpacing: "0.08em" }}>过去十年 · Past Decade</h3>
            <p style={{ fontSize: 28, color: "#C75B39", margin: "0 0 8px", fontWeight: 300 }}>{report.mangpai?.pastTen || "探索奠基期"}</p>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#3A342C", margin: 0 }}>
              {report.mangpai?.pastTenEn || "Foundation and exploration phase. Building the groundwork for current endeavors."}
            </p>
          </div>
          {/* Current 10 years */}
          <div style={{ background: dm.color + "10", border: `2px solid ${dm.color}`, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 400, margin: "0 0 12px", color: dm.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>现在十年 · Current Decade</h3>
            <p style={{ fontSize: 28, color: dm.color, margin: "0 0 8px", fontWeight: 300 }}>{report.mangpai?.currentTen || "发展上升期"}</p>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#3A342C", margin: 0 }}>
              {report.mangpai?.currentTenEn || "Growth and ascension phase. Current energies support advancement and achievement."}
            </p>
          </div>
        </div>

        {/* 大运表 */}
        {report.dayun && report.dayun.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 400, margin: "0 0 12px", color: "#B8975A" }}>大运流年 · Ten-Year Luck Cycles</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {report.dayun.slice(0, 8).map((dy, i) => (
                <div key={i} style={{ padding: "12px 16px", border: "1px solid #E3DBCC", background: i === 1 ? dm.color + "15" : "#FBF7F0", textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: "#8A8178", textTransform: "uppercase", margin: "0 0 4px" }}>{dy.age}</p>
                  <p style={{ fontSize: 16, fontWeight: 300, margin: "0 0 2px" }}>{dy.ganzhi}</p>
                  <p style={{ fontSize: 11, color: "#8A8178", margin: 0 }}>{dy.nayin} · {dy.wuxing}</p>
                  <p style={{ fontSize: 10, color: "#B4A89A", margin: "2px 0 0" }}>{dy.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* ═══════ SECTION 5: 幸运体系 ═══════ */}
      <Section title="人生幸运体系 · Your Lucky Guide" subtitle="幸运颜色 · 幸运环境 · 幸运时机" icon="Ⅴ">
        {/* Colors */}
        <h3 style={{ fontSize: 16, fontWeight: 400, margin: "0 0 12px", color: "#B8975A" }}>幸运颜色 · Lucky Colors</h3>
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          {report.colorPalette.map((c, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 72, background: c.hex, borderRadius: 4, marginBottom: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} />
              <p style={{ fontSize: 11, color: "#3A342C", margin: "0 0 2px" }}>{c.name}</p>
              <p style={{ fontSize: 9, color: "#8A8178", margin: 0 }}>{c.use}</p>
            </div>
          ))}
        </div>

        {/* Environments */}
        <h3 style={{ fontSize: 16, fontWeight: 400, margin: "0 0 12px", color: "#B8975A" }}>幸运环境 · Lucky Environments</h3>
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          {(report.lucky?.environments || ["自然环境","文化空间","生活空间","社交环境","事业环境"]).map((e, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: "16px 12px", border: "1px solid #E3DBCC", background: "#FBF7F0" }}>
              <p style={{ fontSize: 11, color: "#3A342C", margin: 0 }}>{["Nature","Culture","Living","Social","Career"][i] || ""}</p>
              <p style={{ fontSize: 11, color: "#8A8178", margin: "2px 0 0" }}>{e}</p>
            </div>
          ))}
        </div>

        {/* Timing */}
        <h3 style={{ fontSize: 16, fontWeight: 400, margin: "0 0 12px", color: "#B8975A" }}>幸运时机 · Lucky Timing</h3>
        <div style={{ display: "flex", gap: 12 }}>
          {(report.lucky?.timing || ["春","夏","长夏","秋","冬"]).map((t, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: "16px 12px", border: `2px solid ${report.colorPalette[i]?.hex || "#E3DBCC"}`, background: "white" }}>
              <p style={{ fontSize: 13, color: "#3A342C", margin: "0 0 2px" }}>{["Spring","Summer","Late Summer","Autumn","Winter"][i]}</p>
              <p style={{ fontSize: 12, color: "#8A8178", margin: 0 }}>{t}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════ SECTION 6: 生活指引 ═══════ */}
      <Section title="生活指引 · Lifestyle Guidance" icon="✦">
        <div style={{ display: "grid", gap: 12 }}>
          {report.lifestyleTips.map((t, i) => (
            <div key={i} style={{ padding: "18px 22px", border: "1px solid #E3DBCC", background: "#FBF7F0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 400, margin: "0 0 6px", color: dm.color }}>{t.titleEn} · {t.title}</h3>
              <p style={{ fontSize: 12, lineHeight: 1.8, color: "#3A342C", margin: 0 }}>{t.tipEn}<br />{t.tip}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════ TOTEM ═══════ */}
      <Section title="专属图腾 · Your Personal Totem" icon="◆">
        <div style={{ textAlign: "center", padding: "40px 20px", background: "#F3EFE7", border: "1px solid #E3DBCC" }}>
          <p style={{ fontSize: 22, color: dm.color, margin: "0 0 8px", fontWeight: 300 }}>{report.totemDescription.en}</p>
          <p style={{ fontSize: 14, color: "#8A8178", margin: "0 0 16px" }}>{report.totemDescription.cn}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            {report.totemDescription.elements.map((e: string, i: number) => (
              <span key={i} style={{ padding: "6px 18px", border: `1px solid ${dm.color}`, color: dm.color, fontSize: 12, borderRadius: 2 }}>{e}</span>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════ SPACE ═══════ */}
      <Section title="空间色彩建议 · Space & Color" icon="◈">
        <div style={{ display: "grid", gap: 12 }}>
          {report.spaceTips.map((s, i) => (
            <div key={i} style={{ padding: "18px 22px", border: "1px solid #E3DBCC", display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 24, height: 24, background: s.color, borderRadius: 3, flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 400, margin: "0 0 4px" }}>{s.areaEn} · {s.area}</p>
                <p style={{ fontSize: 12, lineHeight: 1.8, color: "#3A342C", margin: 0 }}>{s.adviceEn}<br />{s.advice}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════ FOOTER ═══════ */}
      <div style={{ textAlign: "center", padding: "64px 20px", borderTop: "1px solid #E3DBCC" }}>
        <p style={{ fontSize: 18, color: "#2B2318", margin: "0 0 4px" }}>Personal. Beautiful. Elemental.</p>
        <p style={{ fontSize: 11, color: "#8A8178", margin: 0 }}>FiveSelf Studio · {report.reportId}</p>
        <p style={{ fontSize: 10, color: "#B4A89A", margin: "4px 0 0" }}>本报告基于滴天髓理论与盲派命理精髓生成 · For personal enrichment only</p>
      </div>
    </div>
  );
}

function Cover({ report }: { report: BaziData }) {
  const dm = report.dayMaster;
  return (
    <div style={{ textAlign: "center", padding: "100px 20px 80px", borderBottom: "1px solid #E3DBCC", background: "linear-gradient(180deg, #FBF7F0 0%, #F9F6F0 100%)" }}>
      <p style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8A8178", margin: "0 0 20px" }}>Five Elements Visual Blueprint</p>
      <h1 style={{ fontSize: "clamp(36px,6vw,64px)", fontWeight: 300, margin: "0 0 12px", lineHeight: 1.1, color: "#2B2318" }}>五行个人蓝图</h1>
      <div style={{ display: "inline-block", width: 120, height: 120, borderRadius: "50%", background: dm.color, margin: "24px auto", lineHeight: "120px", fontSize: 48, fontWeight: 300, color: "#fff" }}>
        {dm.gan}
      </div>
      <p style={{ fontSize: 22, color: dm.color, margin: "0 0 4px" }}>{dm.ganEn} · {dm.wuxingEn} · {dm.wuxing}</p>
      <p style={{ color: "#8A8178", fontSize: 14, margin: "8px 0 0" }}>Prepared for <strong style={{ color: "#2B2318" }}>{report.customerName}</strong> · {report.birthDate}</p>
      <p style={{ color: "#B8975A", fontSize: 11, marginTop: 8 }}>{report.reportId}</p>
    </div>
  );
}

function Section({ title, subtitle, icon, children }: { title: string; subtitle?: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 20px", borderBottom: "1px solid #EDE8DE" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: subtitle ? 4 : 20 }}>
        <span style={{ fontSize: 14, color: "#B8975A", fontWeight: 300 }}>{icon}</span>
        <h2 style={{ fontSize: 22, fontWeight: 400, margin: 0, color: "#2B2318" }}>{title}</h2>
      </div>
      {subtitle && <p style={{ fontSize: 13, color: "#8A8178", margin: "0 0 24px", paddingLeft: 32 }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F9F6F0", fontFamily: "Georgia,'Noto Serif SC',serif", color: "#2B2318", padding: 40, textAlign: "center" }}>{children}</div>;
}
