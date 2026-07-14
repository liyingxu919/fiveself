/**
 * 八字（Bazi）计算引擎
 * 根据公历出生日期时间，计算天干地支、五行分布、日主等信息
 */

// 天干
const TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const TIAN_GAN_EN = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"];

// 地支
const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const DI_ZHI_EN = ["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"];

// 五行属性映射
const GAN_WUXING = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]; // 甲乙木 丙丁火 戊己土 庚辛金 壬癸水
const ZHI_WUXING = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4]; // 子水 丑土 寅木 卯木 辰土 巳火 午火 未土 申金 酉金 戌土 亥水
const WUXING_NAMES = ["木", "火", "土", "金", "水"];
const WUXING_NAMES_EN = ["Wood", "Fire", "Earth", "Metal", "Water"];
const WUXING_COLORS = ["#6B8E4E", "#C75B39", "#B8975A", "#C0C0C0", "#4A6FA5"];
const WUXING_DIRECTIONS = ["东", "南", "中", "西", "北"];
const WUXING_SEASONS = ["春", "夏", "长夏", "秋", "冬"];

// 生肖
const SHENG_XIAO = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const SHENG_XIAO_EN = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];

// 1900年1月1日对应的干支索引（甲子=0）
// 1900-01-01 = 甲戌日（天干索引0, 地支索引10）这是已知的基准点
// 简便起见，使用1900年为基准进行推算
const BASE_YEAR = 1900;
const BASE_YEAR_GAN = 6;  // 1900年天干=庚(6)
const BASE_YEAR_ZHI = 0;  // 1900年地支=子(0)

// 节气数据（简化版，用于确定月柱分界）
// 每月节气大致日期（近似值，精确到日）
const JIE_QI_MONTH = [
  { name: "立春", month: 2, day: 4 },   // 寅月始
  { name: "惊蛰", month: 3, day: 6 },   // 卯月始
  { name: "清明", month: 4, day: 5 },   // 辰月始
  { name: "立夏", month: 5, day: 6 },   // 巳月始
  { name: "芒种", month: 6, day: 6 },   // 午月始
  { name: "小暑", month: 7, day: 7 },   // 未月始
  { name: "立秋", month: 8, day: 8 },   // 申月始
  { name: "白露", month: 9, day: 8 },   // 酉月始
  { name: "寒露", month: 10, day: 8 },  // 戌月始
  { name: "立冬", month: 11, day: 7 },  // 亥月始
  { name: "大雪", month: 12, day: 7 },  // 子月始
  { name: "小寒", month: 1, day: 6 },   // 丑月始
];

// 时辰对应表
const HOUR_ZHI_MAP = [
  { start: 23, end: 1, zhi: 0 },   // 子时 23:00-01:00
  { start: 1, end: 3, zhi: 1 },    // 丑时 01:00-03:00
  { start: 3, end: 5, zhi: 2 },    // 寅时 03:00-05:00
  { start: 5, end: 7, zhi: 3 },    // 卯时 05:00-07:00
  { start: 7, end: 9, zhi: 4 },    // 辰时 07:00-09:00
  { start: 9, end: 11, zhi: 5 },   // 巳时 09:00-11:00
  { start: 11, end: 13, zhi: 6 },  // 午时 11:00-13:00
  { start: 13, end: 15, zhi: 7 },  // 未时 13:00-15:00
  { start: 15, end: 17, zhi: 8 },  // 申时 15:00-17:00
  { start: 17, end: 19, zhi: 9 },  // 酉时 17:00-19:00
  { start: 19, end: 21, zhi: 10 }, // 戌时 19:00-21:00
  { start: 21, end: 23, zhi: 11 }, // 亥时 21:00-23:00
];

export interface BaziInput {
  year: number;
  month: number;  // 1-12
  day: number;
  hour: number;   // 0-23
  gender?: "male" | "female";
}

export interface BaziPillar {
  gan: number;     // 天干索引 0-9
  zhi: number;     // 地支索引 0-11
  ganName: string;
  ganNameEn: string;
  zhiName: string;
  zhiNameEn: string;
  wuxing: number;  // 纳音五行 0-4
}

export interface BaziResult {
  yearPillar: BaziPillar;
  monthPillar: BaziPillar;
  dayPillar: BaziPillar;
  hourPillar: BaziPillar;
  dayMaster: number;       // 日主天干索引
  dayMasterWuxing: number; // 日主五行
  wuxingCount: number[];   // 五行统计 [木,火,土,金,水]
  shengXiao: string;
  shengXiaoEn: string;
  elementProfile: string;  // 五行旺衰简述
  dominantElement: number;  // 主导五行
  secondaryElement: number; // 次导五行
  missingElements: number[]; // 缺失的五行
}

