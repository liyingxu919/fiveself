/**
 * 紫微斗数轻量引擎 - 纯TypeScript, 零外部依赖
 * 手写核心算法: 命宫定位/五行局/紫微星安法/14主星排盘
 */

const ZHI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const PALACES = ["命宫","兄弟","夫妻","子女","财帛","疾厄","迁移","交友","官禄","田宅","福德","父母"];
const PALACES_EN = ["Destiny","Siblings","Spouse","Children","Wealth","Health","Travel","Friends","Career","Property","Spirit","Parents"];

// 五行局表: [年干][命宫支] → 局
const WUXING_JU_TABLE: Record<string,number> = {
  "甲子":2,"甲丑":2,"甲寅":6,"甲卯":6,"甲辰":3,"甲巳":3,"甲午":4,"甲未":4,"甲申":5,"甲酉":5,"甲戌":6,"甲亥":6,
  "乙子":2,"乙丑":2,"乙寅":6,"乙卯":6,"乙辰":3,"乙巳":3,"乙午":4,"乙未":4,"乙申":5,"乙酉":5,"乙戌":6,"乙亥":6,
  "丙子":3,"丙丑":3,"丙寅":5,"丙卯":5,"丙辰":2,"丙巳":2,"丙午":6,"丙未":6,"丙申":3,"丙酉":3,"丙戌":5,"丙亥":5,
  "丁子":3,"丁丑":3,"丁寅":5,"丁卯":5,"丁辰":2,"丁巳":2,"丁午":6,"丁未":6,"丁申":3,"丁酉":3,"丁戌":5,"丁亥":5,
  "戊子":4,"戊丑":4,"戊寅":3,"戊卯":3,"戊辰":6,"戊巳":6,"戊午":5,"戊未":5,"戊申":2,"戊酉":2,"戊戌":3,"戊亥":3,
  "己子":4,"己丑":4,"己寅":3,"己卯":3,"己辰":6,"己巳":6,"己午":5,"己未":5,"己申":2,"己酉":2,"己戌":3,"己亥":3,
  "庚子":5,"庚丑":5,"庚寅":2,"庚卯":2,"庚辰":4,"庚巳":4,"庚午":3,"庚未":3,"庚申":6,"庚酉":6,"庚戌":2,"庚亥":2,
  "辛子":5,"辛丑":5,"辛寅":2,"辛卯":2,"辛辰":4,"辛巳":4,"辛午":3,"辛未":3,"辛申":6,"辛酉":6,"辛戌":2,"辛亥":2,
  "壬子":6,"壬丑":6,"壬寅":4,"壬卯":4,"壬辰":5,"壬巳":5,"壬午":2,"壬未":2,"壬申":3,"壬酉":3,"壬戌":4,"壬亥":4,
  "癸子":6,"癸丑":6,"癸寅":4,"癸卯":4,"癸辰":5,"癸巳":5,"癸午":2,"癸未":2,"癸申":3,"癸酉":3,"癸戌":4,"癸亥":4,
};

const JU_NAMES = ["","","水二局","木三局","金四局","土五局","火六局"];
const GAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];

// 紫微星安法表: 局数x农历日 → 紫微在地支的偏移
const ZIWEI_TABLE: Record<number, number[]> = {
  2:[0,12,11,10,9,8,7,6,5,4,3,2,1,0,12,11,10,9,8,7,6,5,4,3,2,1,0,12,11,10,9,8],
  3:[0,8,6,4,2,0,11,9,7,5,3,1,11,9,7,5,3,1,11,9,7,5,3,1,11,9,7,5,3,1,11],
  4:[0,6,11,4,9,2,7,0,5,10,3,8,1,6,11,4,9,2,7,0,5,10,3,8,1,6,11,4,9,2,7],
  5:[0,5,10,2,7,0,5,10,2,7,0,5,10,2,7,0,5,10,2,7,0,5,10,2,7,0,5,10,2,7,0],
  6:[0,3,6,9,0,3,6,9,0,3,6,9,0,3,6,9,0,3,6,9,0,3,6,9,0,3,6,9,0,3,6],
};

// 紫微星系: 从紫微开始, 逆时针排列
const ZIWEI_SERIES = ["紫微","天机","","太阳","武曲","天同","","廉贞"];
const ZIWEI_OFFSETS = [0,-1,-2,-3,-4,-5,-8,-9]; // 紫微在0, 天机-1, (空-2), 太阳-3...

// 天府星系: 从天府开始, 顺时针排列
const TIANFU_SERIES = ["天府","太阴","贪狼","巨门","天相","天梁","七杀","","","","破军"];
const TIANFU_OFFSETS = [0,1,2,3,4,5,6,7,8,9,10];

export interface ZiweiResult {
  wuxingJu: string; mingGong: string; shenGong: string;
  palaces: Array<{ name:string; nameEn:string; majorStars:string[] }>;
  sihua: string[];
  analysis: string;
}

