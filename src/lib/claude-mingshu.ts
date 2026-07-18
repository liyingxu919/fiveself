/**
 * 命书引擎: Gemini 2.0 Flash 主模型 + DeepSeek 兜底
 * 一次调用完成双语命书(简约版+完整版) + 五行蓝图JSON + 出生地方位分析
 */
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || "";

export interface MingShuInput {
  customerName: string; birthDate: string; birthTime?: string;
  bazi: string; ziwei: string; shenSha: string; dayun: string;
  strength: string; geJu: string; wuxing: string; shiShen: string;
  birthplace?: string; gender?: string;
  yongShen?: string; yongShenEn?: string; yongShenDirection?: string;
}

export interface MingShuResult {
  concise?: string;
  full?: string;
  blueprint?: any;
  birthplaceAnalysis?: string;
  error?: string;
  provider?: string;
}

function buildPrompt(input: MingShuInput): string {
  const genderLabel = input.gender === "female" ? "女士" : "先生";
  const genderPronoun = input.gender === "female" ? "她" : "他";
  const genderEn = input.gender === "female" ? "Ms." : "Mr.";
  const bpSection = input.birthplace
    ? `\n出生地：${input.birthplace}（结合用神分析适合的国家和城市）`
    : "";

  return `你是五玄斋资深命理师，精通《滴天髓》和盲派。盲派心法：①做功——看日主合什么制什么化什么，即"日主在干什么"；②宾主——年月为宾、日时为主，主位做功才真有用；③贼捕——忌神有没有被制住。用盲派视角分析。

命主是${genderLabel}（${genderEn} ${input.customerName}），全文用"${genderLabel}""${genderPronoun}"称呼，不可称"先生"。

【八字硬数据——不可修改】
姓名：${input.customerName}（${genderLabel}）
生辰：${input.birthDate}${input.birthTime ? " " + input.birthTime : ""}
八字：${input.bazi}
日主：${input.strength}
十神：${input.shiShen}
格局：${input.geJu}
用神：${input.yongShen||"待定"}
五行：${input.wuxing}
神煞：${input.shenSha}
大运：${input.dayun}${bpSection}

【数据约束】十神/格局/用神是计算结果，不可改。称呼必须用"${genderLabel}"。

【格式】禁止markdown。标题：「一、xxx | I. xxx」。先中后英。讲故事风格。

[CONCISE]
一、命盘总览 | I. Destiny Overview
二、性格特质 | II. Character
三、事业财运 | III. Career & Wealth
四、感情姻缘 | IV. Love & Relationships
五、健康养生 | V. Health & Wellness
六、大运趋势 | VI. Life Cycles
七、开运锦囊 | VII. Lucky Guidance
${input.birthplace ? "八、行运方位 | VIII. Travel & Relocation" : ""}
[END CONCISE]

[FULL]
一、命盘总览 | I. Destiny Overview
（盲派做功视角+日主特性，中文2-3段+English）
二、性格特质 | II. Character
（十神+神煞+日主五行，中文2-3段+English）
三、事业财运 | III. Career & Wealth
（格局+大运+用神方向，中文2-4段+English）
四、感情姻缘 | IV. Love & Relationships
（配偶宫+桃花+日支藏干，中文2-3段+English）
五、健康养生 | V. Health & Wellness
（五行偏枯+调候，中文2-3段+English）
六、大运起伏 | VI. Life Cycles
（逐运分析吉凶，中文3-4段+English）
七、开运锦囊 | VII. Lucky Guidance
（用神方向/颜色/贵人生肖/行业，中文2-3段+English）
${input.birthplace ? "八、行运方位 | VIII. Travel & Relocation\n（出生地+用神推荐城市和理由，中文2-3段+English）" : ""}
[END FULL]

[BLUEPRINT]
{"colors":{"primary":"#xxx","secondary":"#xxx","accent":"#xxx"},"totem":"图腾描述100字","keywords":["","",""],"lucky":{"color":"","place":"","time":""},"message":"寄语20字"}
[END BLUEPRINT]`;
}

