/**
 * 五行个人视觉能量报告 · 内容生成器
 * 根据八字计算结果生成完整的个性化报告内容（中英双语）
 */
import { type BaziResult, WUXING_NAMES, WUXING_NAMES_EN, WUXING_COLORS } from "./bazi";

export interface ReportContent {
  // 报告元信息
  reportId: string;
  generatedAt: string;

  // 客户信息
  customerName: string;
  birthDate: string;
  birthTime: string;

  // 八字柱
  baziDisplay: {
    year: string; month: string; day: string; hour: string;
    yearEn: string; monthEn: string; dayEn: string; hourEn: string;
  };

  // 日主
  dayMaster: { gan: string; ganEn: string; wuxing: string; wuxingEn: string; color: string };

  // 五行分布
  dominantElement: number;
  secondaryElement: number;

  wuxingDistribution: Array<{
    name: string; nameEn: string; count: number; percentage: number;
    color: string; barWidth: number;
  }>;

  // 五行分析
  elementAnalysis: {
    profile: string;
    dominant: { name: string; nameEn: string; desc: string; descEn: string };
    secondary: { name: string; nameEn: string; desc: string; descEn: string };
    missing: { name: string; nameEn: string }[];
  };

  // 个人色彩系统
  colorPalette: Array<{ hex: string; name: string; use: string }>;

  // 生肖
  shengXiao: { name: string; nameEn: string };

  // 个人图腾描述
  totemDescription: { cn: string; en: string };
  totemElements: string[];

  // 生活方式建议
  lifestyleTips: Array<{ title: string; titleEn: string; tip: string; tipEn: string }>;

  // 空间色彩建议
  spaceTips: Array<{ area: string; areaEn: string; color: string; advice: string; adviceEn: string }>;
}

/**
 * 根据八字结果生成完整报告内容
 */
