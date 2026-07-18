import { NextResponse } from "next/server";
import { calculateBazi } from "@/lib/bazi";
import { generateReportContent } from "@/lib/report-generator";
import { getZiweiChart } from "@/lib/ziwei-engine";
import { generateMingShu, getTotemImageUrl } from "@/lib/claude-mingshu";
const SANITY_PROJECT_ID = "penxmsws";
const SANITY_DATASET = "production";
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

    // Calculate 紫微斗数
    const ziwei = getZiweiChart(y, m, d, h, "male");

    // Generate report content
    const report = generateReportContent(
      bazi,
      name,
      `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      `${String(h).padStart(2, "0")}:00`
    );

    // Attach 紫微 data
    const fullContent = { ...report, ziwei };

    // Call Gemini to write authentic 命书 prose
    const mingShuInput = {
      customerName: name,
      birthDate: `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`,
      birthTime: `${String(h).padStart(2,"0")}:00`,
      bazi: `${fullContent.baziDisplay.year}年 ${fullContent.baziDisplay.month}月 ${fullContent.baziDisplay.day}日 ${fullContent.baziDisplay.hour}时`,
      ziwei: ziwei?.analysis || "",
      shenSha: fullContent.shenSha?.join("、") || "",
      dayun: (fullContent.dayun || []).map((d:any) => `${d.age}${d.ganzhi}(${d.nayin})`).join("；"),
      strength: fullContent.disuitianshu?.analysis || "",
      geJu: fullContent.geJu?.analysis || "",
      wuxing: fullContent.elementAnalysis?.profile || "",
      shiShen: fullContent.shiShen?.explanation || "",
    };
    let aiMingShu = "";
    let aiBlueprint: any = null;
    let geminiError = "";
    try {
      const result = await generateMingShu(mingShuInput);
      if (result?.text) {
        aiMingShu = result.text;
        aiBlueprint = result.blueprint || null;
      }
      if (result?.error) {
        geminiError = result.error;
        aiMingShu = `[Gemini: ${result.error}]`;
      }
    } catch (e: any) {
      geminiError = e?.message || String(e);
      aiMingShu = `[Gemini异常: ${geminiError}]`;
    }
    const totemImageUrl = getTotemImageUrl(mingShuInput, fullContent.totemDescription);
    const contentWithAI = { ...fullContent, aiMingShu, aiBlueprint, totemImageUrl, geminiError };

    // Save report to Sanity for online access
    const reportUrl = `${SITE_URL}/report/${report.reportId}`;
    let reportSaved = false;
    let saveError = "";
    const writeToken = process.env.SANITY_WRITE_TOKEN || "";
    if (writeToken) {
      try {
        const saveRes = await fetch(SANITY_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${writeToken}`,
          },
          body: JSON.stringify({
            mutations: [{
              create: {
                _type: "report",
                reportId: report.reportId,
                customerName: name,
                customerEmail: email,
                birthDate: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
                content: JSON.stringify(contentWithAI),
                generatedAt: new Date().toISOString(),
                status: "pending_review",
              },
            }],
          }),
        });
        const saveBody = await saveRes.text();
        if (saveRes.ok) {
          reportSaved = true;
        } else {
          saveError = `Sanity ${saveRes.status}: ${saveBody}`;
        }
      } catch (err: any) {
        saveError = err?.message || String(err);
      }
    } else {
      saveError = "no_token";
    }

    // Report saved for review - 命理师审核通过后发送邮件
    return NextResponse.json({
      success: true,
      version: "v7.0-Gemini+ChatGPT双AI",
      reportId: contentWithAI.reportId,
      emailSent: false,
      reportSaved,
      reportUrl: reportSaved ? reportUrl : null,
      saveError: saveError || null,
      status: "pending_review",
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
