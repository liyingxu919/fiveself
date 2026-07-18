import { NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "hello@fiveself.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fiveself.com";

const SANITY_API = "https://penxmsws.api.sanity.io/v1/data/mutate/production";
const SANITY_QUERY = "https://penxmsws.apicdn.sanity.io/v1/data/query/production";

export async function POST(request: Request) {
  try {
    const { reportId, email, name, editedContent, conciseMingShu, fullMingShu } = await request.json();
    if (!reportId) return NextResponse.json({ error: "Missing reportId" }, { status: 400 });

    // Update report in Sanity
    const token = process.env.SANITY_WRITE_TOKEN || "";
    if (token) {
      const qRes = await fetch(`${SANITY_QUERY}?query=${encodeURIComponent(`*[_type=="report"&&reportId=="${reportId}"][0]{_id}`)}`);
      const qJson = await qRes.json();
      const docId = qJson?.result?._id;
      if (docId) {
        const patchData: Record<string, any> = {
          content: typeof editedContent === "string" ? editedContent : JSON.stringify(editedContent),
          status: "approved",
          approvedAt: new Date().toISOString(),
        };
        if (conciseMingShu) patchData.conciseMingShu = conciseMingShu;
        if (fullMingShu) patchData.fullMingShu = fullMingShu;

        await fetch(SANITY_API, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ mutations: [{ patch: { id: docId, set: patchData } }] }),
        });
      }
    }

    // Send email with full 命书 content
    const reportUrl = `${SITE_URL}/report/${reportId}`;
    let emailSent = false;
    if (RESEND_API_KEY && email) {
      const content = typeof editedContent === "string" ? JSON.parse(editedContent) : editedContent;
      const dm = content?.dayMaster;
      const mingshuText = fullMingShu || conciseMingShu || content?.fullMingShu || content?.conciseMingShu || content?.aiMingShu || "";
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from: `FiveSelf <${FROM_EMAIL}>`,
            to: [email],
            subject: `Your Five Elements Destiny Scroll — ${reportId}`,
            html: buildApprovedEmail(name, dm, reportUrl, content, mingshuText),
          }),
        });
        if (res.ok) emailSent = true;
      } catch (e) { console.error(e); }
    }

    return NextResponse.json({ success: true, emailSent });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function buildApprovedEmail(name: string, dm: any, reportUrl: string, content: any, mingshuText: string): string {
  const ed = content?.wuxingDistribution || [];
  const cp = content?.colorPalette || [];
  const bz = content?.baziDisplay;
  const dmC = dm?.color || "#C4A882";

  // Parse 命书 sections for email display
  const sections = parseSections(mingshuText);
  const mingshuHTML = sections.length > 0 ? sections.map(s => `
    <div style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #e8e0d5;">
      <h3 style="font-size:15px;font-weight:600;color:#3D322C;margin:0 0 10px;border-left:3px solid ${dmC};padding-left:10px;">
        ${escapeHTML(s.titleCn)}<br/><span style="font-size:12px;color:#9B8E84;font-weight:400;">${escapeHTML(s.titleEn)}</span>
      </h3>
      <p style="font-size:13px;line-height:2;color:#3D322C;margin:0 0 8px;">${escapeHTML(s.bodyCn).replace(/\n/g, "<br/>")}</p>
      <p style="font-size:12px;line-height:1.8;color:#6B5E52;margin:0;font-style:italic;">${escapeHTML(s.bodyEn).replace(/\n/g, "<br/>")}</p>
    </div>
  `).join("") : `<p style="font-size:13px;line-height:2;color:#3D322C;white-space:pre-wrap;">${escapeHTML(mingshuText)}</p>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,'Noto Serif SC',serif;background:#FBF7F2;padding:40px 20px;">
<div style="max-width:640px;margin:0 auto;background:#FFFCF9;border:1px solid #E8E0D5;padding:40px;">

  <div style="text-align:center;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #E8E0D5;">
    <p style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#9B8E84;margin:0 0 16px;">Five Elements Destiny Scroll</p>
    <h1 style="font-weight:300;font-size:30px;color:#3D322C;margin:0 0 4px;">八字命书</h1>
    <div style="display:inline-block;width:72px;height:72px;border-radius:50%;background:${dmC};margin:16px auto;line-height:72px;font-size:28px;font-weight:300;color:#fff;">${dm?.gan||""}</div>
    <p style="font-size:16px;color:${dmC};margin:0 0 4px;">${dm?.ganEn||""} · ${dm?.wuxingEn||""} · ${dm?.wuxing||""}</p>
    <p style="color:#9B8E84;font-size:12px;margin:6px 0 0;">Prepared for <strong style="color:#3D322C">${name||"you"}</strong> · ${content?.birthDate||""}</p>
  </div>

  ${bz ? `
  <h2 style="font-size:14px;font-weight:400;color:#3D322C;margin:20px 0 10px;">生辰八字 · Birth Chart</h2>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:20px;">
    ${[["年Year",bz.year,bz.yearEn],["月Month",bz.month,bz.monthEn],["日Day",bz.day,bz.dayEn],["时Hour",bz.hour,bz.hourEn]].map(([l,zh,en])=>`
      <div style="background:#FBF7F2;border:1px solid #E8E0D5;padding:10px 6px;text-align:center;">
        <p style="font-size:8px;color:#9B8E84;margin:0 0 4px;">${l}</p>
        <p style="font-size:16px;margin:0 0 1px;font-weight:300;">${zh}</p>
        <p style="font-size:9px;color:#9B8E84;margin:0;">${en}</p>
      </div>
    `).join("")}
  </div>` : ""}

  <!-- 命书正文 -->
  <div style="background:#FBF7F2;border:1px solid #E8E0D5;padding:24px 20px;margin:24px 0;">
    <h2 style="font-size:16px;font-weight:400;color:#3D322C;margin:0 0 16px;text-align:center;">命书正文 · Destiny Scroll</h2>
    ${mingshuHTML}
  </div>

  ${ed.length > 0 ? `
  <h2 style="font-size:14px;font-weight:400;color:#3D322C;margin:20px 0 8px;">五行分布 · Element Distribution</h2>
  ${ed.map((w:any,i:number)=>`
    <div style="margin-bottom:6px;">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#3D322C;margin-bottom:2px;"><span>${w.nameEn} ${w.name}</span><span style="color:#9B8E84">${w.count} (${w.percentage}%)</span></div>
      <div style="height:6px;background:#E8E0D5;border-radius:3px;"><div style="height:6px;width:${Math.max(3,w.barWidth)}%;background:${["#8B9D83","#C2856A","#B8A080","#9B8E84","#7B95A8"][i]||dmC};border-radius:3px;"></div></div>
    </div>
  `).join("")}` : ""}

  ${cp.length > 0 ? `
  <div style="display:flex;gap:6px;margin-top:16px;">
    ${cp.map((c:any)=>`<div style="flex:1;text-align:center;"><div style="height:32px;background:${c.hex};border-radius:16px;margin-bottom:3px;"></div><p style="font-size:8px;color:#9B8E84;margin:0;">${c.name}</p></div>`).join("")}
  </div>` : ""}

  <div style="text-align:center;margin:28px 0 20px;">
    <a href="${reportUrl}" style="display:inline-block;background:#C4A882;color:#fff;padding:12px 28px;text-decoration:none;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;border-radius:2px;">View Online Report →</a>
  </div>

  <div style="text-align:center;padding-top:16px;border-top:1px solid #E8E0D5;">
    <p style="font-size:10px;color:#9B8E84;margin:0;">FiveSelf Studio · Personal. Beautiful. Elemental.</p>
  </div>
</div></body></html>`;
}

