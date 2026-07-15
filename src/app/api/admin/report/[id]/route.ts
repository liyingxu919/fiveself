import { NextResponse } from "next/server";

const SANITY_QUERY = "https://penxmsws.api.sanity.io/v1/data/query/production";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const query = encodeURIComponent(`*[_type=="report"&&reportId=="${id}"][0]{content,customerName,customerEmail,status}`);
    const res = await fetch(`${SANITY_QUERY}?query=${query}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const json = await res.json();
    return NextResponse.json({ report: json?.result || null });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
