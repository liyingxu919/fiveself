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
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#F9F6F0;padding:40px 20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #E3DBCC;padding:40px;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="font-weight:400;font-size:28px;color:#2B2318;margin:0 0 8px;">Your Five Elements Blueprint</h1>
    <p style="color:#8A8178;font-size:13px;margin:0;">A Personal Visual Publication · ${content?.reportId || ""}</p>
    <p style="color:#8A8178;font-size:12px;margin:4px 0 0;">Prepared for ${name || "you"}</p>
  </div>
  ${dm ? `<div style="background:#F3EFE7;padding:24px;margin-bottom:24px;text-align:center;">
    <p style="color:#8A8178;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 4px;">Your Day Master</p>
    <p style="font-size:36px;color:${dm.color};margin:0;font-weight:400;">${dm.gan} <span style="font-size:16px;color:#8A8178;">(${dm.wuxing})</span></p>
  </div>` : ""}
  <div style="text-align:center;margin:32px 0;">
    <a href="${reportUrl}" style="display:inline-block;background:#26382c;color:#fff;padding:14px 32px;text-decoration:none;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">View Your Full Report →</a>
    <p style="color:#8A8178;font-size:11px;margin:8px 0 0;">Open and print to PDF for your personal copy</p>
  </div>
  <div style="text-align:center;padding-top:24px;border-top:1px solid #E3DBCC;margin-top:32px;">
    <p style="font-size:11px;color:#8A8178;margin:0;">FiveSelf Studio · Personal. Beautiful. Elemental.</p>
  </div>
</div></body></html>`;
}
