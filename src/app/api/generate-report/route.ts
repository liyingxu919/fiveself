import { NextResponse } from "next/server";
import { calculateBazi } from "@/lib/bazi";
import { generateReportContent } from "@/lib/report-generator";
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "penxmsws";
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const SANITY_WRITE_TOKEN = process.env.SANITY_WRITE_TOKEN || "";
const SANITY_API = `https://${SANITY_PROJECT_ID}.api.sanity.io/v1/data/mutate/${SANITY_DATASET}`;

// Resend API for email delivery (https://resend.com)
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "hello@fiveself.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fiveself.com";

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

    // Save report to Sanity for online access
    const reportUrl = `${SITE_URL}/report/${report.reportId}`;
    let reportSaved = false;
    let saveError = "";
    if (SANITY_WRITE_TOKEN) {
      try {
        const saveRes = await fetch(SANITY_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SANITY_WRITE_TOKEN}`,
          },
          body: JSON.stringify({
            mutations: [{
              create: {
                _type: "report",
                reportId: report.reportId,
                customerName: name,
                customerEmail: email,
                birthDate: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
                content: JSON.stringify(report),
                generatedAt: new Date().toISOString(),
              },
            }],
          }),
        });
        if (saveRes.ok) {
          reportSaved = true;
        } else {
          saveError = `Sanity HTTP ${saveRes.status}: ${await saveRes.text()}`;
        }
      } catch (err: any) {
        saveError = err?.message || String(err);
      }
    } else {
      saveError = `Token status: PROJECT=${SANITY_PROJECT_ID}, TOKEN_LEN=${SANITY_WRITE_TOKEN.length}, DATASET=${SANITY_DATASET}`;
    }

    // Build HTML email with report link
    const htmlEmail = buildEmailHTML(report, product || "five-elements-blueprint", reportUrl);

    // Send email via Resend
    let emailSent = false;
    if (RESEND_API_KEY && RESEND_API_KEY !== "re_placeholder_replace_with_your_key") {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: `FiveSelf <${FROM_EMAIL}>`,
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

    // Fallback logging
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
      reportSaved,
      reportUrl: reportSaved ? reportUrl : null,
      saveError: saveError || null,
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

function buildEmailHTML(report: ReturnType<typeof generateReportContent>, product: string, reportUrl: string): string {
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
    <p style="color: #8A8178; font-size: 12px; margin: 4px 0 0;">
      Prepared for ${report.customerName}
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
        <div style="height: 8px; width: ${Math.max(3, w.barWidth)}%; background: ${w.color}; border-radius: 2px;"></div>
      </div>
    </div>
  `).join("")}

  <div style="background: #F9F6F0; padding: 20px; margin: 24px 0;">
    <p style="font-size: 13px; color: #3A342C; margin: 0 0 8px;">
      <strong>${report.elementAnalysis.dominant.nameEn} ${report.elementAnalysis.dominant.name}</strong>
    </p>
    <p style="font-size: 12px; color: #8A8178; margin: 0; line-height: 1.6;">
      ${report.elementAnalysis.dominant.descEn}
    </p>
  </div>

  <!-- View Full Report Button -->
  <div style="text-align: center; margin: 32px 0;">
    <a href="${reportUrl}" style="display: inline-block; background: #26382c; color: #fff; padding: 14px 32px; text-decoration: none; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;">
      View Your Full Report →
    </a>
    <p style="color: #8A8178; font-size: 11px; margin: 8px 0 0;">
      Open and print to PDF for your personal copy
    </p>
  </div>

  <div style="text-align: center; padding-top: 24px; border-top: 1px solid #E3DBCC; margin-top: 32px;">
    <p style="font-size: 11px; color: #8A8178; margin: 0;">
      FiveSelf Studio &middot; Personal. Beautiful. Elemental.
    </p>
  </div>

</div></body></html>`;
}
