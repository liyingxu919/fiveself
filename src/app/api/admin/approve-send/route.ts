import { NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "hello@fiveself.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fiveself.com";

const SANITY_API = "https://penxmsws.api.sanity.io/v1/data/mutate/production";
const SANITY_QUERY = "https://penxmsws.apicdn.sanity.io/v1/data/query/production";

export async function POST(request: Request) {
  try {
    const { reportId, email, name, editedContent } = await request.json();
    if (!reportId) return NextResponse.json({ error: "Missing reportId" }, { status: 400 });

    // Update report in Sanity with edited content + mark as approved
    const token = process.env.SANITY_WRITE_TOKEN || "";
    if (token) {
      // Find the report document ID first
      const qRes = await fetch(`${SANITY_QUERY}?query=${encodeURIComponent(`*[_type=="report"&&reportId=="${reportId}"][0]{_id}`)}`);
      const qJson = await qRes.json();
      const docId = qJson?.result?._id;
      if (docId) {
        await fetch(SANITY_API, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            mutations: [{
              patch: {
                id: docId,
                set: {
                  content: typeof editedContent === "string" ? editedContent : JSON.stringify(editedContent),
                  status: "approved",
                  approvedAt: new Date().toISOString(),
                },
              },
            }],
          }),
        });
      }
    }

    // Build email and send
    const reportUrl = `${SITE_URL}/report/${reportId}`;
    let emailSent = false;
    if (RESEND_API_KEY && email) {
      const content = typeof editedContent === "string" ? JSON.parse(editedContent) : editedContent;
      const dm = content?.dayMaster;
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from: `FiveSelf <${FROM_EMAIL}>`,
            to: [email],
            subject: `Your Five Elements Blueprint — ${reportId}`,
            html: buildApprovedEmail(name, dm, reportUrl, content),
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

function buildApprovedEmail(name: string, dm: any, reportUrl: string, content: any): string {
  const ed = content?.wuxingDistribution || [];
  const an = content?.elementAnalysis;
  const bz = content?.baziDisplay;
  const cp = content?.colorPalette || [];
  const dmC = dm?.color || "#C4A882";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,'Noto Serif SC',serif;background:#FBF7F2;padding:40px 20px;">
<div style="max-width:600px;margin:0 auto;background:#FFFCF9;border:1px solid #E8E0D5;padding:40px;">

  <div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid #E8E0D5;">
    <p style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#9B8E84;margin:0 0 20px;">Five Elements Blueprint</p>
    <h1 style="font-weight:300;font-size:32px;color:#3D322C;margin:0 0 4px;">五行个人蓝图</h1>
    <div style="display:inline-block;width:80px;height:80px;border-radius:50%;background:${dmC};margin:20px auto;line-height:80px;font-size:32px;font-weight:300;color:#fff;">${dm?.gan||""}</div>
    <p style="font-size:18px;color:${dmC};margin:0 0 4px;">${dm?.ganEn||""} · ${dm?.wuxingEn||""} · ${dm?.wuxing||""}</p>
    <p style="color:#9B8E84;font-size:13px;margin:8px 0 0;">Prepared for <strong style="color:#3D322C">${name||"you"}</strong> · ${content?.birthDate||""}</p>
  </div>

  ${bz ? `
  <h2 style="font-size:16px;font-weight:400;color:#3D322C;margin:24px 0 12px;">完整生辰八字 · Birth Chart</h2>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:24px;">
    ${[["年Year",bz.year,bz.yearEn],["月Month",bz.month,bz.monthEn],["日Day",bz.day,bz.dayEn],["时Hour",bz.hour,bz.hourEn]].map(([l,zh,en])=>`
      <div style="background:#FBF7F2;border:1px solid #E8E0D5;padding:12px 8px;text-align:center;">
        <p style="font-size:8px;color:#9B8E84;text-transform:uppercase;margin:0 0 6px;">${l}</p>
        <p style="font-size:18px;margin:0 0 2px;font-weight:300;">${zh}</p>
        <p style="font-size:10px;color:#9B8E84;margin:0;">${en}</p>
      </div>
    `).join("")}
  </div>` : ""}

  ${ed.length > 0 ? `
  <h2 style="font-size:16px;font-weight:400;color:#3D322C;margin:24px 0 12px;">五行分布 · Element Distribution</h2>
  ${ed.map((w:any,i:number)=>`
    <div style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#3D322C;margin-bottom:3px;"><span>${w.nameEn} ${w.name}</span><span style="color:#9B8E84">${w.count} (${w.percentage}%)</span></div>
      <div style="height:8px;background:#E8E0D5;border-radius:4px;"><div style="height:8px;width:${Math.max(3,w.barWidth)}%;background:${["#8B9D83","#C2856A","#B8A080","#9B8E84","#7B95A8"][i]||dmC};border-radius:4px;"></div></div>
    </div>
  `).join("")}` : ""}

  ${cp.length > 0 ? `
  <h2 style="font-size:16px;font-weight:400;color:#3D322C;margin:24px 0 12px;">幸运颜色 · Lucky Colors</h2>
  <div style="display:flex;gap:8px;margin-bottom:24px;">
    ${cp.map((c:any)=>`<div style="flex:1;text-align:center;"><div style="height:40px;background:${c.hex};border-radius:20px;margin-bottom:4px;"></div><p style="font-size:8px;color:#9B8E84;margin:0;">${c.name}</p></div>`).join("")}
  </div>` : ""}

  ${an?.dominant ? `
  <div style="background:#FBF7F2;padding:20px;border:1px solid #E8E0D5;margin:20px 0;">
    <p style="font-size:11px;color:#9B8E84;margin:0 0 6px;">用神 · Yong Shen</p>
    <p style="font-size:22px;color:${dmC};margin:0 0 6px;font-weight:300;">${an.dominant.nameEn} ${an.dominant.name}</p>
    <p style="font-size:12px;line-height:1.7;color:#3D322C;margin:0;">${an.dominant.descEn}</p>
  </div>` : ""}

  <div style="text-align:center;margin:32px 0;">
    <a href="${reportUrl}" style="display:inline-block;background:#C4A882;color:#fff;padding:14px 32px;text-decoration:none;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;border-radius:2px;">View Full Report →</a>
    <p style="color:#9B8E84;font-size:10px;margin:8px 0 0;">Open your complete blueprint · Download as PDF</p>
  </div>

  <div style="text-align:center;padding-top:20px;border-top:1px solid #E8E0D5;">
    <p style="font-size:11px;color:#9B8E84;margin:0;">FiveSelf Studio · Personal. Beautiful. Elemental.</p>
  </div>
</div></body></html>`;
}
