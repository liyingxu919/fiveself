/**
 * 命书引擎: Gemini 2.5 Flash 主模型 + DeepSeek 兜底
 * 一次调用完成命书正文 + 五行蓝图JSON
 */
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || "";

export interface MingShuInput {
  customerName: string; birthDate: string; birthTime?: string;
  bazi: string; ziwei: string; shenSha: string; dayun: string;
  strength: string; geJu: string; wuxing: string; shiShen: string;
}

export interface MingShuResult {
  text?: string;
  blueprint?: any;
  error?: string;
  provider?: string; // which model served the request
}

function buildPrompt(input: MingShuInput): string {
  return `你是资深命理师+东方美学设计师。请为命主${input.customerName}（${input.birthDate}出生）完成两项任务，一并回复。

【命主八字】
八字四柱：${input.bazi}
五行分布：${input.wuxing}
格局：${input.geJu}
日主强弱：${input.strength}
十神配置：${input.shiShen}
神煞：${input.shenSha}
紫微斗数：${input.ziwei}
大运流转：${input.dayun}

【任务一：撰写命书（1200-1800字）】

一、命盘总览——日主特性、五行气势、格局高低，点出核心特点
二、性格性情——日主+十神+神煞分析，具体到干支
三、事业财运——格局配大运看方向，财官印食分明
四、感情姻缘——配偶宫+桃花+日支藏干
五、健康养生——五行偏枯对应身体注意事项
六、大运起伏——各步大运吉凶变化
七、开运建议——用神对应方向、颜色、贵人

要求：口语化但专业，具体到干支（如"甲木参天""丙火暖局"），有断有解，不经用套话。每段起小标题。

【任务二：五行蓝图JSON】
根据命书设计视觉方案，回复如下JSON：
{"colors":{"primary":"#xxx","secondary":"#xxx","accent":"#xxx"},"totem":"图腾描述100字","keywords":["","",""],"lucky":{"color":"","place":"","time":""},"message":"寄语20字"}

===回复格式===
先写完整命书正文，然后单独一行写【JSON】，再写蓝图JSON。`;
}

/** 解析 Gemini/DeepSeek 返回的文本，分离命书+蓝图JSON */
function parseResponse(fullText: string): { text: string; blueprint: any } {
  const jsonMarker = fullText.indexOf("【JSON】");
  let mingshuText = "";
  let blueprint: any = null;

  if (jsonMarker > 0) {
    mingshuText = fullText.substring(0, jsonMarker).trim();
    const jsonPart = fullText.substring(jsonMarker + 6).trim();
    const match = jsonPart.match(/\{[\s\S]*\}/);
    if (match) {
      try { blueprint = JSON.parse(match[0]); } catch { /* ignore */ }
    }
  } else {
    mingshuText = fullText;
    const match = fullText.match(/\{[\s\S]*"colors"[\s\S]*\}/);
    if (match) {
      mingshuText = fullText.substring(0, fullText.indexOf(match[0])).trim();
      try { blueprint = JSON.parse(match[0]); } catch { /* ignore */ }
    }
  }

  return { text: mingshuText, blueprint };
}

/** 主模型: Gemini 2.0 Flash */
async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: "你是资深命理师兼东方美学设计师。命书风格：口语化、具体到干支、有断有解。按指定格式回复：先命书正文，再【JSON】标记，再蓝图JSON。" }]
        },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 6000, temperature: 0.8 },
      }),
    }
  );

  if (!res.ok) {
    const et = await res.text();
    throw new Error(`Gemini HTTP ${res.status}: ${et.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`Gemini empty: ${JSON.stringify(data).slice(0, 200)}`);
  return text;
}

/** 兜底模型: DeepSeek (OpenAI-compatible) */
async function callDeepSeek(prompt: string): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "你是资深命理师兼东方美学设计师。命书风格：口语化、具体到干支、有断有解。按指定格式回复：先命书正文，再【JSON】标记，再蓝图JSON。" },
        { role: "user", content: prompt },
      ],
      max_tokens: 6000,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const et = await res.text();
    throw new Error(`DeepSeek HTTP ${res.status}: ${et.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error(`DeepSeek empty: ${JSON.stringify(data).slice(0, 200)}`);
  return text;
}

/** 生成命书: Gemini优先 → DeepSeek兜底 */
export async function generateMingShu(input: MingShuInput): Promise<MingShuResult> {
  const prompt = buildPrompt(input);

  // 1) Try Gemini 2.5 Flash
  if (GEMINI_KEY) {
    try {
      const raw = await callGemini(prompt);
      const parsed = parseResponse(raw);
      return { ...parsed, provider: "gemini-2.0-flash" };
    } catch (e: any) {
      const geminiErr = e?.message || String(e);
      console.warn("[Gemini failed, trying DeepSeek]:", geminiErr);

      // 2) Fallback to DeepSeek
      if (DEEPSEEK_KEY) {
        try {
          const raw = await callDeepSeek(prompt);
          const parsed = parseResponse(raw);
          return { ...parsed, provider: "deepseek-chat" };
        } catch (e2: any) {
          return { error: `Gemini: ${geminiErr} | DeepSeek: ${e2?.message || String(e2)}` };
        }
      }

      // DeepSeek not configured — return Gemini error with hint
      return { error: `${geminiErr} | DeepSeek未配置（在Vercel加DEEPSEEK_API_KEY即可自动切换）` };
    }
  }

  // No Gemini key, try DeepSeek directly
  if (DEEPSEEK_KEY) {
    try {
      const raw = await callDeepSeek(prompt);
      const parsed = parseResponse(raw);
      return { ...parsed, provider: "deepseek-chat" };
    } catch (e: any) {
      return { error: `DeepSeek: ${e?.message || String(e)}` };
    }
  }

  return { error: "No API key configured. Set GEMINI_API_KEY or DEEPSEEK_API_KEY." };
}

/** Pollinations.ai 生成五行图腾图片URL */
export function getTotemImageUrl(
  input: MingShuInput,
  totemDesc?: { cn?: string; en?: string; elements?: string[] }
): string {
  const elements = totemDesc?.elements?.join(",") || "";
  const prompt = encodeURIComponent(
    `Chinese ink wash painting, ${totemDesc?.cn || input.wuxing + " totem"}, ${totemDesc?.en || "oriental five elements"}, ${elements}, misty ethereal, gold leaf details, silk scroll texture, Song dynasty aesthetic, masterpiece, spiritual, traditional Chinese art, vertical composition`
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&model=flux&nologo=true&seed=${Date.now() % 100000}`;
}