/** Simple parser for 命书 section headers like 「一、xxx | I. xxx」 */
function parseSections(text: string): Array<{titleCn:string;titleEn:string;bodyCn:string;bodyEn:string}> {
  if (!text || text.startsWith("[")) return [];
  const sections: Array<{titleCn:string;titleEn:string;bodyCn:string;bodyEn:string}> = [];
  const re = /[「【]([一二三四五六七八]、[^|」】]+)\s*\|\s*([^」】]+)[」】]/g;
  const matches: Array<{index:number;titleCn:string;titleEn:string}> = [];
  let m: RegExpExecArray|null;
  while ((m = re.exec(text)) !== null) {
    matches.push({index:m.index,titleCn:m[1].trim(),titleEn:m[2].trim()});
  }
  if (matches.length === 0) return [];
  for (let i=0;i<matches.length;i++) {
    const start = matches[i].index;
    const end = i<matches.length-1 ? matches[i+1].index : text.length;
    const content = text.substring(start,end);
    const headerEnd = content.indexOf("」");
    const body = headerEnd>0 ? content.substring(headerEnd+1).trim() : content;
    const parts = splitBilingual(body);
    sections.push({titleCn:matches[i].titleCn,titleEn:matches[i].titleEn,bodyCn:parts.cn,bodyEn:parts.en});
  }
  return sections;
}

function splitBilingual(body: string): {cn:string;en:string} {
  const lines = body.split("\n");
  const cnLines:string[]=[],enLines:string[]=[];
  let inEnglish = false;
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const asciiRatio = [...t].filter(c=>c.charCodeAt(0)<128).length/t.length;
    if (!inEnglish && asciiRatio>0.7 && /^[A-Z]/.test(t)) inEnglish=true;
    if (inEnglish) enLines.push(t); else cnLines.push(t);
  }
  if (!cnLines.length && enLines.length) return {cn:enLines.join("\n"),en:enLines.join("\n")};
  if (!enLines.length && cnLines.length) return {cn:cnLines.join("\n"),en:cnLines.join("\n")};
  return {cn:cnLines.join("\n"),en:enLines.join("\n")};
}

function escapeHTML(str: string): string {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
