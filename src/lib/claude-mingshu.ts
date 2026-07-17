/**
 * Gemini 命书写作引擎 (免费)
 * 把结构化命理数据发给Gemini，让它以命理师口吻写独一无二的命书
 * 免费额度: 每分钟15次请求，足够用
 */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export interface MingShuInput {
  customerName: string; birthDate: string; birthTime?: string;
  bazi: string; ziwei: string; shenSha: string; dayun: string;
  strength: string; geJu: string; wuxing: string; shiShen: string;
}

const SYSTEM_INSTRUCTION = `你是一位从业三十年的资深命理师，精通滴天髓、穷通宝鉴、盲派命理和紫微斗数。

你的命书风格：
- 口语化但专业，像老师傅面谈，绝不用模板腔
- 必须引用命主的实际干支，具体到八字
- 有断有解，不仅说"如何"，还要说"为什么"和"怎么办"
- 适当引用古典，但必须解释清楚
- 500-800字，精炼有力
- 用中文撰写`;

export async function generateMingShu(input: MingShuInput): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  const prompt = `请为以下命主撰写一份专业命书。

【命主】${input.customerName}，${input.birthDate}出生${input.birthTime ? "，" + input.birthTime : ""}

【八字排盘】${input.bazi}
【五行】${input.wuxing}
【日主强弱】${input.strength}  【格局】${input.geJu}
【十神】${input.shiShen}  【神煞】${input.shenSha}
【紫微斗数】${input.ziwei}
【大运】${input.dayun}

请以资深命理师口吻撰写500-800字命书，总论→分论(性格/事业/财运/感情/健康)→大运流年→建议。`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2000, temperature: 0.8 },
        }),
      }
    );
    if (!res.ok) { console.error("Gemini error:", res.status, await res.text()); return null; }
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (e) {
    console.error("Gemini failed:", e);
    return null;
  }
}
