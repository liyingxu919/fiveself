import { NextResponse } from "next/server";

const SANITY_QUERY = "https://penxmsws.api.sanity.io/v1/data/query/production";

export async function GET() {
  try {
    const query = encodeURIComponent('*[_type=="report"]|order(generatedAt desc){reportId,customerName,customerEmail,birthDate,"status":coalesce(status,"pending_review"),generatedAt}');
    const res = await fetch(`${SANITY_QUERY}?query=${query}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return NextResponse.json({ error: "Sanity unavailable" }, { status: 502 });
    const json = await res.json();
    return NextResponse.json({ reports: json?.result || [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