/**
 * 计算年柱天干地支
 */
function calcYearPillar(year: number): BaziPillar {
  const offset = year - BASE_YEAR;
  const gan = (BASE_YEAR_GAN + offset) % 10;
  const zhi = (BASE_YEAR_ZHI + offset) % 12;
  const ganIdx = gan < 0 ? gan + 10 : gan;
  const zhiIdx = zhi < 0 ? zhi + 12 : zhi;
  return {
    gan: ganIdx,
    zhi: zhiIdx,
    ganName: TIAN_GAN[ganIdx],
    ganNameEn: TIAN_GAN_EN[ganIdx],
    zhiName: DI_ZHI[zhiIdx],
    zhiNameEn: DI_ZHI_EN[zhiIdx],
    wuxing: Math.floor(ganIdx / 2), // 天干五行近似
  };
}

/**
 * 计算月柱（按节气分界）
 */
function calcMonthPillar(year: number, month: number, day: number, yearGan: number): BaziPillar {
  // 根据节气确定月支
  let monthZhi: number;
  // 简化：按公历月份近似确定月支
  // 立春(2/4)起为寅月
  if (month === 2 && day >= 4) monthZhi = 2;      // 寅月
  else if (month === 3 && day < 6) monthZhi = 2;
  else if (month === 3 && day >= 6) monthZhi = 3;   // 卯月
  else if (month === 4 && day < 5) monthZhi = 3;
  else if (month === 4 && day >= 5) monthZhi = 4;   // 辰月
  else if (month === 5 && day < 6) monthZhi = 4;
  else if (month === 5 && day >= 6) monthZhi = 5;   // 巳月
  else if (month === 6 && day < 6) monthZhi = 5;
  else if (month === 6 && day >= 6) monthZhi = 6;   // 午月
  else if (month === 7 && day < 7) monthZhi = 6;
  else if (month === 7 && day >= 7) monthZhi = 7;   // 未月
  else if (month === 8 && day < 8) monthZhi = 7;
  else if (month === 8 && day >= 8) monthZhi = 8;   // 申月
  else if (month === 9 && day < 8) monthZhi = 8;
  else if (month === 9 && day >= 8) monthZhi = 9;   // 酉月
  else if (month === 10 && day < 8) monthZhi = 9;
  else if (month === 10 && day >= 8) monthZhi = 10; // 戌月
  else if (month === 11 && day < 7) monthZhi = 10;
  else if (month === 11 && day >= 7) monthZhi = 11; // 亥月
  else if (month === 12 && day < 7) monthZhi = 11;
  else if (month === 12 && day >= 7) monthZhi = 0;  // 子月
  else if (month === 1 && day < 6) monthZhi = 0;
  else monthZhi = 1; // 丑月（1月6日后及2月4日前）

  // 月天干 = (年天干×2 + 月地支) % 10 的规律
  // 甲己年 → 丙寅起, 乙庚年 → 戊寅起, 丙辛年 → 庚寅起, 丁壬年 → 壬寅起, 戊癸年 → 甲寅起
  const monthGanBase = [2, 4, 6, 8, 0]; // 甲/己→2, 乙/庚→4, 丙/辛→6, 丁/壬→8, 戊/癸→0
  const ganGroup = yearGan % 5;
  const gan = (monthGanBase[ganGroup] + (monthZhi - 2 + 12) % 12) % 10;
  const ganIdx = gan < 0 ? gan + 10 : gan;

  return {
    gan: ganIdx,
    zhi: monthZhi,
    ganName: TIAN_GAN[ganIdx],
    ganNameEn: TIAN_GAN_EN[ganIdx],
    zhiName: DI_ZHI[monthZhi],
    zhiNameEn: DI_ZHI_EN[monthZhi],
    wuxing: Math.floor(ganIdx / 2),
  };
}

/**
 * 计算日柱（使用已知基准日推算）
 * 1900-01-01 = 甲戌日（甲=0, 戌=10）
 */
function calcDayPillar(year: number, month: number, day: number): BaziPillar {
  const baseDate = new Date(1900, 0, 1); // 1900-01-01
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const gan = (0 + diffDays) % 10;
  const zhi = (10 + diffDays) % 12;
  const ganIdx = gan < 0 ? gan + 10 : gan;
  const zhiIdx = zhi < 0 ? zhi + 12 : zhi;

  return {
    gan: ganIdx,
    zhi: zhiIdx,
    ganName: TIAN_GAN[ganIdx],
    ganNameEn: TIAN_GAN_EN[ganIdx],
    zhiName: DI_ZHI[zhiIdx],
    zhiNameEn: DI_ZHI_EN[zhiIdx],
    wuxing: Math.floor(ganIdx / 2),
  };
}

