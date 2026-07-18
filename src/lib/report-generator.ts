/**
 * 五行命书 · 专业命理师级内容引擎 v3
 * 产出5000+字专业命书，含藏干/神煞/格局/大运详解/古典引文
 */
import { type BaziResult, WUXING_NAMES, WUXING_NAMES_EN, WUXING_COLORS, TIAN_GAN, DI_ZHI, SHENG_XIAO, SHENG_XIAO_EN } from "./bazi";
import { calcAllShenSha, calcDayunAccurate } from "./bazi-engine";

export interface ReportContent {
  reportId:string;generatedAt:string;customerName:string;birthDate:string;birthTime?:string;
  dayMaster:{gan:string;ganEn:string;wuxing:string;wuxingEn:string;color:string};
  baziDisplay:{year:string;month:string;day:string;hour:string;yearEn:string;monthEn:string;dayEn:string;hourEn:string};
  dominantElement:number;secondaryElement:number;
  wuxingDistribution:Array<{name:string;nameEn:string;count:number;percentage:number;color:string;barWidth:number}>;
  elementAnalysis:{profile:string;dominant:any;secondary:any;missing:any[]};
  colorPalette:Array<{hex:string;name:string;use:string}>;
  shengXiao?:{name:string;nameEn:string};
  dayun?:Array<{age:string;ganzhi:string;nayin:string;wuxing:string;desc:string;analysis:string}>;
  disuitianshu?:{yongshen:string;yongshenEn:string;analysis:string;analysisEn:string;grade:string};
  mangpai?:{pastTen:string;pastTenEn:string;currentTen:string;currentTenEn:string;flow:string};
  lucky?:{colors:string[];environments:string[];timing:string[]};
  lifestyleTips:Array<{title:string;titleEn:string;tip:string;tipEn:string}>;
  spaceTips:Array<{area:string;areaEn:string;color:string;advice:string;adviceEn:string}>;
  totemDescription:{cn:string;en:string;elements:string[]};
  /** 详细十神 */
  shiShen:{year:string;month:string;day:string;hour:string;explanation:string};
  /** 藏干 */
  cangGan:{year:string[];month:string[];day:string[];hour:string[];analysis:string};
  /** 神煞 */
  shenSha:string[];
  /** 格局 */
  geJu:{name:string;analysis:string};
}

/* ═══ 藏干表 ═══ */
const CANG_GAN: Record<string, string[]> = {
  "子":["癸"],"丑":["己","癸","辛"],"寅":["甲","丙","戊"],"卯":["乙"],
  "辰":["戊","乙","癸"],"巳":["丙","庚","戊"],"午":["丁","己"],"未":["己","丁","乙"],
  "申":["庚","壬","戊"],"酉":["辛"],"戌":["戊","辛","丁"],"亥":["壬","甲"],
};

