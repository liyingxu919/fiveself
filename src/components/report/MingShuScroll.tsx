"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

interface MingShuScrollProps {
  customerName: string;
  birthDate: string;
  baziDisplay: { year: string; month: string; day: string; hour: string; yearEn?: string; monthEn?: string; dayEn?: string; hourEn?: string };
  aiMingShu: string;
  dayMaster: { gan: string; wuxing: string };
  lang?: "bilingual" | "zh" | "en";
  version?: "concise" | "full";
  totemImageUrl?: string;
  wuxingData?: Array<{ name: string; nameEn: string; count: number; percentage: number; color: string }>;
  dayunData?: Array<{ age: string; ganzhi: string; nayin: string; analysis: string }>;
  yongShen?: string;
  shenSha?: string[];
}

const WX_COLORS = ["#7a9a7b", "#c0806e", "#b8956a", "#8c827a", "#6a8aa0"];

export default function MingShuScroll({ customerName, birthDate, baziDisplay, aiMingShu, dayMaster, lang = "bilingual", version = "full", wuxingData, dayunData, yongShen, shenSha }: MingShuScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!scrollRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(scrollRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#f3ede3",
      });
      const link = document.createElement("a");
      link.download = `命书_${customerName}_${Date.now().toString(36)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  // Parse sections with bilingual headers 「一、xxx | I. xxx」
  const sections = parseScrollSections(aiMingShu);

  return (
    <div id="mingshu-scroll-section" className="nop" style={{ padding: "48px 0" }}>
      {/* ===== SCROLL IMAGE ===== */}
      <div
        ref={scrollRef}
        style={{
          width: 640,
          margin: "0 auto",
          background: "#f3ede3",
          position: "relative",
          fontFamily:
            "\"Noto Serif SC\", \"STSong\", \"SimSun\", \"Songti SC\", serif",
          color: "#2b2318",
          boxShadow: "0 4px 32px rgba(80,60,30,0.15)",
        }}
      >
        {/* Subtle edge vignette — left/right darker */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(160,140,110,0.25) 0%, transparent 8%, transparent 92%, rgba(160,140,110,0.25) 100%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Inner scroll — main content */}
        <div
          style={{
            padding: "64px 56px 56px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* ═══ TOP ORNAMENT ═══ */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            {/* Decorative top line */}
            <svg
              width="100%"
              height="28"
              viewBox="0 0 528 28"
              style={{ display: "block", marginBottom: 4 }}
            >
              <line
                x1="0" y1="14" x2="220" y2="14"
                stroke="#c8b898" strokeWidth="0.8"
              />
              <line
                x1="308" y1="14" x2="528" y2="14"
                stroke="#c8b898" strokeWidth="0.8"
              />
              <circle cx="236" cy="14" r="3" fill="#c8b898" />
              <circle cx="264" cy="14" r="5" fill="none" stroke="#c8b898" strokeWidth="1.2" />
              <circle cx="292" cy="14" r="3" fill="#c8b898" />
            </svg>

            {/* Title */}
            <h2
              style={{
                fontSize: 34,
                fontWeight: 400,
                letterSpacing: "0.35em",
                margin: "0 0 16px",
                color: "#2b2318",
              }}
            >
              八字命书
            </h2>

            {/* Gold divider */}
            <div
              style={{
                width: 60,
                height: 1.5,
                background: "#b8956a",
                margin: "0 auto 24px",
              }}
            />

            {/* Customer info line */}
            <div
              style={{
                fontSize: 14,
                color: "#5c4e3d",
                letterSpacing: "0.12em",
                lineHeight: 2,
              }}
            >
              <p style={{ margin: "0 0 2px" }}>
                <strong style={{ fontSize: 18, color: "#2b2318" }}>
                  {customerName}
                </strong>
                <span style={{ margin: "0 6px" }}>·</span>
                {birthDate}出生
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#8c7b65" }}>
                八字四柱：{baziDisplay.year}年 {baziDisplay.month}月{" "}
                {baziDisplay.day}日 {baziDisplay.hour}时
                <span style={{ margin: "0 10px" }}>│</span>
                日主：{dayMaster.gan}（{dayMaster.wuxing}）
              </p>
            </div>
          </div>

          {/* ═══ 八字四柱表 ═══ */}
          <div style={{ marginBottom: 32 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#e8ddd0" }}>
                  {[baziDisplay].map((bz: any) => (
                    <>
                      <th style={{ padding: "8px 6px", border: "1px solid #d4c5a9", fontWeight: 600 }}>{bz.year||""}</th>
                      <th style={{ padding: "8px 6px", border: "1px solid #d4c5a9", fontWeight: 600 }}>{bz.month||""}</th>
                      <th style={{ padding: "8px 6px", border: "1px solid #d4c5a9", fontWeight: 600 }}>{bz.day||""}</th>
                      <th style={{ padding: "8px 6px", border: "1px solid #d4c5a9", fontWeight: 600 }}>{bz.hour||""}</th>
                    </>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: "6px", border: "1px solid #d4c5a9", textAlign: "center", fontSize: 11, color: "#8c7b65" }}>年柱 Year</td>
                  <td style={{ padding: "6px", border: "1px solid #d4c5a9", textAlign: "center", fontSize: 11, color: "#8c7b65" }}>月柱 Month</td>
                  <td style={{ padding: "6px", border: "1px solid #d4c5a9", textAlign: "center", fontSize: 11, color: "#8c7b65" }}>日柱 Day</td>
                  <td style={{ padding: "6px", border: "1px solid #d4c5a9", textAlign: "center", fontSize: 11, color: "#8c7b65" }}>时柱 Hour</td>
                </tr>
              </thead>
            </table>
            <p style={{ textAlign: "center", fontSize: 11, color: "#b8956a", margin: "8px 0 0" }}>
              日主 {dayMaster.gan}（{dayMaster.wuxing}）{yongShen ? ` · 用神 ${yongShen}` : ""}{shenSha?.length ? ` · ${shenSha.slice(0,3).join(" ")}` : ""}
            </p>
          </div>

          {/* ═══ 五行能量条 ═══ */}
          {wuxingData && wuxingData.length > 0 && (
            <div style={{ marginBottom: 32, padding: "16px 12px", border: "1px solid #e0d5c0", background: "rgba(255,255,255,0.4)" }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, margin: "0 0 12px", color: "#5c4e3d", textAlign: "center" }}>五行能量分布 · Five Elements Energy</h4>
              {wuxingData.map((w, i) => (
                <div key={i} style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 32, fontSize: 11, color: "#8c7b65", textAlign: "right", flexShrink: 0 }}>{w.name}</span>
                  <div style={{ flex: 1, height: 14, background: "#e8ddd0", borderRadius: 7, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.max(4, w.percentage)}%`, background: WX_COLORS[i] || "#b8956a", borderRadius: 7, transition: "width 0.5s" }} />
                  </div>
                  <span style={{ width: 36, fontSize: 10, color: "#8c7b65", flexShrink: 0 }}>{w.count} ({w.percentage}%)</span>
                </div>
              ))}
            </div>
          )}

          {/* ═══ 大运趋势 ═══ */}
          {dayunData && dayunData.length > 0 && (
            <div style={{ marginBottom: 32, padding: "16px 12px", border: "1px solid #e0d5c0", background: "rgba(255,255,255,0.4)" }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, margin: "0 0 12px", color: "#5c4e3d", textAlign: "center" }}>大运流转 · Life Cycles</h4>
              <div style={{ display: "flex", gap: 4, overflow: "hidden" }}>
                {dayunData.slice(0, 8).map((d, i) => {
                  const colors = ["#7a9a7b","#c0806e","#b8956a","#8c827a","#6a8aa0","#7a9a7b","#c0806e","#b8956a"];
                  const h = 24 + (d.analysis?.length || 0) % 5 * 6;
                  return (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ height: h, background: colors[i], borderRadius: "3px 3px 0 0", marginBottom: 2, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "2px 1px" }}>
                        <span style={{ fontSize: 8, color: "#fff", fontWeight: 600 }}>{d.ganzhi}</span>
                      </div>
                      <div style={{ fontSize: 8, color: "#8c7b65" }}>{d.age}</div>
                    </div>
                  );
                })}
              </div>
              <p style={{ textAlign: "center", fontSize: 9, color: "#b8956a", margin: "8px 0 0" }}>每步大运十年 · 高低起伏皆有时</p>
            </div>
          )}

          {/* ═══ MAIN TEXT BODY ═══ */}
          <div style={{ fontSize: 15, lineHeight: 2.3, color: "#2b2318", textAlign: "justify" }}>
            {sections.length > 0
              ? sections.map((section, i) => {
                  const showCn = lang === "bilingual" || lang === "zh";
                  const showEn = lang === "bilingual" || lang === "en";
                  return (
                    <div key={i} style={{ marginBottom: i < sections.length - 1 ? 32 : 0 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 600, color: "#3c2e1e", margin: "0 0 12px", letterSpacing: "0.06em", borderLeft: "3px solid #b8956a", paddingLeft: 12 }}>
                        {showCn ? section.titleCn : ""}{showCn && showEn ? " · " : ""}{showEn ? section.titleEn : ""}
                      </h3>
                      {showCn && section.bodyCn && (
                        <p style={{ margin: "0 0 10px", textIndent: "2em", whiteSpace: "pre-wrap" }}>{section.bodyCn}</p>
                      )}
                      {showEn && section.bodyEn && (
                        <p style={{ margin: 0, textIndent: showCn ? 0 : "2em", whiteSpace: "pre-wrap", color: showCn ? "#5c4e3d" : "#2b2318", fontSize: showCn ? 13 : 15, fontStyle: showCn ? "italic" : "normal" }}>{section.bodyEn}</p>
                      )}
                    </div>
                  );
                })
              : (<p style={{ margin: 0, textIndent: "2em", whiteSpace: "pre-wrap" }}>{aiMingShu}</p>)}
          </div>

          {/* ═══ RED SEAL ═══ */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              marginTop: 48,
              paddingTop: 32,
              borderTop: "1px solid #e0d5c0",
              gap: 16,
            }}
          >
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: 10,
                  color: "#b8956a",
                  margin: "0 0 4px",
                  letterSpacing: "0.1em",
                }}
              >
                五玄斋
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "#b8956a",
                  margin: 0,
                  letterSpacing: "0.1em",
                }}
              >
                · 出品 ·
              </p>
            </div>

            {/* Seal stamp */}
            <div
              style={{
                width: 60,
                height: 60,
                border: "2.5px solid #b84040",
                color: "#b84040",
                fontSize: 16,
                fontWeight: 700,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1.3,
                letterSpacing: "0.15em",
                transform: "rotate(-6deg)",
                userSelect: "none",
                flexShrink: 0,
              }}
            >
              <span>八字</span>
              <span>合验</span>
            </div>
          </div>

          {/* ═══ BOTTOM ORNAMENT ═══ */}
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <svg
              width="100%"
              height="20"
              viewBox="0 0 528 20"
              style={{ display: "block" }}
            >
              <line
                x1="0" y1="10" x2="228" y2="10"
                stroke="#c8b898" strokeWidth="0.8"
              />
              <line
                x1="300" y1="10" x2="528" y2="10"
                stroke="#c8b898" strokeWidth="0.8"
              />
              <circle cx="248" cy="10" r="2.5" fill="#b8956a" />
              <circle cx="264" cy="10" r="4" fill="none" stroke="#b8956a" strokeWidth="1" />
              <circle cx="280" cy="10" r="2.5" fill="#b8956a" />
            </svg>
            <p
              style={{
                fontSize: 9,
                color: "#c8b898",
                margin: "6px 0 0",
                letterSpacing: "0.25em",
              }}
            >
              FIVE ELEMENTS · PERSONAL DESTINY SCROLL
            </p>
          </div>
        </div>
      </div>

      {/* ═══ DOWNLOAD ═══ */}
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            background: downloading ? "#8c8076" : "#3c342e",
            color: "#faf6f0",
            border: "none",
            padding: "16px 44px",
            fontSize: 13,
            letterSpacing: "0.15em",
            cursor: downloading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            borderRadius: 2,
          }}
        >
          {downloading ? "生成中..." : "下载命书卷轴 · DOWNLOAD SCROLL"}
        </button>
        <p style={{ fontSize: 10, color: "#8c8076", marginTop: 8 }}>
          高清PNG · 可打印收藏 · 2x分辨率
        </p>
      </div>
    </div>
  );
}

