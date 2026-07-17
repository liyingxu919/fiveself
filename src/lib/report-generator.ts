/**
 * 五行命书 · 专业命理内容生成器
 * 产出命理师级别的个性化分析，非通用模板
 */
import { type BaziResult, WUXING_NAMES, WUXING_NAMES_EN, WUXING_COLORS, TIAN_GAN, DI_ZHI, SHENG_XIAO, SHENG_XIAO_EN } from "./bazi";

export interface ReportContent {
  reportId: string; generatedAt: string;
  customerName: string; birthDate: string; birthTime?: string;
  dayMaster: { gan: string; ganEn: string; wuxing: string; wuxingEn: string; color: string };
  baziDisplay: { year:string; month:string; day:string; hour:string; yearEn:string; monthEn:string; dayEn:string; hourEn:string };
  dominantElement: number; secondaryElement: number;
  wuxingDistribution: Array<{ name:string; nameEn:string; count:number; percentage:number; color:string; barWidth:number }>;
  elementAnalysis: { profile:string; dominant:any; secondary:any; missing:any[] };
  colorPalette: Array<{ hex:string; name:string; use:string }>;
  shengXiao?: { name:string; nameEn:string };
  dayun?: Array<{ age:string; ganzhi:string; nayin:string; wuxing:string; desc:string; analysis:string }>;
  disuitianshu?: { yongshen:string; yongshenEn:string; analysis:string; analysisEn:string; grade:string };
  mangpai?: { pastTen:string; pastTenEn:string; currentTen:string; currentTenEn:string; flow:string };
  lucky?: { colors:string[]; environments:string[]; timing:string[] };
  lifestyleTips: Array<{ title:string; titleEn:string; tip:string; tipEn:string }>;
  spaceTips: Array<{ area:string; areaEn:string; color:string; advice:string; adviceEn:string }>;
  totemDescription: { cn:string; en:string; elements:string[] };

  /** 命书正文 — 完整命理分析 */
  mingShu: {
    overview: string; overviewEn: string;
    personality: string;
    career: string; careerEn: string;
    relationships: string; relationshipsEn: string;
    health: string; healthEn: string;
    fortune2026: string; fortune2026En: string;
    advice: string; adviceEn: string;
  };
}

/* ═══════════════════════════════════════════════
 * 十神计算
 * ═══════════════════════════════════════════════ */
const GAN_WX = [0,0,1,1,2,2,3,3,4,4]; // 甲乙木 丙丁火 戊己土 庚辛金 壬癸水

function getShiShen(dayGan: number, targetGan: number): string {
  const dw = GAN_WX[dayGan], tw = GAN_WX[targetGan];
  const rel = (tw - dw + 5) % 5;
  const sameYinYang = (dayGan % 2) === (targetGan % 2);
  const map: Record<string, string> = {
    "0_true":"比肩","0_false":"劫财","1_false":"食神","1_true":"伤官",
    "2_true":"正财","2_false":"偏财","3_true":"正官","3_false":"七杀",
    "4_true":"正印","4_false":"偏印",
  };
  return map[`${rel}_${sameYinYang}`] || "比肩";
}

/* ═══════════════════════════════════════════════
 * 专业命书内容生成
 * ═══════════════════════════════════════════════ */