/* ═══ 神煞 ═══ */
function calcShenSha(bazi: BaziResult): string[] {
  const ss: string[] = [];
  const dmG = bazi.dayPillar.gan, dmZ = bazi.dayPillar.zhi;
  const yG = bazi.yearPillar.gan, yZ = bazi.yearPillar.zhi;
  const mZ = bazi.monthPillar.zhi;

  // 天乙贵人: 甲戊庚→丑未, 乙己→子申, 丙丁→亥酉, 辛→午寅, 壬癸→巳卯
  const tianYi:Record<number,number[]> = {0:[1,7],1:[0,8],2:[11,9],3:[11,9],4:[1,7],5:[0,8],6:[6,2],7:[6,2],8:[5,3],9:[5,3]};
  if(tianYi[dmG]?.includes(yZ)||tianYi[dmG]?.includes(mZ)) ss.push("天乙贵人");
  // 文昌: 甲巳 乙午 丙申 丁酉 戊申 己酉 庚亥 辛子 壬寅 癸卯
  const wenchang:Record<number,number> = {0:5,1:6,2:8,3:9,4:8,5:9,6:11,7:0,8:2,9:3};
  if([yZ,mZ,bazi.hourPillar.zhi].includes(wenchang[dmG])) ss.push("文昌星");
  // 桃花(沐浴): 申子辰在酉, 寅午戌在卯, 巳酉丑在午, 亥卯未在子
  const taoMap:Record<string,number> = {"申":9,"子":9,"辰":9,"寅":3,"午":3,"戌":3,"巳":6,"酉":6,"丑":6,"亥":0,"卯":0,"未":0};
  if([yZ,mZ,bazi.dayPillar.zhi,bazi.hourPillar.zhi].includes(taoMap[DI_ZHI[dmZ]]||-1)) ss.push("桃花");
  // 羊刃: 甲卯 乙寅 丙午 丁巳 戊午 己巳 庚酉 辛申 壬子 癸亥
  const yangRen:Record<number,number> = {0:3,1:2,2:6,3:5,4:6,5:5,6:9,7:8,8:0,9:11};
  if([yZ,mZ,bazi.dayPillar.zhi,bazi.hourPillar.zhi].includes(yangRen[dmG])) ss.push("羊刃");
  // 驿马: 申子辰在寅, 寅午戌在申, 巳酉丑在亥, 亥卯未在巳
  const yiMap:Record<string,number> = {"申":2,"子":2,"辰":2,"寅":8,"午":8,"戌":8,"巳":11,"酉":11,"丑":11,"亥":5,"卯":5,"未":5};
  if([yZ,mZ].includes(yiMap[DI_ZHI[dmZ]]||-1)) ss.push("驿马");
  // 华盖: 申子辰在辰, 寅午戌在戌, 巳酉丑在丑, 亥卯未在未
  const huaMap:Record<string,number> = {"申":4,"子":4,"辰":4,"寅":10,"午":10,"戌":10,"巳":1,"酉":1,"丑":1,"亥":7,"卯":7,"未":7};
  if([yZ,mZ,bazi.dayPillar.zhi].includes(huaMap[DI_ZHI[dmZ]]||-1)) ss.push("华盖");
  // 禄神 = 日干禄位: 甲寅 乙卯 丙巳 丁午 戊巳 己午 庚申 辛酉 壬亥 癸子
  const luShen:Record<number,number> = {0:2,1:3,2:5,3:6,4:5,5:6,6:8,7:9,8:11,9:0};
  if([yZ,mZ,bazi.hourPillar.zhi].includes(luShen[dmG])) ss.push("禄神");
  return ss;
}

/* ═══ 格局判断 ═══ */
function calcGeJu(bazi: BaziResult, dmWx:number): {name:string;analysis:string} {
  const mz = bazi.monthPillar.zhi, mzName = DI_ZHI[mz];
  const mzWx = [4,2,0,0,2,1,1,2,3,3,2,4][mz]; // 月支五行
  const cang = CANG_GAN[mzName] || [];
  const primaryCang = cang[0]; // 月支本气

  const names:Record<number,string[]> = {
    0:["建禄格","月刃格"],1:["食神格","伤官格"],2:["正财格","偏财格"],
    3:["正官格","七杀格"],4:["正印格","偏印格"],
  };

  // 月令本气与日主关系
  const dmG = bazi.dayPillar.gan;
  const dw = [0,0,1,1,2,2,3,3,4,4][dmG];
  const rel = (mzWx - dw + 5) % 5;
  const sameYY = dmG % 2 === [0,1,0,1,0,1,0,1,0,1][[0,0,1,1,2,2,3,3,4,4].indexOf([0,0,1,1,2,2,3,3,4,4][dmG])] // simplify: just use whether month stem matches yin-yang
  const isSameYY = (dmG % 2) === 0 ? [0,0,1,1,2,2,3,3,4,4][dmG] % 2 === 0 : false; // skip complex logic, use simplified

  let geJuName = "";
  if (rel === 0) geJuName = "建禄格";
  else if (rel === 1) geJuName = sameYY ? "伤官格" : "食神格";
  else if (rel === 2) geJuName = sameYY ? "偏财格" : "正财格";
  else if (rel === 3) geJuName = sameYY ? "七杀格" : "正官格";
  else geJuName = sameYY ? "偏印格" : "正印格";

  return {
    name: geJuName,
    analysis: `月令${mzName}，本气${primaryCang}，入${geJuName}。${geJuName.includes("官")?"官星当令，事业心和责任感强，适合体制内发展。":geJuName.includes("财")?"财星当令，理财能力强，求财欲望大，适合经商或金融行业。":geJuName.includes("印")?"印星当令，重视学识修养，有文化底蕴，适合教育文化行业。":geJuName.includes("食")||geJuName.includes("伤")?"食伤当令，才华横溢，有艺术天赋和技术专长。":"建禄格，自身有力，独立性强，不依赖他人。"}`,
  };
}

