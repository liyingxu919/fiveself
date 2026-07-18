import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "ssq";

  try {
    if (type === "ssq") {
      // cwl.gov.cn blocks overseas IPs, use 500.com instead
      const url = "https://datachart.500.com/ssq/history/newinc/history.php?start=25033&end=26999";
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://datachart.500.com/" },
      });
      const html = await res.text();
      const draws: any[] = [];
      const rows = html.match(/<tr class="t_tr1">[\s\S]*?<\/tr>/g) || [];
      for (const row of rows) {
        // 500.com uses 5-digit issue for SSQ: 26081 → convert to 7-digit 2026081
        const issueM = row.match(/<td[^>]*>(\d{5})<\/td>/);
        if (!issueM) continue;
        const shortIssue = issueM[1];
        const fullIssue = "20" + shortIssue; // 26081 → 2026081
        // 500.com SSQ uses class="t_cfont2" for front, "t_cfont4" for back
        const frontBalls = (row.match(/class="t_cfont2"[^>]*>(\d+)</g) || []).map((s: string) => parseInt(s.match(/>(\d+)</)![1]));
        const backBalls = (row.match(/class="t_cfont4"[^>]*>(\d+)</g) || []).map((s: string) => parseInt(s.match(/>(\d+)</)![1])).filter((n: number) => !isNaN(n));
        const dateM = row.match(/<td>(\d{4}-\d{2}-\d{2})<\/td>/g);
        const date = dateM ? dateM[dateM.length - 1].replace(/<\/?td>/g, "") : "";
        if (frontBalls.length >= 6 && backBalls.length >= 1) {
          const exists = draws.find((d: any) => d.issue === fullIssue);
          if (!exists) draws.push({ issue: fullIssue, date, front: frontBalls.slice(0, 6), back: backBalls.slice(0, 1) });
        }
      }
      draws.sort((a: any, b: any) => a.issue.localeCompare(b.issue));
      return NextResponse.json(draws.slice(-200));
    } else {
      const url = "https://datachart.500.com/dlt/history/newinc/history.php?start=25050&end=26999";
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://datachart.500.com/" },
      });
      const html = await res.text();
      const draws: any[] = [];
      const rows = html.match(/<tr class="t_tr1">[\s\S]*?<\/tr>/g) || [];
      for (const row of rows) {
        const issueM = row.match(/<td[^>]*>(\d{5,6})<\/td>/);
        if (!issueM) continue;
        const frontBalls = (row.match(/class="cfont2"[^>]*>(\d+)</g) || []).map((s: string) => parseInt(s.match(/>(\d+)</)![1]));
        const backBalls = (row.match(/class="cfont4"[^>]*>(\d+)</g) || []).map((s: string) => parseInt(s.match(/>(\d+)</)![1]));
        const dateM = row.match(/<td class="t_tr1">(\d{4}-\d{2}-\d{2})<\/td>/g);
        const date = dateM ? dateM[dateM.length - 1].match(/\d{4}-\d{2}-\d{2}/)![0] : "";
        if (frontBalls.length >= 5 && backBalls.length >= 2) {
          const exists = draws.find((d: any) => d.issue === issueM[1]);
          if (!exists) draws.push({ issue: issueM[1], date, front: frontBalls.slice(0, 5), back: backBalls.slice(0, 2) });
        }
      }
      draws.sort((a: any, b: any) => a.issue.localeCompare(b.issue));
      return NextResponse.json(draws.slice(-200));
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  return NextResponse.json([]);
}
