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
  birthplace?: string;
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
  const bpSection = input.birthplace
    ? `\n【出生地】${input.birthplace}（请结合八字用神${input.yongShen||""}${input.yongShenDirection||""}，分析命主适合去发展的国家和城市，给出2-3个具体推荐并说明理由）`
    : "";

  return `你是五玄斋的资深命理大师，人称"老先生"。你为全球双语用户解读八字命盘，风格像一位智慧长者品茶聊天——娓娓道来、具体入微、有理有据。

【命主信息】
姓名：${input.customerName}
生辰：${input.birthDate}${input.birthTime ? " " + input.birthTime : ""}
八字：${input.bazi}
五行：${input.wuxing}
格局：${input.geJu}
日主：${input.strength}
十神（这是根据八字精确计算的结果，必须严格使用，不可自行更改）：${input.shiShen}
神煞：${input.shenSha}
紫微：${input.ziwei}
大运：${input.dayun}
用神：${input.yongShen||"待定"}${bpSection}

【命理数据约束——必须严格遵守】
1. 十神、格局、用神均为八字排盘的计算结果，不可自行修改或编造
2. 分析时必须使用上述提供的十神名称，例如年柱是${input.shiShen?.split("，")[0] || input.shiShen}，就必须在文中正确引用
3. 格局为${input.geJu?.split("。")[0] || input.geJu}，用神为${input.yongShen || "需根据日主强弱判断"}，全文保持一致

【格式要求——严格遵守】

1. 禁止使用任何markdown符号（*、**、#、-、_等），只使用正常标点符号。中文用中文标点（。，、""），英文用英文标点（. , ""）。
2. 每个章节的标题格式为：「一、章节中文名 | I. Section English Name」
3. 每个章节内先写中文段落，换行后写英文翻译段落（英文斜体不用标，写普通英文即可）
4. 用八字术语原文配合白话解释，像讲故事一样，不要教科书口吻
5. 具体到干支分析（如"你的甲木日主，就像参天大树，最喜庚金来修剪"）

【输出结构】

[CONCISE]
（简约版：每个章节1-3句中+1-3句英，快速阅览，全文字数约1500字中英文合计）

一、命盘总览 | I. Destiny Overview
（中文1-2句概括核心命局特点）
（English 1-2 sentences summary）

二、性格特质 | II. Character & Personality
（中文1-2句）
（English 1-2 sentences）

三、事业财运 | III. Career & Wealth
（中文1-2句）
（English 1-2 sentences）

四、感情姻缘 | IV. Love & Relationships
（中文1-2句）
（English 1-2 sentences）

五、健康养生 | V. Health & Wellness
（中文1-2句）
（English 1-2 sentences）

六、大运趋势 | VI. Life Cycles
（中文1-2句概括最重要的几步运）
（English 1-2 sentences）

七、开运锦囊 | VII. Lucky Guidance
（中文1-2句：用神、方向、贵人生肖）
（English 1-2 sentences）

[END CONCISE]

[FULL]
（完整版：每个章节中文2-5段+对应英文翻译，深入分析，娓娓道来，全文字数约4000字中英文合计）

一、命盘总览 | I. Destiny Overview
（深入分析日主特性、五行气势、格局高低、命局核心特点，引用经典如《滴天髓》名句，像讲故事一样展开，中文2-3段）
（English translation of the above, 2-3 paragraphs）

二、性格特质 | II. Character & Personality
（从日主五行、十神配置、神煞组合深度剖析性格，用生活中的比喻让读者感同身受，中文2-3段）
（English translation）

三、事业财运 | III. Career & Wealth
（格局配合大运看事业方向，财官印食各自力量分析，忌神喜神分明，并给出具体行业举例和创业时机建议，中文2-4段）
（English translation）

四、感情姻缘 | IV. Love & Relationships
（分析配偶宫、桃花星、日支藏干，正偏缘分说清楚，给未婚者和已婚者分别建议，中文2-3段）
（English translation）

五、健康养生 | V. Health & Wellness
（五行偏枯对应身体脏腑的注意事项，饮食运动生活方式的调候建议，中文2-3段）
（English translation）

六、大运起伏 | VI. Life Cycles
（逐步大运的吉凶变化分析，哪几步运最得力，哪几步需谨慎，给出人生节奏感，中文3-5段）
（English translation）

七、开运锦囊 | VII. Lucky Guidance
（用神对应方向、颜色、行业、贵人生肖等，具体、可用、不空洞，中文2-3段）
（English translation）
${input.birthplace ? `
八、行运方位 | VIII. Travel & Relocation
（根据出生地和八字用神，推荐2-3个适合命主发展的国家或城市，解释为什么那些地方的五行能量与命主相合，中文2-3段）
（English translation）
` : ""}
[END FULL]

[BLUEPRINT]
{"colors":{"primary":"#xxx","secondary":"#xxx","accent":"#xxx"},"totem":"图腾描述100字","keywords":["","",""],"lucky":{"color":"","place":"","time":""},"message":"寄语20字"}
[END BLUEPRINT]

请直接按上述格式输出，不要加任何额外说明文字。`;
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
        generationConfig: { maxOutputTokens: 8192, temperature: 0.8 },
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
      max_tokens: 8192,
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
