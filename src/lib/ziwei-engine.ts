/**
 * 紫微斗数引擎
 * 基于 iztro npm 包, 提供完整紫微斗数命盘分析
 * 与八字命理互补, 形成"八字+紫微"双轨命书
 */
import astrolabe from "iztro";

// 12宫位
const PALACES = ["命宫","兄弟","夫妻","子女","财帛","疾厄","迁移","交友","官禄","田宅","福德","父母"];
const PALACES_EN = ["Destiny","Siblings","Spouse","Children","Wealth","Health","Travel","Friends","Career","Property","Spirit","Parents"];

// 14主星
const MAJOR_STARS = ["紫微","天机","太阳","武曲","天同","廉贞","天府","太阴","贪狼","巨门","天相","天梁","七杀","破军"];

// 五行局名称
const WUXING_JU = ["水二局","木三局","金四局","土五局","火六局"];

export interface ZiweiResult {
  /** 五行局 */
  wuxingJu: string;
  /** 命宫地支 */
  mingGong: string;
  /** 身宫 */
  shenGong: string;
  /** 12宫主星 */
  palaces: Array<{
    name: string; nameEn: string; zhiName: string;
    majorStars: string[]; minorStars: string[];
  }>;
  /** 四化 */
  sihua: { star: string; type: string }[];
  /** 分析 */
  analysis: string;
  analysisEn: string;
}

/** 从出生日期计算紫微斗数命盘 */
export function getZiweiChart(year: number, month: number, day: number, hour: number, gender: string): ZiweiResult | null {
  try {
    const chart = astrolabe.bySolar(`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`, hour, gender === "male" ? 0 : 1, "zh-CN");
    if (!chart) return null;

    const palaces = chart.palaces?.map((p: any) => ({
      name: p.name || "", nameEn: PALACES_EN[PALACES.indexOf(p.name||"")] || "",
      zhiName: p.zhiName || "",
      majorStars: (p.majorStars || []).filter(Boolean),
      minorStars: (p.minorStars || []).filter(Boolean).slice(0, 8),
    })) || [];

    const sihua = chart.sihua?.map((s: any) => ({ star: s.star || "", type: s.type || "" })) || [];

    const mingPalace = palaces.find(p => p.name === "命宫");
    const mingStars = mingPalace?.majorStars?.join("、") || "";
    const shenBody = palaces.find(p => p.name === "身宫");

    const analysis = `紫微斗数命盘：五行局${chart.wuxingJu || "未知"}，命宫在${mingPalace?.zhiName || "?"}(${mingStars})，身宫在${shenBody?.zhiName || "?"}。`
      + `四化：${sihua.map(s => `${s.star}${s.type}`).join("、") || "无"}。`
      + `${mingStars.includes("紫微") ? "紫微坐命，领导力强，有贵气。" : mingStars.includes("天府") ? "天府坐命，稳重包容，善于理财。" : mingStars.includes("七杀") ? "七杀坐命，刚毅果断，有开拓精神。" : ""}`;

    return {
      wuxingJu: chart.wuxingJu || "",
      mingGong: mingPalace?.zhiName || "",
      shenGong: shenBody?.zhiName || "",
      palaces,
      sihua,
      analysis,
      analysisEn: `Ziwei chart: ${chart.wuxingJu || ""}, Ming Gong in ${mingPalace?.zhiName || ""}(${mingStars}).`,
    };
  } catch {
    return null;
  }
}
