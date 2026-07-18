import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "ssq";

  try {
    if (type === "ssq") {
      const url = "https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?name=ssq&issueCount=&pageNo=1&pageSize=200&systemType=PC";
      const res = await fetch(url, { headers: { Referer: "https://www.cwl.gov.cn/" } });
      const raw = await res.json();
      if (raw.result && Array.isArray(raw.result)) {
        const draws = raw.result.map((r: any) => ({
          issue: String(r.code || ""),
          date: String(r.date || "").slice(0, 10).replace(/\(.\)$/, ""),
          front: (r.red || "").split(",").map(Number).filter((n: number) => n > 0),
          back: [Number(r.blue)].filter((n: number) => n > 0),
        }));
        draws.reverse();
        return NextResponse.json(draws);
      }
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