function parseResponse(fullText: string): {
  concise: string; full: string; blueprint: any; birthplaceAnalysis: string;
} {
  let concise = "", full = "", blueprint: any = null, birthplaceAnalysis = "";

  const cMatch = fullText.match(/\[CONCISE\]([\s\S]*?)\[END CONCISE\]/i);
  if (cMatch) concise = cMatch[1].trim();

  const fMatch = fullText.match(/\[FULL\]([\s\S]*?)\[END FULL\]/i);
  if (fMatch) full = fMatch[1].trim();

  const bMatch = fullText.match(/\[BLUEPRINT\]([\s\S]*?)\[END BLUEPRINT\]/i);
  if (bMatch) {
    const jsonStr = bMatch[1].trim();
    const m = jsonStr.match(/\{[\s\S]*\}/);
    if (m) { try { blueprint = JSON.parse(m[0]); } catch { /* ignore */ } }
  }

  const bpMatch = fullText.match(/\[BIRTHPLACE\]([\s\S]*?)\[END BIRTHPLACE\]/i);
  if (bpMatch) birthplaceAnalysis = bpMatch[1].trim();

  // Fallback: if no concise, use full as both
  if (!concise && full) concise = full;
  if (!full && concise) full = concise;

  return { concise, full, blueprint, birthplaceAnalysis };
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: "你是五玄斋资深命理师，为全球双语用户解读八字。风格：智慧长者品茶聊天，娓娓道来。输出必须按指定格式：先[CONCISE]简约版(1500字中英合计)，再[FULL]完整版(4000字中英合计)，再[BLUEPRINT]蓝图JSON。禁止markdown符号，中文用中文标点，英文用英文标点。" }]
        },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 6000, temperature: 0.8 },
      }),
    }
  );
  if (!res.ok) { const et = await res.text(); throw new Error(`Gemini HTTP ${res.status}: ${et.slice(0, 200)}`); }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`Gemini empty: ${JSON.stringify(data).slice(0, 200)}`);
  return text;
}

async function callDeepSeek(prompt: string): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${DEEPSEEK_KEY}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "你是五玄斋资深命理师，为全球双语用户解读八字。风格：智慧长者品茶聊天。输出按指定格式：[CONCISE]...[FULL]...[BLUEPRINT]...。禁止markdown符号。" },
        { role: "user", content: prompt },
      ],
      max_tokens: 6000,
      temperature: 0.8,
    }),
  });
  if (!res.ok) { const et = await res.text(); throw new Error(`DeepSeek HTTP ${res.status}: ${et.slice(0, 200)}`); }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error(`DeepSeek empty: ${JSON.stringify(data).slice(0, 200)}`);
  return text;
}

export async function generateMingShu(input: MingShuInput): Promise<MingShuResult> {
  const prompt = buildPrompt(input);

  if (GEMINI_KEY) {
    try {
      const raw = await callGemini(prompt);
      const parsed = parseResponse(raw);
      return { ...parsed, provider: "gemini-2.0-flash" };
    } catch (e: any) {
      console.warn("[Gemini failed, trying DeepSeek]:", e.message);
      if (DEEPSEEK_KEY) {
        try {
          const raw = await callDeepSeek(prompt);
          const parsed = parseResponse(raw);
          return { ...parsed, provider: "deepseek-chat" };
        } catch (e2: any) {
          return { error: `Gemini: ${e.message} | DeepSeek: ${e2.message}` };
        }
      }
      return { error: `${e.message} | DeepSeek未配置（在Vercel加DEEPSEEK_API_KEY即可自动切换）` };
    }
  }

  if (DEEPSEEK_KEY) {
    try {
      const raw = await callDeepSeek(prompt);
      const parsed = parseResponse(raw);
      return { ...parsed, provider: "deepseek-chat" };
    } catch (e: any) {
      return { error: `DeepSeek: ${e.message}` };
    }
  }

  return { error: "No API key configured." };
}

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