export function getZiweiChart(year:number, month:number, day:number, hour:number, gender:string):ZiweiResult|null {
  try {
    // 1. 命宫定位 (从寅起正月, 顺数到出生月, 从该宫起子时逆数到出生时)
    // 简化: 命宫地支 = (寅(2) + month - 1 - (hour辰时index)) % 12
    const shichen = hour === 23 || hour === 0 ? 0 : Math.floor((hour + 1) / 2);
    const mingGongIdx = ((2 + month - 1 - shichen) % 12 + 12) % 12;

    // 2. 身宫: 从寅起正月顺数到出生月, 从该宫起子时顺数到出生时
    const shenGongIdx = ((2 + month - 1 + shichen) % 12 + 12) % 12;

    // 3. 五行局: 年干+命宫支
    const yearGan = GAN[(year - 4) % 10];
    const key = yearGan + ZHI[mingGongIdx];
    const ju = WUXING_JU_TABLE[key] || 2;
    const juName = JU_NAMES[ju] || "水二局";

    // 4. 农历日 (简化: 用公历日近似)
    const lunarDay = day > 30 ? day - 2 : day;
    const ziweiOffset = ZIWEI_TABLE[ju]?.[lunarDay] ?? 0;
    const ziweiIdx = (mingGongIdx + ziweiOffset) % 12; // 紫微在地支的位置

    // 5. 安14主星
    const stars: string[][] = Array.from({length:12}, () => []);

    // 紫微星系 (逆排)
    for (let i = 0; i < ZIWEI_SERIES.length; i++) {
      if (ZIWEI_SERIES[i]) {
        const idx = ((ziweiIdx + ZIWEI_OFFSETS[i]) % 12 + 12) % 12;
        stars[idx].push(ZIWEI_SERIES[i]);
      }
    }

    // 天府星系 (顺排)
    const tianfuIdx = (12 - ziweiIdx + 4) % 12; // 天府与紫微对称 (紫微在寅=天府在辰)
    // 简化计算: 天府 = (4 - ziweiIdx + 12) % 12
    const tfIdx = ((4 - ziweiIdx) % 12 + 12) % 12;
    for (let i = 0; i < TIANFU_SERIES.length; i++) {
      if (TIANFU_SERIES[i]) {
        const idx = (tfIdx + TIANFU_OFFSETS[i]) % 12;
        stars[idx].push(TIANFU_SERIES[i]);
      }
    }

    // 6. 四化 (简化: 年干定四化)
    const sihuaMap: Record<string, string[]> = {
      "甲":["廉贞化禄","破军化权","武曲化科","太阳化忌"],
      "乙":["天机化禄","天梁化权","紫微化科","太阴化忌"],
      "丙":["天同化禄","天机化权","文昌化科","廉贞化忌"],
      "丁":["太阴化禄","天同化权","天机化科","巨门化忌"],
      "戊":["贪狼化禄","太阴化权","右弼化科","天机化忌"],
      "己":["武曲化禄","贪狼化权","天梁化科","文曲化忌"],
      "庚":["太阳化禄","武曲化权","太阴化科","天同化忌"],
      "辛":["巨门化禄","太阳化权","文曲化科","文昌化忌"],
      "壬":["天梁化禄","紫微化权","左辅化科","武曲化忌"],
      "癸":["破军化禄","巨门化权","太阴化科","贪狼化忌"],
    };
    const sihua = sihuaMap[yearGan] || [];

    // 7. 构建宫位
    const palaces = PALACES.map((name, i) => {
      const idx = (mingGongIdx + i) % 12;
      return {
        name, nameEn: PALACES_EN[i],
        majorStars: stars[idx],
      };
    });

    const mingStars = stars[mingGongIdx].join("、");
    const shenStars = stars[shenGongIdx].join("、");

    const analysis = `紫微斗数命盘：${juName}，命宫在${ZHI[mingGongIdx]}(${mingStars||"无主星"})，`
      + `身宫在${ZHI[shenGongIdx]}(${shenStars||"无主星"})。`
      + `四化：${sihua.join("、")}。`
      + `${mingStars.includes("紫微")?"紫微坐命，天生领导气质，有贵人运。":""}`
      + `${mingStars.includes("天府")?"天府入命，稳重务实，善于理财守成。":""}`
      + `${mingStars.includes("七杀")?"七杀坐命，刚毅果断，勇于开拓。":""}`
      + `${mingStars.includes("破军")?"破军入命，敢作敢为，有革新精神。":""}`
      + `${mingStars.includes("贪狼")?"贪狼坐命，多才多艺，人缘佳。":""}`;

    return { wuxingJu: juName, mingGong: ZHI[mingGongIdx], shenGong: ZHI[shenGongIdx], palaces, sihua, analysis };
  } catch { return null; }
}