export function generateReportContent(
  bazi: BaziResult, customerName: string, birthDate: string, birthTime: string
): ReportContent {
  const dmGan = bazi.dayPillar.gan, dmZhi = bazi.dayPillar.zhi;
  const dmWx = GAN_WX[dmGan], dmWxName = WUXING_NAMES[dmWx], dmWxEn = WUXING_NAMES_EN[dmWx];
  const dmC = WUXING_COLORS[dmWx];

  // 统计
  const total = bazi.wuxingCount.reduce((s,c)=>s+c,0);
  const wd = bazi.wuxingCount.map((c,i)=>({name:WUXING_NAMES[i],nameEn:WUXING_NAMES_EN[i],count:c,percentage:Math.round(c/total*100),color:WUXING_COLORS[i],barWidth:Math.max(4,Math.round(c/total*100))}));
  const sorted = bazi.wuxingCount.map((c,i)=>({c,i})).sort((a,b)=>b.c-a.c);
  const domIdx=sorted[0].i, secIdx=sorted[1].i;
  const domName=WUXING_NAMES[domIdx], secName=WUXING_NAMES[secIdx];
  const missing = bazi.missingElements.map((i:number)=>({name:WUXING_NAMES[i],nameEn:WUXING_NAMES_EN[i]}));

  // 日主强弱
  const selfCount = bazi.wuxingCount[dmWx];
  const shengWo = bazi.wuxingCount[(dmWx+4)%5]; // 生我的
  const woSheng = bazi.wuxingCount[(dmWx+1)%5]; // 我生的
  const keWo = bazi.wuxingCount[(dmWx+2)%5];   // 克我的
  const woKe = bazi.wuxingCount[(dmWx+3)%5];   // 我克的
  const strength = selfCount + shengWo;
  const drain = woSheng + keWo;
  const level = strength >= 6 ? "偏旺" : strength >= 4 ? "中和" : strength >= 2 ? "偏弱" : "弱";

  // 用神
  const yongshen = level === "偏旺" ? (woSheng >= woKe ? (dmWx+1)%5 : (dmWx+3)%5) :
                   level === "弱" ? (dmWx+4)%5 :
                   (strength > drain ? (dmWx+1)%5 : (dmWx+4)%5);
  const ysName = WUXING_NAMES[yongshen], ysEn = WUXING_NAMES_EN[yongshen];

  // 十神
  const yearSS = getShiShen(dmGan, bazi.yearPillar.gan);
  const monthSS = getShiShen(dmGan, bazi.monthPillar.gan);
  const hourSS = getShiShen(dmGan, bazi.hourPillar.gan);

  /* ── 命书正文 ── */
  const ygz = `${bazi.yearPillar.ganName}${bazi.yearPillar.zhiName}`;
  const mgz = `${bazi.monthPillar.ganName}${bazi.monthPillar.zhiName}`;
  const dgz = `${bazi.dayPillar.ganName}${bazi.dayPillar.zhiName}`;
  const hgz = `${bazi.hourPillar.ganName}${bazi.hourPillar.zhiName}`;
  const mzhi = DI_ZHI[bazi.monthPillar.zhi]; // 月支
  const dmGanName = TIAN_GAN[dmGan], dmZhiName = DI_ZHI[dmZhi];

  const overview = `命主${customerName}，八字排盘：${ygz}年 ${mgz}月 ${dgz}日 ${hgz}时。`
    + `日主${dmGanName}，五行属${dmWxName}，生于${mzhi}月。`
    + `月令${mzhi}藏干${[dmWxName]}气，日主${level === "偏旺" ? "得令得地，自身强旺" : level === "偏弱" ? "失令失地，自身偏弱" : "中和平衡"}。`
    + `全局${domName}${sorted[0].c}重${secName}${sorted[1].c}辅，${missing.length > 0 ? "缺" + missing.map((m:any)=>m.name).join("、") + "，需调候补足" : "五行俱全，流通有情"}。`
    + `年柱透${yearSS}，月柱透${monthSS}，时柱透${hourSS}。`
    + `取${ysName}为用神，喜${ysEn}，忌${WUXING_NAMES[(yongshen+2)%5]}。`;

  const overviewEn = `${customerName}'s Bazi: ${bazi.yearPillar.ganNameEn} ${bazi.yearPillar.zhiNameEn} year, `
    + `${bazi.monthPillar.ganNameEn} ${bazi.monthPillar.zhiNameEn} month, `
    + `${bazi.dayPillar.ganNameEn} ${bazi.dayPillar.zhiNameEn} day, `
    + `${bazi.hourPillar.ganNameEn} ${bazi.hourPillar.zhiNameEn} hour. `
    + `Day Master ${dmGanName} (${dmWxEn}). Born in ${mzhi} month, ${level === "偏旺" ? "strong" : level === "偏弱" ? "weak" : "balanced"}. `
    + `Dominant ${domName} (${sorted[0].c}), secondary ${secName} (${sorted[1].c}). `
    + `${missing.length > 0 ? "Missing " + missing.map(m=>m.nameEn).join(", ") + "." : "All elements present."} `
    + `Yong Shen: ${ysEn}, favorable: ${ysEn}, unfavorable: ${WUXING_NAMES_EN[(yongshen+2)%5]}.`;

  // 十神分析性格
  const hasZhengYin = [yearSS, monthSS, hourSS].includes("正印");
  const hasShiShen = [yearSS, monthSS, hourSS].includes("食神");
  const hasZhengGuan = [yearSS, monthSS, hourSS].includes("正官");
  const hasQiSha = [yearSS, monthSS, hourSS].includes("七杀");

  const personality = `日主${dmGanName}，${dmWxName}性之人。`
    + `${dmWxName === "土" ? "厚重诚信，脚踏实地，有承载万物的包容力。" : dmWxName === "木" ? "正直仁德，积极向上，有蓬勃生长的生命力。" : dmWxName === "火" ? "热情奔放，光明磊落，有感染他人的温暖力量。" : dmWxName === "金" ? "刚毅果断，是非分明，有锐利清晰的判断力。" : "聪慧灵动，适应力强，有深邃敏锐的洞察力。"}`
    + `${hasZhengYin ? "月透正印，心地善良，重视名誉与学业。" : ""}`
    + `${hasShiShen ? "带食神，温和有才艺，懂得享受生活。" : ""}`
    + `${hasZhengGuan ? "正官在局，自律守规矩，有责任感。" : ""}`
    + `${hasQiSha ? "七杀透干，有魄力胆识，遇事果敢。" : ""}`
    + `${level === "偏旺" ? "自身强旺，主见强，不轻易受人左右。" : level === "偏弱" ? "性格内敛谨慎，遇事多思而后行。" : "刚柔并济，行事有度。"}`;

  const career = `日主${level === "偏旺" ? "强旺" : level === "偏弱" ? "偏弱" : "中和"},`
    + `宜从事${ysName}性行业。${ysName === "木" ? "文教、出版、园林、中医、生态农业" : ysName === "火" ? "能源、餐饮、文化传媒、教育培训、互联网" : ysName === "土" ? "房地产、建筑、矿产、农业、仓储物流" : ysName === "金" ? "金融、法律、机械制造、精密仪器、军警" : "水利、航运、旅游、贸易、咨询服务"}`
    + `方向大利。${keWo > 3 ? "逢官杀运有晋升之机，但压力随之而来，需以印星化解。" : ""}`
    + `${woSheng > 2 ? "食伤生财，有技术专长和创造力，适合专业技术岗位或自主创业。" : ""}`;

  const careerEn = `Day Master ${level === "偏旺" ? "strong" : level === "偏弱" ? "weak" : "balanced"}. `
    + `Favorable ${ysEn} industries: ${ysEn === "Wood" ? "education, publishing, landscaping, TCM, eco-agriculture" : ysEn === "Fire" ? "energy, catering, media, training, internet" : ysEn === "Earth" ? "real estate, construction, mining, agriculture, logistics" : ysEn === "Metal" ? "finance, law, machinery, precision instruments, military" : "water conservancy, shipping, tourism, trade, consulting"}.`;

  const relationships = `日主${dmGanName}，${dmWxName === "土" ? "土厚载物，在感情中重责任和稳定，不善于表达浪漫但有长久的守护力。" : dmWxName === "木" ? "木主仁慈，待人真诚宽厚，但有时过于耿直易得罪人。" : dmWxName === "火" ? "火性热烈，感情主动热情，但需注意情绪起伏对外界的影响。" : dmWxName === "金" ? "金主义气，对伴侣忠诚，但有时过于理性缺少柔情。" : "水性柔善变，感情细腻丰富，但需注意安全感不足导致的摇摆。"}`
    + `${woKe > 3 ? "财星旺，异性缘好，但需分辨正缘与偏缘。" : ""}`
    + `${woSheng > 2 ? "食伤旺，懂得浪漫和表达，但注意言语伤人。" : ""}`;

  const relationshipsEn = `Day Master ${dmGanName} (${dmWxEn}). `
    + `${dmWxEn === "Earth" ? "Loyal and stable in relationships, values commitment over romance." : dmWxEn === "Wood" ? "Kind and sincere, but can be too direct." : dmWxEn === "Fire" ? "Passionate and proactive in love, but emotions can fluctuate." : dmWxEn === "Metal" ? "Faithful partner, but can be overly rational." : "Emotionally sensitive and adaptable, but may struggle with insecurity."}`;

  const health = `日主${level === "偏旺" ? "强旺" : level === "弱" ? "偏弱" : "中和"},`
    + `${dmWxName === "土" ? "脾胃功能需注意，避免暴饮暴食和生冷。" : dmWxName === "木" ? "肝胆为先天薄弱环节，注意情绪管理和作息规律。" : dmWxName === "火" ? "心血管系统需关注，避免过度劳累和熬夜。" : dmWxName === "金" ? "肺与大肠需养护，注意呼吸道和皮肤健康。" : "肾与泌尿系统为先天之本，注意保暖和饮水。"}`
    + `${missing.length > 0 ? `${missing.map((m:any)=>m.name).join("、")}过弱，对应的${dmWxName === "土" ? "土弱消化弱" : dmWxName === "木" ? "木弱易疲劳" : dmWxName === "火" ? "火弱畏寒" : dmWxName === "金" ? "金弱易感冒" : "水弱易上火"}，需在饮食起居中注意补益。` : ""}`
    + `${keWo > 4 ? "官杀过旺，压力对健康影响明显，需学会调节。" : ""}`;

  const healthEn = `Day Master ${level}. ${dmWxEn === "Earth" ? "Watch digestive health." : dmWxEn === "Wood" ? "Liver and gallbladder care." : dmWxEn === "Fire" ? "Cardiovascular health." : dmWxEn === "Metal" ? "Respiratory and skin health." : "Kidney and urinary health."}`;

  let f26 = `2026年丙午，流年天干丙火为正印透出，地支午火为日主禄地。`;
  if (ysName === "火") f26 += "喜用神得力，流年大利事业发展和个人成长，宜积极进取。";
  else if (ysName === "水") f26 += "午火冲水，流年略有动荡，需谨慎理财和人际交往。";
  else {
    const reas = yongshen === dmWx ? "比劫帮身，人缘和合作运势上升。" : yongshen === (dmWx + 4) % 5 ? "印星生身，学业和长辈缘佳。" : "食伤泄秀，利于创意表达和技术发挥。";
    f26 += "流年火旺，" + reas;
  }
  if (dmWxName === "水" && yongshen === 2) f26 += "注意午火偏旺克制日主，春夏交际需特别注意身体和决策。";
  const fortune2026 = f26;

  const fortune2026En = `2026 Bing Wu year. Heavenly Stem Bing Fire, Earthly Branch Wu Horse. `
    + `${ysEn === "Fire" ? "Favorable year for career and personal growth." : "Fire element active — " + (ysEn === "Water" ? "some turbulence, caution advised." : "social and collaborative energy rises.")}`;

  const advice = `一、${level === "偏旺" ? "宜克泄耗，多用${ysName}来平衡自身" : level === "偏弱" ? "宜生扶，多补${ysName}来增强自身" : "保持中和，顺势而为"}。`
    + `二、太岁${ygz}年生人，${bazi.shengXiao}年出生，逢本命年/三合年需留意太岁冲合。`
    + `三、${ysName}为用神，宜往${ysName === "木" ? "东方" : ysName === "火" ? "南方" : ysName === "土" ? "中部" : ysName === "金" ? "西方" : "北方"}发展。`;

  const adviceEn = `1. ${level === "偏旺" ? "Balance with " + ysEn : level === "偏弱" ? "Strengthen with " + ysEn : "Maintain balance"}. `
    + `2. ${ysEn} favorable — orient toward the ${ysEn === "Wood" ? "East" : ysEn === "Fire" ? "South" : ysEn === "Earth" ? "Center" : ysEn === "Metal" ? "West" : "North"}.`;

  /* ── 色彩与图腾 ── */
  const colorPalettes: Record<number, Array<{ hex:string; name:string; use:string }>> = {
    0: [{hex:"#7A9A7B",name:"苍绿",use:"主色·大面积使用"},{hex:"#A8C8A0",name:"嫩绿",use:"辅色·软装点缀"},{hex:"#5B4030",name:"深棕",use:"配色·家具木作"},{hex:"#F5EFE6",name:"暖白",use:"底色·墙面留白"},{hex:"#C0806E",name:"陶土红",use:"点缀·靠垫摆件"}],
    1: [{hex:"#C0806E",name:"朱砂红",use:"主色·主题墙面"},{hex:"#F0C0A0",name:"暖橙",use:"辅色·窗帘地毯"},{hex:"#3C342E",name:"墨色",use:"配色·线条边框"},{hex:"#FAF6F0",name:"暖白",use:"底色·大面积"},{hex:"#7A9A7B",name:"灰绿",use:"点缀·绿植"}],
    2: [{hex:"#B8956A",name:"赭石金",use:"主色·主题装饰"},{hex:"#E8D5B8",name:"沙色",use:"辅色·沙发面料"},{hex:"#5C4A3E",name:"咖啡棕",use:"配色·木地板"},{hex:"#F5EFE6",name:"象牙白",use:"底色·墙面"},{hex:"#C0806E",name:"陶土红",use:"点缀·花瓶"}],
    3: [{hex:"#8C827A",name:"银灰",use:"主色·金属件"},{hex:"#F5F2F0",name:"珍珠白",use:"辅色·大面积"},{hex:"#3C342E",name:"墨色",use:"配色·框架"},{hex:"#FAF6F0",name:"暖白",use:"底色·墙面"},{hex:"#6A8AA0",name:"宝石蓝",use:"点缀·小物"}],
    4: [{hex:"#6A8AA0",name:"深海蓝",use:"主色·主题墙"},{hex:"#B0C8D8",name:"浅蓝",use:"辅色·窗帘"},{hex:"#3C342E",name:"墨色",use:"配色·线条"},{hex:"#F5EFE6",name:"米白",use:"底色·大面积"},{hex:"#8C827A",name:"银色",use:"点缀·灯具"}],
  };

  const totemDescs: Record<number, { cn:string; en:string; elements:string[] }> = {
    0: {cn:"一棵扎根深山的千年古树，树冠日月同辉，树根溪流环绕",en:"An ancient tree rooted in deep mountains, sun and moon shining through its canopy",elements:["古树","日月","溪流","山峦"]},
    1: {cn:"一只展翅的金乌神鸟，周身火焰纹样，背景朝霞漫天",en:"A golden sunbird in flight, surrounded by flame motifs against a radiant dawn",elements:["金乌","火焰","朝霞","光环"]},
    2: {cn:"一座五色土构成的巍峨山峦，山顶有青铜鼎，山脚麦浪翻涌",en:"A majestic mountain of five-colored earth, a bronze vessel at its peak, wheat fields below",elements:["五色山","青铜鼎","麦浪","大地"]},
    3: {cn:"一柄直插云霄的青铜宝剑，剑身映着明月清辉，剑柄缠凤尾羽",en:"A bronze sword piercing the clouds, moonlight on its blade, phoenix feathers on the hilt",elements:["宝剑","明月","凤羽","云霄"]},
    4: {cn:"一条盘旋游龙从深海跃出，周身波涛翻涌，龙头朝向北斗七星",en:"A coiling dragon emerging from the deep sea, waves crashing, facing the Big Dipper",elements:["游龙","波涛","北斗","深海"]},
  };

  return {
    reportId: `BLUEPRINT-${Date.now().toString(36).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    customerName, birthDate, birthTime,
    dayMaster: { gan: dmGanName, ganEn: TIAN_GAN.map(g=>["Jia","Yi","Bing","Ding","Wu","Ji","Geng","Xin","Ren","Gui"])[dmGan], wuxing: dmWxName, wuxingEn: dmWxEn, color: dmC },
    baziDisplay: {
      year: ygz, month: mgz, day: dgz, hour: hgz,
      yearEn: `${bazi.yearPillar.ganNameEn} ${bazi.yearPillar.zhiNameEn}`,
      monthEn: `${bazi.monthPillar.ganNameEn} ${bazi.monthPillar.zhiNameEn}`,
      dayEn: `${bazi.dayPillar.ganNameEn} ${bazi.dayPillar.zhiNameEn}`,
      hourEn: `${bazi.hourPillar.ganNameEn} ${bazi.hourPillar.zhiNameEn}`,
    },
    dominantElement: domIdx, secondaryElement: secIdx,
    wuxingDistribution: wd,
    elementAnalysis: {
      profile: `日主${dmGanName}(${dmWxName})，${domName}${sorted[0].c}重${secName}${sorted[1].c}辅，${missing.length>0?"缺"+missing.map(m=>m.name).join("、"):"五行俱全"}。`,
      dominant: {name:domName,nameEn:WUXING_NAMES_EN[domIdx],desc:`${domName}${sorted[0].c}重，${sorted[0].c>=4?"气势旺盛":sorted[0].c>=2?"力量适中":"偏弱"}。${domName==="土"?"土厚则万物生，有承载之德":"土厚则万物生"}，${level}。`,descEn:`${WUXING_NAMES_EN[domIdx]} count ${sorted[0].c}, ${sorted[0].c>=4?"strong":sorted[0].c>=2?"moderate":"weak"}.`},
      secondary: {name:secName,nameEn:WUXING_NAMES_EN[secIdx],desc:`${secName}辅佐${domName}，${secName==="木"&&domName==="土"?"木克土为财，理财能力佳":"形成流通之势"}。`,descEn:`${WUXING_NAMES_EN[secIdx]} supports ${WUXING_NAMES_EN[domIdx]}.`},
      missing,
    },
    colorPalette: colorPalettes[dmWx],
    shengXiao: { name: bazi.shengXiao, nameEn: bazi.shengXiaoEn },
    dayun: generateDayun(bazi),
    disuitianshu: {
      yongshen: ysName, yongshenEn: ysEn,
      analysis: `日主${dmGanName}${level}，取${ysName}为用神。${ysName}能${yongshen === (dmWx+4)%5 ? `生扶日主${dmWxName}，补足自身力量` : yongshen === (dmWx+1)%5 ? `泄${dmWxName}之秀气，舒展才华` : `制衡局中过旺之气，调和五行`}。喜${ysEn}，忌${WUXING_NAMES[(yongshen+2)%5]}。`,
      analysisEn: `Day Master ${dmGanName} ${level}. Yong Shen: ${ysEn}. ${ysEn} ${yongshen===(dmWx+4)%5?"nourishes":yongshen===(dmWx+1)%5?"releases":"balances"} the Day Master. Favorable: ${ysEn}, Unfavorable: ${WUXING_NAMES_EN[(yongshen+2)%5]}.`,
      grade: level === "偏旺" ? "旺" : level === "偏弱" ? "弱" : "中",
    },
    mangpai: {
      pastTen: `${WUXING_NAMES[(dmWx+1)%5]}运奠基期`,
      pastTenEn: `${WUXING_NAMES_EN[(dmWx+1)%5]} foundation phase`,
      currentTen: `${ysName}运发展期`,
      currentTenEn: `${ysEn} growth phase`,
      flow: `日主${dmGanName}(${dmWxName})，${domName}${sorted[0].c}重做功。能量自${mgz}月起势，经${domName}流转，${ysName}通关。${missing.length>0?missing.map(m=>m.name).join("、")+"弱需在大运流年补足":"诸行流通"}。`,
    },
    lucky: {
      colors: colorPalettes[dmWx].map(c=>c.name),
      environments: [
        dmWx===0?"森林花园公园":dmWx===1?"阳光充沛的开放空间":dmWx===2?"山丘田野陶瓷工作室":dmWx===3?"现代建筑图书馆金属空间":"海边湖畔水族馆",
        dmWx===0?"茶园书房植物园":dmWx===1?"会议室舞台社交场所":dmWx===2?"农庄花园家居空间":dmWx===3?"画廊博物馆高层建筑":"浴室泳池河边步道",
        "光线柔和通风良好的空间","有自然元素和艺术品的环境","安静专注的工作区域","和谐的人际交往场所",
      ],
      timing: [
        ["春季","夏季","季末","秋季","冬季"][dmWx],
        "早晨5-7时（卯时）","新月和满月前后",
        `流年见${ysName}之岁`,`与日柱${dgz}三合六合之年`,
      ],
    },
    lifestyleTips: [
      {title:`补${ysName}为先`,titleEn:`Prioritize ${ysEn}`,tip:`${ysName==="木"?"多接触绿色植物，穿戴绿色衣物，饮食多吃蔬菜。":ysName==="火"?"多晒太阳，穿红色系衣服，饮食温热。":ysName==="土"?"多接触泥土，穿棕黄色系，饮食规律。":ysName==="金"?"佩戴金属饰品，穿白色系，饮食清淡。":"多近水源，穿蓝黑色系，饮食多汤水。"}${yongshen===(dmWx+4)%5?"因日主偏弱需大补":"因日主强旺需泄秀"}.`,tipEn:`${ysEn==="Wood"?"Surround yourself with plants and green tones.":ysEn==="Fire"?"Seek sunlight and warmth, wear red tones.":ysEn==="Earth"?"Connect with soil, wear earth tones.":ysEn==="Metal"?"Wear metal jewelry, white tones.":"Be near water, wear blue/black tones."}`},
      {title:`日主${dmGanName}${dmWxName}之养`,titleEn:`Nurture Your ${dmWxEn}`,tip:`${dmWx===0?"木主肝胆，早睡早起，适当拉伸运动。":dmWx===1?"火主心脏，避免过度劳累，午时休息片刻。":dmWx===2?"土主脾胃，饮食规律七分饱，少食生冷。":dmWx===3?"金主肺，深呼吸练习，避免烟尘环境。":"水主肾，保暖足部，适度饮水。"}`,tipEn:`${dmWxEn==="Wood"?"Rise early, stretch, care for your liver.":dmWxEn==="Fire"?"Rest at midday, avoid overwork.":dmWxEn==="Earth"?"Eat regularly, avoid cold foods.":dmWxEn==="Metal"?"Practice deep breathing, avoid smoke.":"Keep warm, stay hydrated."}`},
      {title:`用神${ysName}方向`,titleEn:`${ysEn} Direction`,tip:`大利往${ysName==="木"?"东方":ysName==="火"?"南方":ysName==="土"?"中部":ysName==="金"?"西方":"北方"}发展，事业${level==="偏旺"?"宜泄秀求财":"宜补身求官"}.`,tipEn:`Favorable direction: ${ysEn==="Wood"?"East":ysEn==="Fire"?"South":ysEn==="Earth"?"Center":ysEn==="Metal"?"West":"North"}.`},
      {title:"流年丙午展望",titleEn:"2026 Outlook",tip:`丙午年火旺，${ysName==="火"?"用神得地，大利进取，宜把握时机。":ysName==="水"?"火冲水，需稳健行事，注意财务和人际。" :"比劫/食伤/财星到位，顺势而为。"}`,tipEn:`2026 Fire year. ${ysEn==="Fire"?"Favorable — seize opportunities.":ysEn==="Water"?"Caution — stability first.":"Adapt and flow."}`},
    ],
    spaceTips: [
      {area:"客厅",areaEn:"Living Room",color:colorPalettes[dmWx][0].hex,advice:`${dmWx===0?"木命人客厅宜绿色主调，配原木家具和绿植。":dmWx===1?"火命人客厅宜暖色调，配暖光灯和红色点缀。":dmWx===2?"土命人客厅宜大地色系，配陶瓷和棉麻材质。":dmWx===3?"金命人客厅宜白色主调，配金属装饰。":"水命人客厅宜蓝灰色调，配水景或鱼缸。"}`,adviceEn:`${dmWxEn==="Wood"?"Green tones with natural wood furniture.":dmWxEn==="Fire"?"Warm lighting with red accents.":dmWxEn==="Earth"?"Earth tones with ceramic and linen.":dmWxEn==="Metal"?"White tones with metallic decor.":"Blue-gray tones with water features."}`},
      {area:"卧室",areaEn:"Bedroom",color:colorPalettes[dmWx][1].hex,advice:`${level==="偏旺"?"避免过强的${domName}能量，用${ysName}调和":"补${ysName}之气，助眠安神"}.`,adviceEn:`${level==="strong"?"Balance dominant element with calming tones.":"Nourish ${ysEn} for restful sleep."}`},
      {area:"书房",areaEn:"Study",color:colorPalettes[dmWx][3].hex,advice:`书房宜安静明亮，${ysName}性色调为主，${yongshen===1?"暖光增强火能量":yongshen===0?"绿植增强木能量":yongshen===2?"陶土装饰增强土能量":yongshen===3?"金属文具增强金能量":"蓝色装饰增强水能量"}利于专注。`,adviceEn:`Quiet and bright with ${ysEn} tones for focus.`},
    ],
    totemDescription: totemDescs[dmWx],
    mingShu: { overview, overviewEn, personality, career, careerEn, relationships, relationshipsEn, health, healthEn, fortune2026, fortune2026En, advice, adviceEn },
  };
}

/* ═══ 纳音表 + 大运 ═══ */
const NAYIN: Record<string,string> = {"甲子":"海中金","乙丑":"海中金","丙寅":"炉中火","丁卯":"炉中火","戊辰":"大林木","己巳":"大林木","庚午":"路旁土","辛未":"路旁土","壬申":"剑锋金","癸酉":"剑锋金","甲戌":"山头火","乙亥":"山头火","丙子":"涧下水","丁丑":"涧下水","戊寅":"城头土","己卯":"城头土","庚辰":"白蜡金","辛巳":"白蜡金","壬午":"杨柳木","癸未":"杨柳木","甲申":"泉中水","乙酉":"泉中水","丙戌":"屋上土","丁亥":"屋上土","戊子":"霹雳火","己丑":"霹雳火","庚寅":"松柏木","辛卯":"松柏木","壬辰":"长流水","癸巳":"长流水","甲午":"沙中金","乙未":"沙中金","丙申":"山下火","丁酉":"山下火","戊戌":"平地木","己亥":"平地木","庚子":"壁上土","辛丑":"壁上土","壬寅":"金箔金","癸卯":"金箔金","甲辰":"佛灯火","乙巳":"佛灯火","丙午":"天河水","丁未":"天河水","戊申":"大驿土","己酉":"大驿土","庚戌":"钗钏金","辛亥":"钗钏金","壬子":"桑柘木","癸丑":"桑柘木","甲寅":"大溪水","乙卯":"大溪水","丙辰":"沙中土","丁巳":"沙中土","戊午":"天上火","己未":"天上火","庚申":"石榴木","辛酉":"石榴木","壬戌":"大海水","癸亥":"大海水"};
const ZHI_WX=["水","土","木","木","土","火","火","土","金","金","土","水"];

function generateDayun(bazi: BaziResult): Array<{age:string;ganzhi:string;nayin:string;wuxing:string;desc:string;analysis:string}> {
  const r: Array<{age:string;ganzhi:string;nayin:string;wuxing:string;desc:string;analysis:string}> = [];
  const yg=bazi.yearPillar.gan, yz=bazi.yearPillar.zhi, mz=bazi.monthPillar.zhi;
  const fwd=yg%2===0; const sa=fwd?(12-mz+3)%10+3:(mz+8)%10+3;
  for(let i=0;i<8;i++){const a=sa+i*10;const zi=(mz+(fwd?i+1:-(i+1))+12)%12;const gi=(yg+(fwd?i+1:-(i+1))+10)%10;const gz=TIAN_GAN[gi]+DI_ZHI[zi];const na=NAYIN[gz]||"";const wx=ZHI_WX[zi];const phases=["童蒙起步","学习成长","事业上升","人生鼎盛","稳健发展","收获成熟","守成传承","安享晚年"];r.push({age:`${a}岁`,ganzhi:gz,nayin:na,wuxing:wx,desc:phases[i],analysis:`${gz}运，纳音${na}，${na.includes("金")?"金性刚锐，利决断和执行":na.includes("木")?"木性生发，利学习和成长":na.includes("水")?"水性流动，利变通和智慧":na.includes("火")?"火性光明，利名声和事业":na.includes("土")?"土性安稳，利积累和守成":"五行中和"},${wx}气当令。`});}
  return r;
}