interface ScrollSection { titleCn: string; titleEn: string; bodyCn: string; bodyEn: string; }

function parseScrollSections(text: string): ScrollSection[] {
  if (!text || text.startsWith("[Gemini")) return [];
  const sections: ScrollSection[] = [];
  const re = /[「【]([一二三四五六七八]、[^|」】]+)\s*\|\s*([^」】]+)[」】]/g;
  const matches: Array<{ index: number; titleCn: string; titleEn: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    matches.push({ index: m.index, titleCn: m[1].trim(), titleEn: m[2].trim() });
  }
  // Fall back to old format: 「一、xxx」 or 一、xxx
  if (matches.length === 0) {
    const oldRe = /(?:一、|二、|三、|四、|五、|六、|七、|八、)[^\n]+/g;
    const oldMatches: Array<{ index: number; title: string }> = [];
    while ((m = oldRe.exec(text)) !== null) {
      oldMatches.push({ index: m.index, title: m[0].trim() });
    }
    if (oldMatches.length > 0) {
      for (let i = 0; i < oldMatches.length; i++) {
        const start = oldMatches[i].index;
        const end = i < oldMatches.length - 1 ? oldMatches[i + 1].index : text.length;
        const body = text.substring(start + oldMatches[i].title.length, end).trim();
        sections.push({ titleCn: oldMatches[i].title, titleEn: oldMatches[i].title, bodyCn: body, bodyEn: "" });
      }
      return sections;
    }
    return [];
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i < matches.length - 1 ? matches[i + 1].index : text.length;
    const content = text.substring(start, end);
    const headerEnd = content.indexOf("」");
    const body = headerEnd > 0 ? content.substring(headerEnd + 1).trim() : content;
    const cnLines: string[] = [];
    const enLines: string[] = [];
    let inEnglish = false;
    for (const line of body.split("\n")) {
      const t = line.trim();
      if (!t) continue;
      const asciiRatio = [...t].filter((c) => c.charCodeAt(0) < 128).length / t.length;
      if (!inEnglish && asciiRatio > 0.7 && /^[A-Z]/.test(t)) inEnglish = true;
      if (inEnglish) enLines.push(t);
      else cnLines.push(t);
    }
    sections.push({
      titleCn: matches[i].titleCn,
      titleEn: matches[i].titleEn,
      bodyCn: cnLines.join("\n") || (enLines.length ? enLines.join("\n") : body),
      bodyEn: enLines.join("\n") || cnLines.join("\n"),
    });
  }
  return sections;
}
