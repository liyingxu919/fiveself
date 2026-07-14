import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import { WUXING_NAMES, WUXING_NAMES_EN, WUXING_COLORS } from "@/lib/bazi";
import type { ReportContent } from "@/lib/report-generator";
import type { Metadata } from "next";

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
}

async function getReport(id: string): Promise<ReportContent | null> {
  try {
    const query = `*[_type == "report" && reportId == $id][0]`;
    return await client.fetch(query, { id });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Five Elements Blueprint · ${id}` };
}

export default async function ReportPage({ params }: Props) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", fontFamily: "Georgia, serif", color: "#2B2318", background: "#F9F6F0", minHeight: "100vh" }}>
        <h1 style={{ fontWeight: 400 }}>Report not found</h1>
        <p style={{ color: "#8A8178" }}>This report may have expired. Please contact us for a new one.</p>
      </div>
    );
  }

  const dm = report.dayMaster;
  const wd = report.wuxingDistribution;
  const an = report.elementAnalysis;

  return (
    <div style={{ fontFamily: "Georgia, 'Noto Serif SC', serif", background: "#F9F6F0", minHeight: "100vh", color: "#2B2318" }}>
      {/* Print styles */}
      <style>{`@media print { body { background: #fff !important; } .no-print { display: none !important; } }`}</style>

      {/* Download button */}
      <div className="no-print" style={{ position: "fixed", top: 20, right: 20, zIndex: 100 }}>
        <button onClick={() => window.print()} style={{
          background: "#26382c", color: "#fff", border: "none", padding: "12px 24px",
          fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer"
        }}>
          Download PDF / 下载 PDF
        </button>
      </div>

      {/* Cover */}
      <div style={{ textAlign: "center", padding: "80px 20px 60px", borderBottom: "1px solid #E3DBCC" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8A8178", margin: "0 0 16px" }}>
          A Personal Visual Publication
        </p>
        <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 300, margin: "0 0 8px", lineHeight: 1.1 }}>
          Five Elements<br />Visual Blueprint
        </h1>
        <p style={{ fontSize: 18, color: "#B8975A", margin: "16px 0" }}>
          五行视觉能量报告
        </p>
        <p style={{ color: "#8A8178", fontSize: 13 }}>
          Prepared for <strong style={{ color: "#2B2318" }}>{report.customerName}</strong>
          {" · "} {report.birthDate} {report.birthTime && `· ${report.birthTime}`}
        </p>
        <p style={{ color: "#B8975A", fontSize: 11, marginTop: 8 }}>
          {report.reportId}
        </p>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px" }}>

        {/* Day Master */}
        <div style={{ textAlign: "center", margin: "48px 0" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A8178", margin: "0 0 8px" }}>
            Your Day Master · 你的日主
          </p>
          <div style={{
            display: "inline-block", width: 100, height: 100, borderRadius: "50%",
            background: dm.color, color: "#fff", lineHeight: "100px",
            fontSize: 42, fontWeight: 300, marginBottom: 12
          }}>
            {dm.gan}
          </div>
          <p style={{ fontSize: 18, margin: "4px 0", color: dm.color }}>
            {dm.ganEn} ({dm.wuxingEn} · {dm.wuxing})
          </p>
        </div>

        {/* Four Pillars */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, textAlign: "center", margin: "32px 0" }}>
          {[
            { label: "Year · 年柱", en: report.baziDisplay.yearEn, zh: report.baziDisplay.year },
            { label: "Month · 月柱", en: report.baziDisplay.monthEn, zh: report.baziDisplay.month },
            { label: "Day · 日柱", en: report.baziDisplay.dayEn, zh: report.baziDisplay.day },
            { label: "Hour · 时柱", en: report.baziDisplay.hourEn, zh: report.baziDisplay.hour },
          ].map((p, i) => (
            <div key={i} style={{ border: "1px solid #E3DBCC", padding: "20px 8px", background: "#FBF7F0" }}>
              <p style={{ fontSize: 10, textTransform: "uppercase", color: "#8A8178", margin: "0 0 6px" }}>{p.label}</p>
              <p style={{ fontSize: 22, margin: "0 0 2px", fontWeight: 300 }}>{p.zh}</p>
              <p style={{ fontSize: 12, color: "#8A8178", margin: 0 }}>{p.en}</p>
            </div>
          ))}
        </div>

        {/* Five Elements Distribution */}
        <h2 style={{ fontSize: 20, fontWeight: 400, margin: "48px 0 16px", textAlign: "center" }}>
          Element Distribution · 五行分布
        </h2>
        {wd.map((w, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
              <span>{w.nameEn} {w.name}</span>
              <span style={{ color: "#8A8178" }}>{w.count} ({w.percentage}%)</span>
            </div>
            <div style={{ height: 10, background: "#EDE8DE", borderRadius: 2 }}>
              <div style={{ height: 10, width: `${Math.max(3, w.barWidth)}%`, background: w.color, borderRadius: 2 }} />
            </div>
          </div>
        ))}
        <p style={{ textAlign: "center", color: "#8A8178", fontSize: 13, marginTop: 8 }}>
          {report.elementAnalysis.profile}
        </p>

        {/* Element Analysis */}
        <div style={{ background: "#F3EFE7", padding: 28, margin: "32px 0" }}>
          <h2 style={{ fontSize: 18, fontWeight: 400, margin: "0 0 16px", color: "#9B6E4E" }}>
            Dominant Element · 主导元素
          </h2>
          <p style={{ fontSize: 32, margin: "0 0 8px", color: WUXING_COLORS[report.dominantElement] }}>
            {an.dominant.nameEn} {an.dominant.name}
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: "#3A342C", margin: 0 }}>
            {an.dominant.descEn}<br />{an.dominant.desc}
          </p>
        </div>

        <div style={{ background: "#F3EFE7", padding: 28, margin: "24px 0" }}>
          <h2 style={{ fontSize: 18, fontWeight: 400, margin: "0 0 16px", color: "#9B6E4E" }}>
            Secondary Element · 次要元素
          </h2>
          <p style={{ fontSize: 24, margin: "0 0 8px", color: WUXING_COLORS[report.secondaryElement] }}>
            {an.secondary.nameEn} {an.secondary.name}
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: "#3A342C", margin: 0 }}>
            {an.secondary.descEn}<br />{an.secondary.desc}
          </p>
        </div>

        {an.missing.length > 0 && (
          <div style={{ textAlign: "center", margin: "24px 0", padding: 20, border: "1px dashed #E3DBCC" }}>
            <p style={{ fontSize: 13, color: "#8A8178", margin: 0 }}>
              Missing Elements · 缺失五行：
              {an.missing.map(m => ` ${m.nameEn}(${m.name})`).join("、")}
            </p>
            <p style={{ fontSize: 11, color: "#B4A89A", margin: "4px 0 0" }}>
              Consider adding these elements to your surroundings for balance.
            </p>
          </div>
        )}

        {/* Color Palette */}
        <h2 style={{ fontSize: 20, fontWeight: 400, margin: "48px 0 16px", textAlign: "center" }}>
          Your Color System · 你的色彩体系
        </h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {report.colorPalette.map((c, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 64, background: c.hex, borderRadius: 2, marginBottom: 6 }} />
              <p style={{ fontSize: 10, color: "#3A342C", margin: "0 0 2px" }}>{c.name}</p>
              <p style={{ fontSize: 9, color: "#8A8178", margin: 0 }}>{c.use}</p>
            </div>
          ))}
        </div>

        {/* Lifestyle Tips */}
        <h2 style={{ fontSize: 20, fontWeight: 400, margin: "48px 0 16px", textAlign: "center" }}>
          Lifestyle Guidance · 生活指引
        </h2>
        {report.lifestyleTips.map((t, i) => (
          <div key={i} style={{ marginBottom: 20, padding: "16px 20px", border: "1px solid #E3DBCC", background: "#FBF7F0" }}>
            <h3 style={{ fontSize: 14, fontWeight: 400, margin: "0 0 6px", color: "#9B6E4E" }}>
              {t.titleEn} · {t.title}
            </h3>
            <p style={{ fontSize: 12, lineHeight: 1.7, color: "#3A342C", margin: 0 }}>
              {t.tipEn}<br />{t.tip}
            </p>
          </div>
        ))}

        {/* Space Tips */}
        <h2 style={{ fontSize: 20, fontWeight: 400, margin: "48px 0 16px", textAlign: "center" }}>
          Space & Color · 空间色彩建议
        </h2>
        <div style={{ display: "grid", gap: 12 }}>
          {report.spaceTips.map((s, i) => (
            <div key={i} style={{ border: "1px solid #E3DBCC", padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 16, height: 16, background: s.color, borderRadius: 2 }} />
                <span style={{ fontSize: 14, fontWeight: 400 }}>{s.areaEn} · {s.area}</span>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.7, color: "#3A342C", margin: 0 }}>
                {s.adviceEn}<br />{s.advice}
              </p>
            </div>
          ))}
        </div>

        {/* Totem */}
        <h2 style={{ fontSize: 20, fontWeight: 400, margin: "48px 0 16px", textAlign: "center" }}>
          Your Personal Totem · 你的专属图腾
        </h2>
        <div style={{ textAlign: "center", padding: 32, background: "#F3EFE7", border: "1px solid #E3DBCC" }}>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: "#3A342C", margin: 0 }}>
            {report.totemDescription.en}
          </p>
          <p style={{ fontSize: 12, lineHeight: 1.8, color: "#8A8178", margin: "8px 0 0" }}>
            {report.totemDescription.cn}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16 }}>
            {report.totemElements.map((e, i) => (
              <span key={i} style={{ fontSize: 11, color: "#B8975A", border: "1px solid #B8975A", padding: "4px 12px", borderRadius: 2 }}>
                {e}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 64, paddingTop: 24, borderTop: "1px solid #E3DBCC" }}>
          <p style={{ fontSize: 16, color: "#2B2318", margin: "0 0 4px" }}>
            Personal. Beautiful. Elemental.
          </p>
          <p style={{ fontSize: 11, color: "#8A8178", margin: 0 }}>
            Oriental Aesthetic Studio · {report.reportId}
          </p>
          <p style={{ fontSize: 11, color: "#B4A89A", margin: "4px 0 0" }}>
            This is a personal visual publication, not a prediction. Think of it as a mirror, not a map.
          </p>
        </div>
      </div>
    </div>
  );
}