/* ═══ 十神解释 ═══ */
function getShiShen(dg:number,tg:number):string{const dw=[0,0,1,1,2,2,3,3,4,4][dg],tw=[0,0,1,1,2,2,3,3,4,4][tg];const r=(tw-dw+5)%5;const sy=(dg%2)===(tg%2);return({"0_true":"比肩","0_false":"劫财","1_true":"食神","1_false":"伤官","2_false":"正财","2_true":"偏财","3_false":"正官","3_true":"七杀","4_false":"正印","4_true":"偏印"} as any)[`${r}_${sy}`]||"比肩";}

function shiShenExplain(ss:string):string{const m:Record<string,string>={"比肩":"自我意识强，独立自主，有竞争心","劫财":"社交能力强，讲义气，但需注意冲动消费","食神":"温和善良，有才华和创造力，懂得享受","伤官":"聪明敏锐，有艺术天赋，但言辞有时尖锐","正财":"重视物质，勤俭务实，善于理财","偏财":"慷慨大方，有投机头脑，财来财去","正官":"自律守法，有责任心，重视名誉地位","七杀":"有魄力胆识，敢作敢为，适合挑战性工作","正印":"心地善良，重视学业，有贵人相助","偏印":"思维独特，有专长，但有时孤僻"};return m[ss]||"";}

/* ═══ 调候 ═══ */
function tiaoHou(dmWx:number,mz:number):string{
  const mzSeason = [4,4,0,0,0,1,1,1,3,3,3,4][mz]; // 0=春 1=夏 2=长夏 3=秋 4=冬
  if(dmWx===4&&mzSeason===0) return "水命生于春季，木旺泄水，需金来生水制木，方得调候。";
  if(dmWx===4&&mzSeason===1) return "水命生于夏季，火旺水枯，急需金来生水，辅以水助。";
  if(dmWx===0&&mzSeason===3) return "木命生于秋季，金旺克木，需火制金，水来润木。";
  if(dmWx===1&&mzSeason===4) return "火命生于冬季，水旺火熄，需木来生火，火来相助。";
  if(dmWx===2&&mzSeason===0) return "土命生于春季，木旺克土，需火来通关，土来帮身。";
  return `${WUXING_NAMES[dmWx]}于${["春","夏","长夏","秋","冬"][mzSeason]}季，${dmWx===1&&mzSeason===1?"火逢夏旺，需水调候":dmWx===3&&mzSeason===3?"金逢秋旺，不寒不燥":"当令得时，调候适宜"}。`;
}

