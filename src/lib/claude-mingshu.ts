/**
 * 双AI命书引擎: Gemini写命书 + ChatGPT出五行蓝图
 */
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

export interface MingShuInput {
  customerName: string; birthDate: string; birthTime?: string;
  bazi: string; ziwei: string; shenSha: string; dayun: string;
  strength: string; geJu: string; wuxing: string; shiShen: string;
}

/** Gemini 写命书 */
export async function generateMingShu(input: MingShuInput): Promise<{ text?: string; error?: string }> {
  if (!GEMINI_KEY) return { error: "GEMINI_API_KEY not set" };
  const prompt = `你是从业三十年的资深命理师，精通《滴天髓》《穷通宝鉴》《三命通会》及盲派技法。请为命主${input.customerName}（${input.birthDate}出生）撰写一份完整的八字命书。

【命主八字】
八字四柱：${input.bazi}
五行分布：${input.wuxing}
格局：${input.geJu}
日主强弱：${input.strength}
十神配置：${input.shiShen}
神煞：${input.shenSha}
紫微斗数：${input.ziwei}
大运流转：${input.dayun}

【撰写要求】
请写出1500字以上的完整命书，结构如下：

一、命盘总览——日主特性、五行气势、格局高低，点出命局最核心的特点
二、性格性情——从日主五行+十神+神煞分析性格优势与需注意之处，要具体到干支
三、事业财运——格局配合大运看事业方向，财官印食各有论断，忌神喜神分清楚
四、感情姻缘——配偶宫+桃花+日支藏干分析感情特质，正偏缘分说清楚
五、健康养生——五行偏枯对应的身体注意事项，调候建议
六、大运起伏——各步大运的吉凶变化，哪几步运最得力
七、开运建议——用神对应的方向、颜色、行业、贵人特征等

要求：口语化但专业，具体到干支（如"甲木参天""庚金劈甲""丙火暖局"），有断有解，绝不用"你的命运掌握在自己手中"之类模板套话。直接论断，用"命主""此命"称呼。每段起个小标题。`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        system_instruction:{parts:[{text:"你是从业三十年的资深命理师，精通滴天髓、穷通宝鉴、盲派、紫微斗数。命书风格口语化、具体到八字干支、有断有解。绝不用模板腔。"}]},
        contents:[{parts:[{text:prompt}]}],
        generationConfig:{maxOutputTokens:4000,temperature:0.8},
      }),
    });
    if (!res.ok) { const et = await res.text(); return { error: `HTTP ${res.status}: ${et.slice(0,200)}` }; }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { error: `Empty response: ${JSON.stringify(data).slice(0,200)}` };
    return { text };
  } catch(e: any) { return { error: e?.message || String(e) }; }
}

/** Pollinations.ai 生成五行图腾图片URL (即时生成，无需等待) */
export function getTotemImageUrl(input: MingShuInput, totemDesc?: { cn?: string; en?: string; elements?: string[] }): string {
  const elements = totemDesc?.elements?.join(",") || "";
  const prompt = encodeURIComponent(
    `Chinese ink wash painting, ${totemDesc?.cn || input.wuxing + " totem"}, ${totemDesc?.en || "oriental five elements"}, ${elements}, misty ethereal, gold leaf details, silk scroll texture, Song dynasty aesthetic, masterpiece, spiritual, traditional Chinese art, vertical composition`
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&model=flux&nologo=true&seed=${Date.now() % 100000}`;
}

/** Gemini 根据命书出五行蓝图 (替代ChatGPT) */
export async function generateBlueprint(mingshu: string, input: MingShuInput): Promise<any> {
  if (!GEMINI_KEY) return null;
  const prompt = `你是一位东方美学视觉设计师。请根据以下命书内容，为命主${input.customerName}设计一份"五行人生蓝图"的视觉方案。

【命书全文】${mingshu}
【命主数据】八字:${input.bazi} 五行:${input.wuxing} 神煞:${input.shenSha} 紫微:${input.ziwei}

请设计一份视觉蓝图方案，包含:
1. 整体配色方案(主色/辅色/点缀色，每个给hex值)
2. 图腾描述(结合八字和紫微的意象，100字)
3. 三个最重要的人生关键词
4. 最幸运的颜色/环境/时机各一个
5. 一句给命主的寄语(温暖有力，20字以内)

用JSON格式回复，只回复JSON不要其他文字:
{"colors":{"primary":"#xxx","secondary":"#xxx","accent":"#xxx"},"totem":"...","keywords":["","",""],"lucky":{"color":"","place":"","time":""},"message":"..."}`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        system_instruction:{parts:[{text:"你是东方美学视觉设计师。只回复JSON，不要其他文字。"}]},
        contents:[{parts:[{text:prompt}]}],
        generationConfig:{maxOutputTokens:800,temperature:0.9},
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    // Extract JSON from response
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch { return null; }
}
