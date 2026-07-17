/**
 * 双AI命书引擎: Gemini写命书 + ChatGPT出五行蓝图
 */
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

export interface MingShuInput {
  customerName: string; birthDate: string; birthTime?: string;
  bazi: string; ziwei: string; shenSha: string; dayun: string;
  strength: string; geJu: string; wuxing: string; shiShen: string;
}

/** Gemini 写命书 */
export async function generateMingShu(input: MingShuInput): Promise<{ text?: string; error?: string }> {
  if (!GEMINI_KEY) return { error: "GEMINI_API_KEY not set" };
  const prompt = `你是资深命理师。请为${input.customerName}(${input.birthDate}出生)撰写500-800字命书。
八字:${input.bazi} 五行:${input.wuxing} 格局:${input.geJu}
日主:${input.strength} 十神:${input.shiShen} 神煞:${input.shenSha}
紫微:${input.ziwei} 大运:${input.dayun}
要求:口语化、具体到干支、有断有解、不套模板。中文。`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        system_instruction:{parts:[{text:"你是从业三十年的资深命理师，精通滴天髓、穷通宝鉴、盲派、紫微斗数。命书风格口语化、具体到八字干支、有断有解。绝不用模板腔。"}]},
        contents:[{parts:[{text:prompt}]}],
        generationConfig:{maxOutputTokens:2000,temperature:0.8},
      }),
    });
    if (!res.ok) { const et = await res.text(); return { error: `HTTP ${res.status}: ${et.slice(0,200)}` }; }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { error: `Empty response: ${JSON.stringify(data).slice(0,200)}` };
    return { text };
  } catch(e: any) { return { error: e?.message || String(e) }; }
}

/** ChatGPT 根据命书出五行蓝图 */
export async function generateBlueprint(mingshu: string, input: MingShuInput): Promise<string | null> {
  if (!OPENAI_KEY) return null;
  const prompt = `你是一位东方美学视觉设计师。请根据以下命书内容，为命主${input.customerName}设计一份"五行人生蓝图"的视觉方案。

【命书全文】
${mingshu}

【命主数据】
八字:${input.bazi} 五行:${input.wuxing} 神煞:${input.shenSha} 紫微:${input.ziwei}

请设计一份视觉蓝图方案，包含:
1. 整体配色方案(主色/辅色/点缀色，每个给hex值)
2. 图腾描述(结合八字和紫微的意象，100字)
3. 三个最重要的人生关键词
4. 最幸运的颜色/环境/时机各一个
5. 一句给命主的寄语(温暖有力，20字以内)

用JSON格式回复:
{"colors":{"primary":"#xxx","secondary":"#xxx","accent":"#xxx"},"totem":"...","keywords":["","",""],"lucky":{"color":"","place":"","time":""},"message":"..."}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${OPENAI_KEY}`},
      body: JSON.stringify({
        model:"gpt-4o-mini", messages:[
          {role:"system",content:"你是东方美学视觉设计师。只回复JSON，不要其他文字。"},
          {role:"user",content:prompt}
        ], temperature:0.9, max_tokens:800,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch { return null; }
}