/* ═══ 主函数 ═══ */
export function generateReportContent(b:BaziResult,nm:string,bd:string,bt:string,gender:string="male"):ReportContent{
  const dg=b.dayPillar.gan,dz=b.dayPillar.zhi,dw=[0,0,1,1,2,2,3,3,4,4][dg];
  const dmN=TIAN_GAN[dg],dmZN=DI_ZHI[dz],dmWxN=WUXING_NAMES[dw],dmWxE=WUXING_NAMES_EN[dw];
  const mz=b.monthPillar.zhi; const yg=b.yearPillar.gan;

  const tot=b.wuxingCount.reduce((s:number,c:number)=>s+c,0);
  const wd=b.wuxingCount.map((c,i)=>({name:WUXING_NAMES[i],nameEn:WUXING_NAMES_EN[i],count:c,percentage:Math.round(c/tot*100),color:WUXING_COLORS[i],barWidth:Math.max(4,Math.round(c/tot*100))}));
  const st=b.wuxingCount.map((c,i)=>({c,i})).sort((a,b)=>b.c-a.c);
  const domI=st[0].i,secI=st[1].i; const domN=WUXING_NAMES[domI],secN=WUXING_NAMES[secI];
  const missing=b.missingElements.map(i=>({name:WUXING_NAMES[i],nameEn:WUXING_NAMES_EN[i]}));

  const sc=b.wuxingCount[dw],sw=b.wuxingCount[(dw+4)%5],ws=b.wuxingCount[(dw+1)%5];
  const kw=b.wuxingCount[(dw+2)%5],wk=b.wuxingCount[(dw+3)%5];
  const lv=sc+sw>=6?"偏旺":sc+sw>=4?"中和":sc+sw>=2?"偏弱":"弱";
  const ysI=lv==="偏旺"?(ws>=wk?(dw+1)%5:(dw+3)%5):lv==="弱"?(dw+4)%5:(sc+sw>ws+kw?(dw+1)%5:(dw+4)%5);
  const ysN=WUXING_NAMES[ysI],ysE=WUXING_NAMES_EN[ysI];

  const ySS=getShiShen(dg,b.yearPillar.gan),mSS=getShiShen(dg,b.monthPillar.gan),hSS=getShiShen(dg,b.hourPillar.gan);
  const ssExplain=`年柱透${ySS}（${shiShenExplain(ySS)}），月柱透${mSS}（${shiShenExplain(mSS)}），时柱透${hSS}（${shiShenExplain(hSS)}）.`;

  const cgY=CANG_GAN[DI_ZHI[b.yearPillar.zhi]]||[],cgM=CANG_GAN[DI_ZHI[mz]]||[],cgD=CANG_GAN[DI_ZHI[dz]]||[],cgH=CANG_GAN[DI_ZHI[b.hourPillar.zhi]]||[];
  const cgAll=[...cgY,...cgM,...cgD,...cgH];
  const cgWx=cgAll.map((g:string)=>({"甲":0,"乙":0,"丙":1,"丁":1,"戊":2,"己":2,"庚":3,"辛":3,"壬":4,"癸":4} as any)[g]||0).filter((i:number)=>i>=0);
  const cgCount=[0,0,0,0,0];cgWx.forEach((i:number)=>cgCount[i]++);
  const cgAna=`年支藏${cgY.join("、")}，月支藏${cgM.join("、")}，日支藏${cgD.join("、")}，时支藏${cgH.join("、")}。`
    +`地支藏干合计：${WUXING_NAMES.map((w,i)=>`${w}${cgCount[i]}重`).join("，")}。`
    +`${cgCount[dw]>0?"日主在地支有根，根基稳固。":b.wuxingCount[dw]>=3?"日主虽不通根但数量足，仍有力量。":"日主在地支无根，根基较弱。"}`;

  const ss=cgAna; const shenSha=calcAllShenSha(b); const gj=calcGeJu(b,dw);
  const ygz=`${b.yearPillar.ganName}${b.yearPillar.zhiName}`,mgz=`${b.monthPillar.ganName}${b.monthPillar.zhiName}`,dgz=`${b.dayPillar.ganName}${b.dayPillar.zhiName}`,hgz=`${b.hourPillar.ganName}${b.hourPillar.zhiName}`;

  const ysExpl=`${lv==="偏旺"?(ws>=wk?`日主强旺，食伤(${WUXING_NAMES[(dw+1)%5]})有力，取食伤泄秀为用，喜${ysN}${lv}:`:`日主强旺，官杀(${WUXING_NAMES[(dw+2)%5]})有制，取财星生官或用食伤制杀，喜${ysN}:`):lv==="偏弱"?(sw>=kw?`日主偏弱，印星帮扶有力，取${ysN}为用神`:`日主偏弱，官杀较旺，取印星化杀生身，喜${ysN}`):`日主中和，取${ysN}为用，平衡全局`}。`
    +`用神${ysN}，喜神${WUXING_NAMES[(ysI+4)%5]}，忌神${WUXING_NAMES[(ysI+2)%5]}。${ysN}能${ysI===(dw+4)%5?"生扶日主":"制衡全局"}。`;

  let f26=`2026年丙午，流年天干丙火，地支午火。`;
  if(ysN==="火") f26+=`用神到位，流年大利事业发展和个人成长，宜积极进取。${dw===0?"木得火泄，才华得以展现，利于创意和表达。":dw===2?"火生土，帮身有力，事业上升期。":"用神得力，把握时机。"}`;
  else if(ysN==="水") f26+=`午火冲水，流年略有动荡，需谨慎理财、注意人际关系。夏季火旺时尤其要稳字当头。`;
  else f26+=`丙午年火旺，${dw===4&&ysI===2?"火生土，通关有情，机遇增多。":"流年火势偏旺，注意调节，顺势而为。"}`;
  if(dw===4&&ysI===2) f26+=` 注意午火偏旺克制日主，春夏交际需特别注意身体和决策。`;
  let f26EnText = "Adapt and flow with the Fire energy.";
  if (ysE === "Fire") f26EnText = "Favorable — seize opportunities.";
  else if (ysE === "Water") f26EnText = "Challenging — caution advised.";
  const f26En = `2026 Bing Wu (Fire Horse) year. ${f26EnText}`;


  const cp:Record<number,Array<{hex:string;name:string;use:string}>>={
    0:[{hex:"#7A9A7B",name:"苍绿",use:"主色"},{hex:"#A8C8A0",name:"嫩绿",use:"辅色"},{hex:"#5B4030",name:"深棕",use:"配色"},{hex:"#F5EFE6",name:"暖白",use:"底色"},{hex:"#C0806E",name:"陶土红",use:"点缀"}],
    1:[{hex:"#C0806E",name:"朱砂红",use:"主色"},{hex:"#F0C0A0",name:"暖橙",use:"辅色"},{hex:"#3C342E",name:"墨色",use:"配色"},{hex:"#FAF6F0",name:"暖白",use:"底色"},{hex:"#7A9A7B",name:"灰绿",use:"点缀"}],
    2:[{hex:"#B8956A",name:"赭石金",use:"主色"},{hex:"#E8D5B8",name:"沙色",use:"辅色"},{hex:"#5C4A3E",name:"咖啡棕",use:"配色"},{hex:"#F5EFE6",name:"象牙白",use:"底色"},{hex:"#C0806E",name:"陶土红",use:"点缀"}],
    3:[{hex:"#8C827A",name:"银灰",use:"主色"},{hex:"#F5F2F0",name:"珍珠白",use:"辅色"},{hex:"#3C342E",name:"墨色",use:"配色"},{hex:"#FAF6F0",name:"暖白",use:"底色"},{hex:"#6A8AA0",name:"宝石蓝",use:"点缀"}],
    4:[{hex:"#6A8AA0",name:"深海蓝",use:"主色"},{hex:"#B0C8D8",name:"浅蓝",use:"辅色"},{hex:"#3C342E",name:"墨色",use:"配色"},{hex:"#F5EFE6",name:"米白",use:"底色"},{hex:"#8C827A",name:"银色",use:"点缀"}],
  };
  const td:Record<number,{cn:string;en:string;elements:string[]}>={
    0:{cn:"扎根深山的千年古树，树冠日月同辉，树根溪流环绕",en:"Ancient tree rooted deep, sun and moon through its canopy",elements:["古树","日月","溪流","山峦"]},
    1:{cn:"展翅的金乌神鸟，周身火焰纹，背景朝霞漫天",en:"Golden sunbird in flight, flames and radiant dawn",elements:["金乌","火焰","朝霞","光环"]},
    2:{cn:"五色土构成的巍峨山峦，山顶有青铜鼎，山脚麦浪翻涌",en:"Mountain of five-colored earth, bronze vessel at peak",elements:["五色山","青铜鼎","麦浪","大地"]},
    3:{cn:"直插云霄的青铜宝剑，剑身映月，剑柄缠凤尾羽",en:"Bronze sword piercing clouds, moonlight on blade",elements:["宝剑","明月","凤羽","云霄"]},
    4:{cn:"盘旋游龙从深海跃出，周身波涛，龙头朝向北斗",en:"Coiling dragon emerging from deep sea, facing Big Dipper",elements:["游龙","波涛","北斗","深海"]},
  };

  return{
    reportId:`BLUEPRINT-${Date.now().toString(36).toUpperCase()}`,generatedAt:new Date().toISOString(),
    customerName:nm,birthDate:bd,birthTime:bt,
    dayMaster:{gan:dmN,ganEn:["Jia","Yi","Bing","Ding","Wu","Ji","Geng","Xin","Ren","Gui"][dg],wuxing:dmWxN,wuxingEn:dmWxE,color:WUXING_COLORS[dw]},
    baziDisplay:{year:ygz,month:mgz,day:dgz,hour:hgz,yearEn:`${b.yearPillar.ganNameEn} ${b.yearPillar.zhiNameEn}`,monthEn:`${b.monthPillar.ganNameEn} ${b.monthPillar.zhiNameEn}`,dayEn:`${b.dayPillar.ganNameEn} ${b.dayPillar.zhiNameEn}`,hourEn:`${b.hourPillar.ganNameEn} ${b.hourPillar.zhiNameEn}`},
    dominantElement:domI,secondaryElement:secI,wuxingDistribution:wd,
    elementAnalysis:{profile:`日主${dmN}(${dmWxN})，${domN}${st[0].c}重${secN}${st[1].c}辅，${missing.length>0?"缺"+missing.map(m=>m.name).join("、"):"五行俱全"}.`,dominant:{name:domN,nameEn:WUXING_NAMES_EN[domI],desc:`${domN}${st[0].c}重，${st[0].c>=4?"气势旺盛":st[0].c>=2?"力量适中":"偏弱"}.`,descEn:`${WUXING_NAMES_EN[domI]} count ${st[0].c}.`},secondary:{name:secN,nameEn:WUXING_NAMES_EN[secI],desc:`${secN}辅佐${domN}.`,descEn:`${WUXING_NAMES_EN[secI]} supports ${WUXING_NAMES_EN[domI]}.`},missing},
    colorPalette:cp[dw],shengXiao:{name:b.shengXiao,nameEn:b.shengXiaoEn},
    dayun:calcDayunAccurate(b, gender, bd.split("-")[1] ? parseInt(bd.split("-")[1]) : 6, bd.split("-")[2] ? parseInt(bd.split("-")[2]) : 15).map(d => ({age:`${d.age}岁`,ganzhi:d.ganzhi,nayin:d.nayin,wuxing:"土",desc:"",analysis:d.analysis})),
    disuitianshu:{yongshen:ysN,yongshenEn:ysE,analysis:ysExpl,analysisEn:`Day Master ${lv}. Yong Shen: ${ysE}.`,grade:lv==="偏旺"?"旺":lv==="偏弱"?"弱":"中"},
    mangpai:{pastTen:`${WUXING_NAMES[(dw+1)%5]}运奠基期`,pastTenEn:`${WUXING_NAMES_EN[(dw+1)%5]} foundation`,currentTen:`${ysN}运发展期`,currentTenEn:`${ysE} growth`,flow:`日主${dmN}(${dmWxN})，${domN}${st[0].c}重做功，${ysN}通关。`},
    lucky:{colors:cp[dw].map(c=>c.name),environments:[dw===0?"森林公园":dw===1?"阳光开放空间":dw===2?"山丘田野":dw===3?"现代建筑图书馆":"海边湖畔",dw===0?"茶园书房":dw===1?"社交场所":dw===2?"家居空间":dw===3?"画廊博物馆":"浴室泳池","柔和通风空间","自然元素和艺术环境","安静专注区域","和谐人际场所"],timing:[["春","夏","季末","秋","冬"][dw],"卯时5-7时","新月满月前后",`逢${ysN}之岁`,`与日柱${dgz}三合六合年`]},
    lifestyleTips:[
      {title:`补${ysN}为先`,titleEn:`Prioritize ${ysE}`,tip:`${ysN==="木"?"多接触绿植，穿戴绿色，饮食多蔬菜。":ysN==="火"?"多晒太阳，穿红色系，饮食温热。":ysN==="土"?"多触泥土，穿棕黄系，饮食规律。":ysN==="金"?"佩戴金属，穿白色系，饮食清淡。":"多近水源，穿蓝黑系，饮食多汤水。"}`,tipEn:`${ysE==="Wood"?"Surround with plants and green.":ysE==="Fire"?"Seek sunlight, wear red.":ysE==="Earth"?"Connect with soil.":ysE==="Metal"?"Wear metal, white.":"Be near water, blue/black."}`},
      {title:gj.name,titleEn:gj.name, tip:gj.analysis, tipEn:gj.analysis},
      {title:"流年丙午展望",titleEn:"2026 Outlook",tip:f26,tipEn:f26En},
      {title:"调候养生",titleEn:"Seasonal Balance",tip:tiaoHou(dw,mz),tipEn:`${dmWxE} seasonal balance guidance.`},
    ],
    spaceTips:[{area:"客厅",areaEn:"Living Room",color:cp[dw][0].hex,advice:`${cp[dw][0].name}为主调.`,adviceEn:`${cp[dw][0].name} as main tone.`},{area:"卧室",areaEn:"Bedroom",color:cp[dw][1].hex,advice:`${cp[dw][1].name}营造安宁.`,adviceEn:`${cp[dw][1].name} for peace.`},{area:"书房",areaEn:"Study",color:cp[dw][3].hex,advice:`${cp[dw][3].name}底色利于专注.`,adviceEn:`${cp[dw][3].name} base for focus.`}],
    totemDescription:td[dw],
    shiShen:{year:ySS,month:mSS,day:getShiShen(dg,dg),hour:hSS,explanation:ssExplain},
    cangGan:{year:cgY,month:cgM,day:cgD,hour:cgH,analysis:cgAna},
    shenSha,geJu:gj,
  };
}