export function generateReportContent(
  bazi: BaziResult,
  customerName: string,
  birthDate: string,
  birthTime: string
): ReportContent {
  const dayGan = bazi.dayPillar.ganName;
  const dayGanEn = bazi.dayPillar.ganNameEn;
  const dmWuxing = bazi.dayMasterWuxing;
  const dmWuxingName = WUXING_NAMES[dmWuxing];
  const dmWuxingNameEn = WUXING_NAMES_EN[dmWuxing];

  // 五行分布
  const total = bazi.wuxingCount.reduce((s, c) => s + c, 0);
  const wuxingDistribution = bazi.wuxingCount.map((count, i) => ({
    name: WUXING_NAMES[i],
    nameEn: WUXING_NAMES_EN[i],
    count,
    percentage: Math.round((count / total) * 100),
    color: WUXING_COLORS[i],
    barWidth: Math.max(4, Math.round((count / total) * 100)),
  }));

  // 主导元素索引（挂到 ReportContent 上供报告页使用）
  const domIdx = bazi.dominantElement;
  const secIdx = bazi.secondaryElement;
  const domName = WUXING_NAMES[domIdx];
  const domNameEn = WUXING_NAMES_EN[domIdx];
  const secName = WUXING_NAMES[secIdx];
  const secNameEn = WUXING_NAMES_EN[secIdx];

  // 元素描述生成
  const elementDescs: Record<number, { cn: string; en: string }> = {
    0: { cn: "木主仁，象征生长与创造力。你天生具有向上生长的力量，如同春天的树木。", en: "Wood represents growth and creativity. You have an innate upward force, like trees in spring." },
    1: { cn: "火主礼，象征热情与能量。你内心炽热，富有感染力与领导魅力。", en: "Fire represents passion and energy. Your inner flame is contagious, radiating leadership and warmth." },
    2: { cn: "土主信，象征稳重与承载。你踏实可靠，如同大地般给人以安全感。", en: "Earth represents stability and nourishment. You are dependable and grounding, like the earth beneath our feet." },
    3: { cn: "金主义，象征决断与原则。你思维清晰，善于分析，具有坚定的意志力。", en: "Metal represents clarity and principle. You think sharply and act with unwavering determination." },
    4: { cn: "水主智，象征智慧与灵动。你思维敏捷，适应力强，富有洞察力。", en: "Water represents wisdom and adaptability. Your mind flows freely, with deep insight and intuition." },
  };

  // 缺失五行
  const missing = bazi.missingElements.map(i => ({
    name: WUXING_NAMES[i],
    nameEn: WUXING_NAMES_EN[i],
  }));

  // 色彩体系 - 基于日主五行生成
  const colorPalettes: Record<number, Array<{ hex: string; name: string; use: string }>> = {
    0: [ // 木命
      { hex: "#4A7C59", name: "主色·苍绿", use: "大面积使用，如墙面色、床品" },
      { hex: "#8DB580", name: "辅色·嫩绿", use: "点缀色，如靠垫、装饰画" },
      { hex: "#2C1810", name: "配色·深棕", use: "家具、地板等木质元素" },
      { hex: "#F5E6D3", name: "底色·米白", use: "墙面基底、大面积留白" },
      { hex: "#C75B39", name: "点缀·陶土红", use: "小面积点缀，增加温暖感" },
    ],
    1: [ // 火命
      { hex: "#C75B39", name: "主色·朱砂红", use: "主题墙或重点装饰面" },
      { hex: "#F4A460", name: "辅色·暖橙", use: "窗帘、地毯等软装" },
      { hex: "#2C2416", name: "配色·墨色", use: "家具边框、灯具" },
      { hex: "#FBF7F0", name: "底色·暖白", use: "大面积墙面" },
      { hex: "#6B9080", name: "点缀·翠绿", use: "绿植、小摆件" },
    ],
    2: [ // 土命
      { hex: "#B8975A", name: "主色·赭石金", use: "主题装饰、画框" },
      { hex: "#E8D5B7", name: "辅色·沙色", use: "窗帘、沙发面料" },
      { hex: "#5B4A3F", name: "配色·咖啡棕", use: "家具、木地板" },
      { hex: "#F5F0E8", name: "底色·象牙白", use: "大面积墙面" },
      { hex: "#C75B39", name: "点缀·陶土红", use: "靠垫、花瓶" },
    ],
    3: [ // 金命
      { hex: "#C0C0C0", name: "主色·银灰", use: "金属装饰、五金件" },
      { hex: "#F5F5F0", name: "辅色·珍珠白", use: "大面积使用" },
      { hex: "#2C2416", name: "配色·墨色", use: "线条、边框" },
      { hex: "#FBF7F0", name: "底色·暖白", use: "墙面基底" },
      { hex: "#4A6FA5", name: "点缀·宝石蓝", use: "小面积点缀" },
    ],
    4: [ // 水命
      { hex: "#4A6FA5", name: "主色·深海蓝", use: "主题墙或大件家具" },
      { hex: "#A8C8E8", name: "辅色·浅蓝", use: "窗帘、床品" },
      { hex: "#2C2416", name: "配色·墨色", use: "线条、框架" },
      { hex: "#F5F3EF", name: "底色·米白", use: "大面积墙面" },
      { hex: "#C0C0C0", name: "点缀·银色", use: "灯具、五金件" },
    ],
  };

  // 生活方式建议
  const lifestyleTipsMap: Record<number, Array<{ title: string; titleEn: string; tip: string; tipEn: string }>> = {
    0: [
      { title: "宜早起", titleEn: "Rise Early", tip: "清晨5-7点（卯时）为木旺之时，适合晨练、阅读、规划一天。", tipEn: "5-7 AM is Wood's peak time — ideal for morning exercise, reading, and planning your day." },
      { title: "宜绿植", titleEn: "Embrace Greenery", tip: "在家中东方位摆放绿植，增强木的能量场。推荐：绿萝、发财树。", tipEn: "Place plants in the East area of your home to enhance Wood energy. Try pothos or money trees." },
      { title: "宜伸展", titleEn: "Stretch & Move", tip: "瑜伽、太极、伸展运动有助于疏通木的能量。", tipEn: "Yoga, tai chi, and stretching help circulate Wood energy through your body." },
      { title: "慎用金属", titleEn: "Limit Metal", tip: "金克木，避免过多金属装饰。如需使用，搭配绿色调和。", tipEn: "Metal overcomes Wood — limit metallic decor. When needed, balance with green accents." },
    ],
    1: [
      { title: "宜社交", titleEn: "Social Connection", tip: "火命人需要社交和表达，定期参加聚会或分享活动。", tipEn: "Fire types thrive on connection — attend gatherings and share your ideas regularly." },
      { title: "宜红色点缀", titleEn: "Touch of Red", tip: "在南方位放置红色装饰，点燃火的正能量。", tipEn: "Place red accents in the South area to ignite Fire's positive energy." },
      { title: "宜午休", titleEn: "Midday Rest", tip: "午时（11-13点）为火最旺，适合短暂休息，避免过度消耗。", tipEn: "Midday is Fire's peak — take short breaks to avoid burnout." },
      { title: "慎用水", titleEn: "Balance Water", tip: "水克火，避免大面积蓝色或黑色。如需使用，搭配红色平衡。", tipEn: "Water overcomes Fire — avoid large areas of blue/black. Balance with red when needed." },
    ],
    2: [
      { title: "宜稳定节奏", titleEn: "Steady Rhythm", tip: "土命人适合规律的生活作息，固定的日程带来安全感。", tipEn: "Earth types benefit from routine — a steady schedule brings stability." },
      { title: "宜大地色", titleEn: "Earth Tones", tip: "黄、棕、米色系的衣着和家居，增强土的稳定能量。", tipEn: "Yellow, brown, and beige tones in clothing and home strengthen Earth's grounding energy." },
      { title: "宜园艺", titleEn: "Gardening", tip: "接触泥土、种植花草有助于平衡土的能量。", tipEn: "Working with soil and plants helps balance your Earth element." },
      { title: "慎用木", titleEn: "Mind Wood", tip: "木克土，大型绿植和木质家具适度即可。", tipEn: "Wood overcomes Earth — keep large plants and wooden furniture in moderation." },
    ],
    3: [
      { title: "宜精简", titleEn: "Minimalist Living", tip: "金命人适合简洁有序的环境，定期断舍离。", tipEn: "Metal types thrive in clean, organized spaces — declutter regularly." },
      { title: "宜金属装饰", titleEn: "Metallic Accents", tip: "在西方位放置金属摆件或白色装饰，增强金的能量。", tipEn: "Place metallic objects or white decor in the West area to strengthen Metal energy." },
      { title: "宜深呼吸", titleEn: "Deep Breathing", tip: "金对应肺，深呼吸练习有助于增强金的能量。", tipEn: "Metal corresponds to the lungs — deep breathing exercises strengthen your Metal element." },
      { title: "慎用火", titleEn: "Limit Fire", tip: "火克金，避免大面积红色和过多的蜡烛装饰。", tipEn: "Fire overcomes Metal — limit large red areas and excessive candle decor." },
    ],
    4: [
      { title: "宜近水", titleEn: "Near Water", tip: "常去水边散步、泡澡、游泳，增强水的能量。", tipEn: "Walk by water, take baths, or swim regularly to strengthen your Water element." },
      { title: "宜深色", titleEn: "Deep Hues", tip: "蓝、黑色系的衣着增强水的沉稳气质。", tipEn: "Blue and black tones in clothing enhance Water's calm, deep nature." },
      { title: "宜独处", titleEn: "Quiet Reflection", tip: "水命人需要独处时间充电，冥想、写作是不错的方式。", tipEn: "Water types recharge through solitude — try meditation or journaling." },
      { title: "慎用土", titleEn: "Mind Earth", tip: "土克水，避免过多土黄色和陶土装饰。", tipEn: "Earth overcomes Water — limit excessive earth tones and terracotta decor." },
    ],
  };

  // 空间色彩建议
  const spaceTipsMap: Record<number, Array<{ area: string; areaEn: string; color: string; advice: string; adviceEn: string }>> = {
    0: [ // 木
      { area: "客厅", areaEn: "Living Room", color: "#4A7C59", advice: "墙面建议使用带绿调的暖白色，搭配绿色植物和原木家具，营造生机盎然的氛围。", adviceEn: "Warm white walls with green undertones, paired with plants and natural wood furniture for vitality." },
      { area: "卧室", areaEn: "Bedroom", color: "#8DB580", advice: "床品选用淡绿色或浅蓝色调，窗帘选择柔和的亚麻色，有助于睡眠。", adviceEn: "Soft green or light blue bedding with gentle linen curtains for restful sleep." },
      { area: "书房", areaEn: "Study", color: "#2C1810", advice: "木质书桌和书架为主，搭配绿色台灯罩，增加专注力。", adviceEn: "Wooden desk and shelves with a green lampshade to enhance focus." },
    ],
    1: [ // 火
      { area: "客厅", areaEn: "Living Room", color: "#C75B39", advice: "主题墙可用暖色系，搭配暖光灯具，营造温暖热情的空间。", adviceEn: "Warm accent wall with ambient warm lighting for a welcoming, energetic space." },
      { area: "卧室", areaEn: "Bedroom", color: "#F5E6D3", advice: "避免过强的红色，用柔和的米色和粉色代替，保持宁静。", adviceEn: "Avoid strong red in the bedroom — use soft beige and blush tones instead for tranquility." },
      { area: "厨房", areaEn: "Kitchen", color: "#C75B39", advice: "厨房是火旺之地，可少量使用红色点缀，但主色调保持白色或浅灰。", adviceEn: "Kitchen already has Fire energy — use small red accents but keep main tones white or light gray." },
    ],
    2: [ // 土
      { area: "客厅", areaEn: "Living Room", color: "#B8975A", advice: "大地色系为主调，搭配陶瓷摆件和棉麻材质，营造稳重舒适感。", adviceEn: "Earth tones as the base, with ceramic decor and linen textures for grounded comfort." },
      { area: "餐厅", areaEn: "Dining Room", color: "#E8D5B7", advice: "暖黄色灯光，木质餐桌，陶土餐具，营造温馨的就餐氛围。", adviceEn: "Warm yellow lighting, wooden table, and terracotta tableware for cozy dining." },
      { area: "玄关", areaEn: "Entryway", color: "#F5F0E8", advice: "保持明亮整洁，放置一块大地色地毯和一盆小型绿植。", adviceEn: "Keep bright and tidy with an earth-tone rug and a small potted plant." },
    ],
    3: [ // 金
      { area: "客厅", areaEn: "Living Room", color: "#F5F5F0", advice: "简洁的白色为主调，搭配金属边框镜子和银色灯具，突出精致感。", adviceEn: "Clean white as the base, with metal-framed mirrors and silver lighting for refinement." },
      { area: "工作区", areaEn: "Workspace", color: "#C0C0C0", advice: "桌面保持整洁，使用金属文具和白色收纳盒，提升工作效率。", adviceEn: "Keep desk minimal — use metal stationery and white organizers for productivity." },
      { area: "浴室", areaEn: "Bathroom", color: "#F5F5F0", advice: "白色瓷砖搭配银色五金件，营造洁净清爽的空间感。", adviceEn: "White tiles with silver fixtures for a clean, crisp space." },
    ],
    4: [ // 水
      { area: "客厅", areaEn: "Living Room", color: "#4A6FA5", advice: "可用蓝灰色作为主题墙，搭配白色和黑色家具，营造沉静的空间。", adviceEn: "Blue-gray accent wall with white and black furniture for a calm, deep space." },
      { area: "卧室", areaEn: "Bedroom", color: "#A8C8E8", advice: "浅蓝或灰蓝色床品有助于放松和深度睡眠。", adviceEn: "Light blue or slate bedding aids relaxation and deep sleep." },
      { area: "浴室", areaEn: "Bathroom", color: "#4A6FA5", advice: "水命人的能量场所在——可用蓝色马赛克瓷砖或装饰画。", adviceEn: "Your element's power spot — use blue mosaic tiles or water-themed art." },
    ],
  };

  const totemDescs: Record<number, { cn: string; en: string; elements: string[] }> = {
    0: { cn: "一棵扎根深山、枝繁叶茂的古树，树冠上有日月同辉，树根处有溪流环绕", en: "An ancient tree rooted in deep mountains, with sun and moon shining through its canopy, and streams circling its base", elements: ["古树", "日月", "溪流", "山峦"] },
    1: { cn: "一只展翅的金乌（太阳神鸟），周身环绕火焰纹，背景是朝霞漫天的天空", en: "A golden sunbird in flight, surrounded by flame motifs against a radiant dawn sky", elements: ["金乌", "火焰", "朝霞", "光环"] },
    2: { cn: "一座巍然不动的山峦，山体由五色土构成，山顶有鼎（礼器），山脚有麦浪", en: "A majestic mountain formed of five-colored earth, with a ritual vessel at its peak and wheat fields at its base", elements: ["五色山", "鼎", "麦浪", "大地"] },
    3: { cn: "一柄直插云霄的青铜宝剑，剑身映着明月清辉，剑柄缠绕着凤凰尾羽", en: "A bronze sword piercing the clouds, reflecting moonlight on its blade, with phoenix feathers adorning the hilt", elements: ["宝剑", "明月", "凤羽", "云霄"] },
    4: { cn: "一条盘旋的游龙从深海跃出，龙身周围波涛翻涌，龙头朝向北斗七星", en: "A coiling dragon emerging from the deep sea, with crashing waves and its head facing the Big Dipper", elements: ["游龙", "波涛", "北斗", "深海"] },
  };

  return {
    reportId: `BLUEPRINT-${Date.now().toString(36).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    customerName,
    birthDate,
    birthTime,

    baziDisplay: {
      year: `${bazi.yearPillar.ganName}${bazi.yearPillar.zhiName}`,
      month: `${bazi.monthPillar.ganName}${bazi.monthPillar.zhiName}`,
      day: `${bazi.dayPillar.ganName}${bazi.dayPillar.zhiName}`,
      hour: `${bazi.hourPillar.ganName}${bazi.hourPillar.zhiName}`,
      yearEn: `${bazi.yearPillar.ganNameEn} ${bazi.yearPillar.zhiNameEn}`,
      monthEn: `${bazi.monthPillar.ganNameEn} ${bazi.monthPillar.zhiNameEn}`,
      dayEn: `${bazi.dayPillar.ganNameEn} ${bazi.dayPillar.zhiNameEn}`,
      hourEn: `${bazi.hourPillar.ganNameEn} ${bazi.hourPillar.zhiNameEn}`,
    },

    dayMaster: {
      gan: dayGan, ganEn: dayGanEn,
      wuxing: dmWuxingName, wuxingEn: dmWuxingNameEn,
      color: WUXING_COLORS[dmWuxing],
    },

    dominantElement: domIdx,
    secondaryElement: secIdx,

    wuxingDistribution,

    elementAnalysis: {
      profile: bazi.elementProfile,
      dominant: {
        name: domName, nameEn: domNameEn,
        desc: elementDescs[domIdx].cn, descEn: elementDescs[domIdx].en,
      },
      secondary: {
        name: secName, nameEn: secNameEn,
        desc: elementDescs[secIdx].cn, descEn: elementDescs[secIdx].en,
      },
      missing,
    },

    colorPalette: colorPalettes[dmWuxing],

    shengXiao: { name: bazi.shengXiao, nameEn: bazi.shengXiaoEn },

    totemDescription: totemDescs[dmWuxing],
    totemElements: totemDescs[dmWuxing].elements,

    lifestyleTips: lifestyleTipsMap[dmWuxing] || lifestyleTipsMap[2],
    spaceTips: spaceTipsMap[dmWuxing] || spaceTipsMap[2],
  };
}
