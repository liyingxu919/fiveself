import { NextResponse } from "next/server";
import { calculateBazi } from "@/lib/bazi";
import { generateReportContent } from "@/lib/report-generator";

// Resend API for email delivery (https://resend.com)
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "hello@orientaldestiny.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, year, month, day, hour, birthplace, product, notes } = body;

    // Validate required fields
    if (!name || !email || !year || !month || !day) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, year, month, day" },
        { status: 400 }
      );
    }

    const y = parseInt(year), m = parseInt(month), d = parseInt(day);
    const h = hour !== "" && hour !== undefined ? parseInt(hour) : 12; // default noon

    if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31 || h < 0 || h > 23) {
      return NextResponse.json(
        { error: "Invalid date/time values" },
        { status: 400 }
      );
    }

    // Calculate Bazi
    const bazi = calculateBazi({ year: y, month: m, day: d, hour: h });

    // Generate report content
    const report = generateReportContent(
      bazi,
      name,
      `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      `${String(h).padStart(2, "0")}:00`
    );

    // Build HTML email
    const htmlEmail = buildEmailHTML(report, product || "five-elements-blueprint");

    // Send email via Resend (or fallback to logging)
    let emailSent = false;
    if (RESEND_API_KEY && RESEND_API_KEY !== "resend_api_key_here") {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: `Oriental Aesthetic <${FROM_EMAIL}>`,
            to: [email],
            subject: `Your Five Elements Blueprint — ${report.reportId}`,
            html: htmlEmail,
          }),
        });

        if (res.ok) {
          emailSent = true;
        } else {
          const errBody = await res.text();
          console.error("Resend error:", res.status, errBody);
        }
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
      }
    }

    // If no email configured, save report to Sanity or log
    if (!emailSent) {
      console.log(`[REPORT] ${report.reportId} for ${name} <${email}>`);
      console.log(`  Bazi: ${report.baziDisplay.year} ${report.baziDisplay.month} ${report.baziDisplay.day} ${report.baziDisplay.hour}`);
      console.log(`  Day Master: ${report.dayMaster.gan}(${report.dayMaster.wuxing})`);
      console.log(`  Profile: ${report.elementAnalysis.profile}`);
    }

    return NextResponse.json({
      success: true,
      reportId: report.reportId,
      emailSent,
      preview: {
        dayMaster: report.dayMaster,
        bazi: report.baziDisplay,
        elementAnalysis: report.elementAnalysis,
        colorPalette: report.colorPalette,
      },
    });
  } catch (err) {
    console.error("Report generation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function buildEmailHTML(report: ReturnType<typeof generateReportContent>, product: string): string {
  const wd = report.wuxingDistribution;
  const dm = report.dayMaster;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: Georgia, serif; background: #F9F6F0; padding: 40px 20px;">
<div style="max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #E3DBCC; padding: 40px;">

  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 400; font-size: 28px; color: #2B2318; margin: 0 0 8px;">
      Your Five Elements Blueprint
    </h1>
    <p style="color: #8A8178; font-size: 13px; margin: 0;">
      A Personal Visual Publication &middot; ${report.reportId}
    </p>
  </div>

  <div style="background: #F3EFE7; padding: 24px; margin-bottom: 24px; text-align: center;">
    <p style="color: #8A8178; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 4px;">Your Day Master</p>
    <p style="font-size: 36px; color: ${dm.color}; margin: 0; font-weight: 400;">
      ${dm.gan} <span style="font-size: 16px; color: #8A8178;">(${dm.wuxing})</span>
    </p>
  </div>

  <h2 style="font-size: 18px; color: #2B2318; margin: 24px 0 12px; font-weight: 400;">
    Five Element Distribution
  </h2>
  ${wd.map(w => `
    <div style="margin-bottom: 8px;">
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #3A342C; margin-bottom: 2px;">
        <span>${w.nameEn} ${w.name}</span><span>${w.count} (${w.percentage}%)</span>
      </div>
      <div style="height: 8px; background: #EDE8DE; border-radius: 2px;">
        <div style="height: 8px; width: ${w.barWidth}%; background: ${w.color}; border-radius: 2px;"></div>
      </div>
    </div>
  `).join("")}

  <h2 style="font-size: 18px; color: #2B2318; margin: 24px 0 12px; font-weight: 400;">
    Your Color Palette
  </h2>
  <div style="display: flex; gap: 8px; margin-bottom: 24px;">
    ${report.colorPalette.map(c => `
      <div style="flex: 1; text-align: center;">
        <div style="height: 48px; background: ${c.hex}; border-radius: 2px; margin-bottom: 4px;"></div>
        <p style="font-size: 8px; color: #8A8178; margin: 0;">${c.name}</p>
      </div>
    `).join("")}
  </div>

  <div style="background: #F9F6F0; padding: 20px; margin: 24px 0;">
    <p style="font-size: 13px; color: #3A342C; margin: 0 0 8px;">
      <strong>${report.elementAnalysis.dominant.nameEn} ${report.elementAnalysis.dominant.name}</strong>
    </p>
    <p style="font-size: 12px; color: #8A8178; margin: 0; line-height: 1.6;">
      ${report.elementAnalysis.dominant.descEn}
      <br>${report.elementAnalysis.dominant.desc}
    </p>
  </div>

  <div style="text-align: center; padding-top: 24px; border-top: 1px solid #E3DBCC; margin-top: 32px;">
    <p style="font-size: 13px; color: #2B2318; margin: 0 0 4px;">
      Your complete Blueprint PDF will be delivered within 3–5 business days.
    </p>
    <p style="font-size: 11px; color: #8A8178; margin: 0;">
      Oriental Aesthetic Studio &middot; Personal. Beautiful. Elemental.
    </p>
  </div>

</div></body></html>`;
}
