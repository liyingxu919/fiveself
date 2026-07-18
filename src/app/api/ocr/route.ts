import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const mode = (formData.get("mode") as string) || "detect";

    if (!image) {
      return NextResponse.json({ error: "请上传图片" }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64 = buffer.toString("base64");

    const prompt =
      mode === "detect"
        ? `这张图是试卷。找出每一道带编号的题目(如 1. 2. 或 (1)(2) 或 一、二)。对每道题返回JSON: [{"num":"1","label":"题目前几个字","x1":左%,"y1":上%,"x2":右%,"y2":下%}]。只回JSON数组。`
        : `请识别图片中的数学题文字。公式用LaTeX。只输出识别文字, 不加解释。`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/jpeg", data: base64 } },
            ],
          }],
          generationConfig: { maxOutputTokens: mode === "detect" ? 1500 : 800, temperature: 0.3 },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Gemini ${res.status}: ${errText.slice(0, 200)}` }, { status: 500 });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