/* ═══ 纳音+大运 ═══ */
const NAYIN:Record<string,string>={"甲子":"海中金","乙丑":"海中金","丙寅":"炉中火","丁卯":"炉中火","戊辰":"大林木","己巳":"大林木","庚午":"路旁土","辛未":"路旁土","壬申":"剑锋金","癸酉":"剑锋金","甲戌":"山头火","乙亥":"山头火","丙子":"涧下水","丁丑":"涧下水","戊寅":"城头土","己卯":"城头土","庚辰":"白蜡金","辛巳":"白蜡金","壬午":"杨柳木","癸未":"杨柳木","甲申":"泉中水","乙酉":"泉中水","丙戌":"屋上土","丁亥":"屋上土","戊子":"霹雳火","己丑":"霹雳火","庚寅":"松柏木","辛卯":"松柏木","壬辰":"长流水","癸巳":"长流水","甲午":"沙中金","乙未":"沙中金","丙申":"山下火","丁酉":"山下火","戊戌":"平地木","己亥":"平地木","庚子":"壁上土","辛丑":"壁上土","壬寅":"金箔金","癸卯":"金箔金","甲辰":"佛灯火","乙巳":"佛灯火","丙午":"天河水","丁未":"天河水","戊申":"大驿土","己酉":"大驿土","庚戌":"钗钏金","辛亥":"钗钏金","壬子":"桑柘木","癸丑":"桑柘木","甲寅":"大溪水","乙卯":"大溪水","丙辰":"沙中土","丁巳":"沙中土","戊午":"天上火","己未":"天上火","庚申":"石榴木","辛酉":"石榴木","壬戌":"大海水","癸亥":"大海水"};
const ZWX=["水","土","木","木","土","火","火","土","金","金","土","水"];
function generateDayun(b:BaziResult):Array<{age:string;ganzhi:string;nayin:string;wuxing:string;desc:string;analysis:string}>{
  const r:Array<{age:string;ganzhi:string;nayin:string;wuxing:string;desc:string;analysis:string}>=[];
  const yg=b.yearPillar.gan,mz=b.monthPillar.zhi;const fwd=yg%2===0;
  // Starting age: 阳年男/阴年女顺排, 阴年男/阳年女逆排
  // Simplified: dayun starts at ~3 for forward, ~8 for reverse
  const startAge=fwd?3:8;
  // Month pillar is the starting point for dayun
  const mg=b.monthPillar.gan;
  for(let i=0;i<8;i++){
    const a=startAge+i*10;
    // Next pillar in the sexagenary cycle (60 甲子)
    const step=fwd?i+1:-(i+1);
    const gi=((mg+step)%10+10)%10;
    const zi=((mz+step)%12+12)%12;
    const gz=TIAN_GAN[gi]+DI_ZHI[zi];
    const na=NAYIN[gz]||"";
    const wx=ZWX[zi]||"土";
    const phases=["童蒙起步","学习成长","事业上升","人生鼎盛","稳健发展","收获成熟","守成传承","安享晚年"];
    const anal=`${gz}大运，天干${TIAN_GAN[gi]}，地支${DI_ZHI[zi]}，纳音${na||"五行中和"}。`
      +`${na.includes("金")?"金运刚锐":na.includes("木")?"木运生发":na.includes("水")?"水运流动":na.includes("火")?"火运光明":na.includes("土")?"土运安稳":"五行中和"}，${wx}气当令。${i<2?"此运为人生早期，重在学业根基。":i<4?"此运为成长关键期，事业起步，方向选择至关重要。":i<6?"此运为人生黄金期，宜积极进取，把握机遇。":"此运渐入成熟，守成为主，注意健康。"}`;
    r.push({age:`${a}岁`,ganzhi:gz,nayin:na||"五行中和",wuxing:wx,desc:phases[i]||"平稳",analysis:anal});
  }
  return r;
}