/**
 * 计算时柱
 */
function calcHourPillar(hour: number, dayGan: number): BaziPillar {
  // 确定时支
  let hourZhi = -1;
  for (const h of HOUR_ZHI_MAP) {
    if (h.start <= h.end) {
      if (hour >= h.start && hour < h.end) { hourZhi = h.zhi; break; }
    } else {
      // 跨午夜的情况（子时 23-1）
      if (hour >= h.start || hour < h.end) { hourZhi = h.zhi; break; }
    }
  }
  if (hourZhi === -1) hourZhi = 0;

  // 时天干规律：甲己日→甲子起, 乙庚日→丙子起, 丙辛日→戊子起, 丁壬日→庚子起, 戊癸日→壬子起
  const hourGanBase = [0, 2, 4, 6, 8]; // 甲/己→0, 乙/庚→2, 丙/辛→4, 丁/壬→6, 戊/癸→8
  const ganGroup = dayGan % 5;
  const gan = (hourGanBase[ganGroup] + hourZhi) % 10;

  return {
    gan,
    zhi: hourZhi,
    ganName: TIAN_GAN[gan],
    ganNameEn: TIAN_GAN_EN[gan],
    zhiName: DI_ZHI[hourZhi],
    zhiNameEn: DI_ZHI_EN[hourZhi],
    wuxing: Math.floor(gan / 2),
  };
}

/**
 * 分析五行分布
 */
function analyzeWuxing(
  yearP: BaziPillar, monthP: BaziPillar,
  dayP: BaziPillar, hourP: BaziPillar
): { counts: number[]; dominant: number; secondary: number; missing: number[]; profile: string } {
  const counts = [0, 0, 0, 0, 0];

  // 统计天干五行
  counts[GAN_WUXING[yearP.gan]]++;
  counts[GAN_WUXING[monthP.gan]]++;
  counts[GAN_WUXING[dayP.gan]]++;
  counts[GAN_WUXING[hourP.gan]]++;

  // 统计地支五行
  counts[ZHI_WUXING[yearP.zhi]]++;
  counts[ZHI_WUXING[monthP.zhi]]++;
  counts[ZHI_WUXING[dayP.zhi]]++;
  counts[ZHI_WUXING[hourP.zhi]]++;

  // 找主导和次导
  const sorted = counts.map((c, i) => ({ count: c, idx: i })).sort((a, b) => b.count - a.count);
  const dominant = sorted[0].idx;
  const secondary = sorted[1].idx;
  const missing = counts.map((c, i) => c === 0 ? i : -1).filter(i => i !== -1);

  // 生成五行旺衰简述
  const strengthLabels = ["很弱", "较弱", "适中", "偏旺", "旺盛"];
  const dominantStrength = Math.min(4, counts[dominant]);
  const missingStr = missing.length > 0
    ? `缺${missing.map(i => WUXING_NAMES[i]).join("、")}`
    : "五行俱全";

  const profile = `日主${TIAN_GAN[dayP.gan]}(${WUXING_NAMES[GAN_WUXING[dayP.gan]]})，`
    + `${WUXING_NAMES[dominant]}${strengthLabels[dominantStrength]}，`
    + missingStr;

  return { counts, dominant, secondary, missing, profile };
}

/**
 * 主入口：根据出生信息计算完整八字
 */
export function calculateBazi(input: BaziInput): BaziResult {
  const yearP = calcYearPillar(input.year);
  const monthP = calcMonthPillar(input.year, input.month, input.day, yearP.gan);
  const dayP = calcDayPillar(input.year, input.month, input.day);
  const hourP = calcHourPillar(input.hour, dayP.gan);

  const dayMaster = dayP.gan;
  const dayMasterWuxing = GAN_WUXING[dayMaster];
  const analysis = analyzeWuxing(yearP, monthP, dayP, hourP);

  return {
    yearPillar: yearP,
    monthPillar: monthP,
    dayPillar: dayP,
    hourPillar: hourP,
    dayMaster,
    dayMasterWuxing,
    wuxingCount: analysis.counts,
    shengXiao: SHENG_XIAO[yearP.zhi],
    shengXiaoEn: SHENG_XIAO_EN[yearP.zhi],
    elementProfile: analysis.profile,
    dominantElement: analysis.dominant,
    secondaryElement: analysis.secondary,
    missingElements: analysis.missing,
  };
}

/**
 * 获取五行颜色（用于报告视觉设计）
 */
export function getWuxingColor(elementIndex: number): string {
  return WUXING_COLORS[elementIndex] || "#333";
}

export { TIAN_GAN, DI_ZHI, WUXING_NAMES, WUXING_NAMES_EN, WUXING_COLORS, SHENG_XIAO, SHENG_XIAO_EN };
