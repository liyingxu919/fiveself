/**
 * 出生地分析: 根据八字用神和出生地，推荐适合发展的地区和国家
 */

export interface RegionRecommendation {
  region: string;
  regionEn: string;
  reason: string;
  reasonEn: string;
  score: number; // 1-10
}

export interface BirthplaceAnalysisResult {
  birthplace: string;
  yongShenDirection: string; // cardinal direction
  yongShenDirectionEn: string;
  recommended: RegionRecommendation[];
  avoid: RegionRecommendation[];
}

// 用神(五行index)→方位(dir index, direction name)
const DIRECTION_MAP: Record<number, { cn: string; en: string; cardinal: string }> = {
  0: { cn: "东方", en: "East", cardinal: "east" },     // 木
  1: { cn: "南方", en: "South", cardinal: "south" },    // 火
  2: { cn: "中部", en: "Center", cardinal: "center" },  // 土
  3: { cn: "西方", en: "West", cardinal: "west" },      // 金
  4: { cn: "北方", en: "North", cardinal: "north" },    // 水
};

// 忌神方位
const AVOID_MAP: Record<number, number> = {
  0: 3, // 木忌金(西)
  1: 4, // 火忌水(北)
  2: 0, // 土忌木(东)
  3: 1, // 金忌火(南)
  4: 2, // 水忌土(中)
};

// 方位→推荐地区
const REGIONS_BY_DIRECTION: Record<string, Array<{ region: string; regionEn: string; reason: string; reasonEn: string; score: number }>> = {
  east: [
    { region: "日本", regionEn: "Japan", reason: "东方木气旺盛，利文昌和创造力", reasonEn: "Strong Wood energy in the East benefits creativity and academic pursuits", score: 9 },
    { region: "新西兰", regionEn: "New Zealand", reason: "纯净自然环境，木气充盈，利身心灵平衡", reasonEn: "Pristine nature with abundant Wood energy for mind-body balance", score: 8 },
    { region: "上海/长三角", regionEn: "Shanghai / Yangtze Delta", reason: "东方水木相生，经济发展活力强", reasonEn: "East region where Water feeds Wood, strong economic vitality", score: 7 },
    { region: "美国西海岸", regionEn: "US West Coast (Seattle, Portland)", reason: "太平洋东岸，木气与水气相生，利创新产业", reasonEn: "Pacific coast where Wood and Water nourish each other, great for innovation", score: 8 },
  ],
  south: [
    { region: "澳大利亚", regionEn: "Australia", reason: "南方火土旺，阳光充沛，利热情外放型事业", reasonEn: "Southern Fire energy, abundant sunlight for outgoing careers", score: 9 },
    { region: "东南亚(泰国/新加坡)", regionEn: "Southeast Asia (Thailand, Singapore)", reason: "南火旺盛，商业活力强，利贸易与社交", reasonEn: "Strong Southern Fire, great for trade and social connections", score: 8 },
    { region: "印度", regionEn: "India", reason: "火土文化深厚，利精神成长和创业", reasonEn: "Deep Fire-Earth culture, benefits spiritual growth and entrepreneurship", score: 7 },
    { region: "美国南部(洛杉矶/迈阿密)", regionEn: "US South (LA, Miami)", reason: "南方阳光地带，火气旺盛，利娱乐与创意产业", reasonEn: "Sunshine belt with strong Fire energy for entertainment and creativity", score: 8 },
  ],
  center: [
    { region: "中东(迪拜/阿布扎比)", regionEn: "Middle East (Dubai, Abu Dhabi)", reason: "中部土金旺，财富聚集之地，利金融地产", reasonEn: "Central Earth-Metal prosperity zone for finance and real estate", score: 9 },
    { region: "中欧(瑞士/德国)", regionEn: "Central Europe (Switzerland, Germany)", reason: "中土稳健之气，利精密制造和长期发展", reasonEn: "Stable Central Earth energy for precision industries and long-term growth", score: 8 },
    { region: "北京/华北平原", regionEn: "Beijing / North China Plain", reason: "中原土厚，政治文化中心，利体制内发展", reasonEn: "Thick Central Earth, political and cultural hub for institutional careers", score: 7 },
  ],
  west: [
    { region: "英国/西欧", regionEn: "UK / Western Europe", reason: "西方金气旺盛，利金融、法律、学术", reasonEn: "Strong Western Metal energy for finance, law, and academia", score: 9 },
    { region: "美国东部(纽约/波士顿)", regionEn: "US East (New York, Boston)", reason: "西方金气与金融中心契合，利事业巅峰", reasonEn: "Metal energy aligns with financial hubs for career pinnacle", score: 9 },
    { region: "北欧(瑞典/丹麦)", regionEn: "Nordic Region (Sweden, Denmark)", reason: "金水相生之地，设计感和创新力强", reasonEn: "Where Metal feeds Water, strong design and innovation", score: 8 },
    { region: "新加坡", regionEn: "Singapore", reason: "西金金融中心，秩序井然，利事业发展", reasonEn: "Metal-oriented financial hub with order, great for career", score: 7 },
  ],
  north: [
    { region: "加拿大", regionEn: "Canada", reason: "北方水旺，广袤包容，利学术研究和安静发展", reasonEn: "Northern Water abundance, vast and inclusive, great for research", score: 9 },
    { region: "俄罗斯/北欧", regionEn: "Russia / Northern Europe", reason: "北方水气充沛，深沉内敛，利战略思维", reasonEn: "Rich Northern Water energy, deep and strategic", score: 7 },
    { region: "美国北部(芝加哥/西雅图)", regionEn: "US North (Chicago, Seattle)", reason: "北水雄厚，工业与科技并重", reasonEn: "Strong Northern Water, balanced industry and technology", score: 8 },
    { region: "冰岛/格陵兰", regionEn: "Iceland / Greenland", reason: "极北纯水之地，利心灵修炼和创意爆发", reasonEn: "Pure Water realm, spiritual refinement and creative breakthroughs", score: 7 },
  ],
};

export function analyzeBirthplace(
  birthplace: string,
  yongShenIndex: number,
): BirthplaceAnalysisResult {
  const dirInfo = DIRECTION_MAP[yongShenIndex] || DIRECTION_MAP[2];
  const avoidIndex = AVOID_MAP[yongShenIndex] ?? 1;
  const avoidDirInfo = DIRECTION_MAP[avoidIndex] || DIRECTION_MAP[1];

  const recommended = REGIONS_BY_DIRECTION[dirInfo.cardinal] || REGIONS_BY_DIRECTION["east"];
  const avoid = REGIONS_BY_DIRECTION[avoidDirInfo.cardinal] || REGIONS_BY_DIRECTION["south"];

  return {
    birthplace,
    yongShenDirection: dirInfo.cn,
    yongShenDirectionEn: `${dirInfo.en} (${dirInfo.cardinal})`,
    recommended,
    avoid,
  };
}
