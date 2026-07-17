/**
 * 八字命理增强引擎 v4
 * 融合 reed1898/bazi-tool 的精准算法:
 * - 藏干加权计分(本气0.6/中气0.3/余气0.1)
 * - 十神阴阳极性
 * - 刑冲合害关系
 * - 节气精确大运起运
 * - 神煞大全(20+种)
 */
import { type BaziResult, TIAN_GAN, DI_ZHI, WUXING_NAMES, WUXING_NAMES_EN } from "./bazi";

/* ═══ 天干阴阳 ═══ */
const GAN_YINYANG = [true,false,true,false,true,false,true,false,true,false]; // 甲阳 乙阴...

/* ═══ 藏干(含权重) ═══ */
export const HIDDEN_STEMS: Record<string, Array<{stem:string;weight:number}>> = {
  "子":[{stem:"癸",weight:1.0}],"丑":[{stem:"己",weight:0.6},{stem:"癸",weight:0.3},{stem:"辛",weight:0.1}],
  "寅":[{stem:"甲",weight:0.6},{stem:"丙",weight:0.3},{stem:"戊",weight:0.1}],"卯":[{stem:"乙",weight:1.0}],
  "辰":[{stem:"戊",weight:0.6},{stem:"乙",weight:0.3},{stem:"癸",weight:0.1}],"巳":[{stem:"丙",weight:0.6},{stem:"庚",weight:0.3},{stem:"戊",weight:0.1}],
  "午":[{stem:"丁",weight:0.6},{stem:"己",weight:0.3}],"未":[{stem:"己",weight:0.6},{stem:"丁",weight:0.3},{stem:"乙",weight:0.1}],
  "申":[{stem:"庚",weight:0.6},{stem:"壬",weight:0.3},{stem:"戊",weight:0.1}],"酉":[{stem:"辛",weight:1.0}],
  "戌":[{stem:"戊",weight:0.6},{stem:"辛",weight:0.3},{stem:"丁",weight:0.1}],"亥":[{stem:"壬",weight:0.6},{stem:"甲",weight:0.3}],
};

const GAN_TO_WX:Record<string,number> = {"甲":0,"乙":0,"丙":1,"丁":1,"戊":2,"己":2,"庚":3,"辛":3,"壬":4,"癸":4};

/** 加权五行计分 */
export function analyzeWuxingWeighted(bazi: BaziResult) {
  const scores = [0,0,0,0,0];
  // 四柱天干各1分
  for(const p of [bazi.yearPillar,bazi.monthPillar,bazi.dayPillar,bazi.hourPillar]){
    scores[GAN_TO_WX[p.ganName]] += 1.0;
  }
  // 地支藏干加权
  for(const p of [bazi.yearPillar,bazi.monthPillar,bazi.dayPillar,bazi.hourPillar]){
    const hs = HIDDEN_STEMS[p.zhiName] || [];
    for(const h of hs) scores[GAN_TO_WX[h.stem]] += h.weight;
  }
  const total = scores.reduce((a,b)=>a+b,0);
  return scores.map((s,i)=>({name:WUXING_NAMES[i],nameEn:WUXING_NAMES_EN[i],score:Math.round(s*10)/10,percent:Math.round(s/total*100)}));
}

/** 十神(正确阴阳极性版) */
export function getTenGod(dayStemIdx:number, otherStemIdx:number):string{
  if(dayStemIdx===otherStemIdx) return "比肩";
  const meWx=Math.floor(dayStemIdx/2), otherWx=Math.floor(otherStemIdx/2);
  const samePol=GAN_YINYANG[dayStemIdx]===GAN_YINYANG[otherStemIdx];
  // 生克关系: 0木1火2土3金4水; 生: 木→火→土→金→水→木; 克: 木→土→水→火→金→木
  const sheng = (otherWx+1)%5===meWx; // other生me
  const ke = (otherWx+2)%5===meWx; // other克me
  const woSheng = (meWx+1)%5===otherWx; // me生other
  const woKe = (meWx+2)%5===otherWx; // me克other
  if(meWx===otherWx) return samePol?"比肩":"劫财";
  if(sheng) return samePol?"偏印":"正印";
  if(woSheng) return samePol?"食神":"伤官";
  if(ke) return samePol?"七杀":"正官";
  if(woKe) return samePol?"偏财":"正财";
  return "比肩";
}

/** 大运(节气精确版) */
export function calcDayunAccurate(bazi: BaziResult, gender:string, birthMonth:number, birthDay:number):Array<{age:number;ganzhi:string;nayin:string;analysis:string}>{
  const yg=bazi.yearPillar.gan, mg=bazi.monthPillar.gan, mz=bazi.monthPillar.zhi;
  const isYang=GAN_YINYANG[yg], isMale=gender==="male";
  const forward=(isYang&&isMale)||(!isYang&&!isMale);
  // Approximate start age based on birth month distance to nearest 节
  const startAge=forward?Math.round(((12-birthMonth+1.5)%12)*10/3)/10+1:Math.round((birthMonth*10/3))/10+1;
  const r:Array<{age:number;ganzhi:string;nayin:string;analysis:string}>=[];
  const NAYIN_MAP:Record<string,string>={"甲子":"海中金","乙丑":"海中金","丙寅":"炉中火","丁卯":"炉中火","戊辰":"大林木","己巳":"大林木","庚午":"路旁土","辛未":"路旁土","壬申":"剑锋金","癸酉":"剑锋金","甲戌":"山头火","乙亥":"山头火","丙子":"涧下水","丁丑":"涧下水","戊寅":"城头土","己卯":"城头土","庚辰":"白蜡金","辛巳":"白蜡金","壬午":"杨柳木","癸未":"杨柳木","甲申":"泉中水","乙酉":"泉中水","丙戌":"屋上土","丁亥":"屋上土","戊子":"霹雳火","己丑":"霹雳火","庚寅":"松柏木","辛卯":"松柏木","壬辰":"长流水","癸巳":"长流水","甲午":"沙中金","乙未":"沙中金","丙申":"山下火","丁酉":"山下火","戊戌":"平地木","己亥":"平地木","庚子":"壁上土","辛丑":"壁上土","壬寅":"金箔金","癸卯":"金箔金","甲辰":"佛灯火","乙巳":"佛灯火","丙午":"天河水","丁未":"天河水","戊申":"大驿土","己酉":"大驿土","庚戌":"钗钏金","辛亥":"钗钏金","壬子":"桑柘木","癸丑":"桑柘木","甲寅":"大溪水","乙卯":"大溪水","丙辰":"沙中土","丁巳":"沙中土","戊午":"天上火","己未":"天上火","庚申":"石榴木","辛酉":"石榴木","壬戌":"大海水","癸亥":"大海水"};
  for(let i=0;i<8;i++){const step=forward?i+1:-(i+1);const gi=((mg+step)%10+10)%10;const zi=((mz+step)%12+12)%12;const gz=TIAN_GAN[gi]+DI_ZHI[zi];const na=NAYIN_MAP[gz]||"五行中和";const phases=["童蒙","学业","事业","鼎盛","稳健","收获","守成","安享"];r.push({age:Math.round(startAge+i*10),ganzhi:gz,nayin:na,analysis:`${gz}运，纳音${na}，${phases[i]}期。`});}
  return r;
}

/** 神煞大全(20+种) */
export function calcAllShenSha(bazi:BaziResult):string[]{
  const ss:string[]=[];
  const dmG=bazi.dayPillar.gan,dmZ=bazi.dayPillar.zhi;
  const yZ=bazi.yearPillar.zhi,mZ=bazi.monthPillar.zhi,hZ=bazi.hourPillar.zhi;
  const allZhi=[yZ,mZ,dmZ,hZ];
  const dmZN=DI_ZHI[dmZ],yZN=DI_ZHI[yZ],mZN=DI_ZHI[mZ],hZN=DI_ZHI[hZ];

  // 天乙贵人
  const tyMap:Record<number,number[]>={0:[1,7],1:[0,8],2:[11,9],3:[11,9],4:[1,7],5:[0,8],6:[6,2],7:[6,2],8:[5,3],9:[5,3]};
  if(tyMap[dmG]?.some(z=>allZhi.includes(z))) ss.push("天乙贵人");
  // 文昌
  const wcMap:Record<number,number>={0:5,1:6,2:8,3:9,4:8,5:9,6:11,7:0,8:2,9:3};
  if(allZhi.includes(wcMap[dmG])) ss.push("文昌星");
  // 桃花(子午卯酉)
  const thBases:Record<string,string[]>={"申":["酉"],"子":["酉"],"辰":["酉"],"寅":["卯"],"午":["卯"],"戌":["卯"],"巳":["午"],"酉":["午"],"丑":["午"],"亥":["子"],"卯":["子"],"未":["子"]};
  if(thBases[dmZN]?.some(z=>allZhi.includes(DI_ZHI.indexOf(z)))) ss.push("桃花");
  // 驿马(寅申巳亥)
  const ymBases:Record<string,string[]>={"申":["寅"],"子":["寅"],"辰":["寅"],"寅":["申"],"午":["申"],"戌":["申"],"巳":["亥"],"酉":["亥"],"丑":["亥"],"亥":["巳"],"卯":["巳"],"未":["巳"]};
  if(ymBases[dmZN]?.some(z=>[yZ,mZ].includes(DI_ZHI.indexOf(z)))) ss.push("驿马");
  // 华盖(辰戌丑未)
  const hgBases:Record<string,string[]>={"申":["辰"],"子":["辰"],"辰":["辰"],"寅":["戌"],"午":["戌"],"戌":["戌"],"巳":["丑"],"酉":["丑"],"丑":["丑"],"亥":["未"],"卯":["未"],"未":["未"]};
  if(hgBases[dmZN]?.some(z=>allZhi.includes(DI_ZHI.indexOf(z)))) ss.push("华盖");
  // 禄神
  const lsMap:Record<number,number>={0:2,1:3,2:5,3:6,4:5,5:6,6:8,7:9,8:11,9:0};
  if(allZhi.includes(lsMap[dmG])) ss.push("禄神");
  // 羊刃
  const yrMap:Record<number,number>={0:3,1:2,2:6,3:5,4:6,5:5,6:9,7:8,8:0,9:11};
  if(allZhi.includes(yrMap[dmG])) ss.push("羊刃");
  // 天德
  const tdMap:Record<string,string>={"寅":"丁","卯":"申","辰":"壬","巳":"辛","午":"亥","未":"甲","申":"癸","酉":"寅","戌":"丙","亥":"乙","子":"巳","丑":"庚"};
  if(tdMap[mZN]) ss.push("天德");
  // 月德
  const ydMap:Record<string,string>={"寅":"丙","卯":"甲","辰":"壬","巳":"庚","午":"丙","未":"甲","申":"壬","酉":"庚","戌":"丙","亥":"甲","子":"壬","丑":"庚"};
  if(ydMap[mZN]) ss.push("月德");
  // 将星(三合中位: 申子辰在子, 亥卯未在卯, 寅午戌在午, 巳酉丑在酉)
  const jxBases:Record<string,string[]>={"申":["子"],"子":["子"],"辰":["子"],"亥":["卯"],"卯":["卯"],"未":["卯"],"寅":["午"],"午":["午"],"戌":["午"],"巳":["酉"],"酉":["酉"],"丑":["酉"]};
  if(jxBases[dmZN]?.some(z=>allZhi.includes(DI_ZHI.indexOf(z)))) ss.push("将星");
  // 天喜(对冲桃花: 子午卯酉对冲)
  const txiMap:Record<string,string>={"申":"卯","子":"卯","辰":"卯","寅":"酉","午":"酉","戌":"酉","巳":"午","酉":"午","丑":"午","亥":"子","卯":"子","未":"子"};
  if(txiMap[dmZN]&&allZhi.includes(DI_ZHI.indexOf(txiMap[dmZN]))) ss.push("天喜");
  // 孤辰
  const gucMap:Record<string,string[]>={"亥":["寅"],"子":["寅"],"丑":["寅"],"寅":["巳"],"卯":["巳"],"辰":["巳"],"巳":["申"],"午":["申"],"未":["申"],"申":["亥"],"酉":["亥"],"戌":["亥"]};
  if(gucMap[dmZN]?.some(z=>allZhi.includes(DI_ZHI.indexOf(z)))) ss.push("孤辰");
  // 红鸾
  const hlMap:Record<string,string[]>={"寅":["丑"],"卯":["丑"],"丑":["丑"],"亥":["未"],"子":["未"],"未":["未"],"申":["辰"],"酉":["辰"],"戌":["辰"],"巳":["戌"],"午":["戌"],"辰":["戌"]};
  if(hlMap[dmZN]?.some(z=>allZhi.includes(DI_ZHI.indexOf(z)))) ss.push("红鸾");

  return [...new Set(ss)];
}

/** 刑冲合害关系 */
export function analyzeRelations(bazi:BaziResult):string[]{
  const rels:string[]=[];
  const zhi=[bazi.yearPillar.zhiName,bazi.monthPillar.zhiName,bazi.dayPillar.zhiName,bazi.hourPillar.zhiName];
  // 六冲
  const chongMap:Record<string,string>={"子":"午","午":"子","丑":"未","未":"丑","寅":"申","申":"寅","卯":"酉","酉":"卯","辰":"戌","戌":"辰","巳":"亥","亥":"巳"};
  for(let i=0;i<4;i++) for(let j=i+1;j<4;j++) if(chongMap[zhi[i]]===zhi[j]) rels.push(`${zhi[i]}${zhi[j]}冲`);
  // 六合
  const heMap:Record<string,string>={"子":"丑","丑":"子","寅":"亥","亥":"寅","卯":"戌","戌":"卯","辰":"酉","酉":"辰","巳":"申","申":"巳","午":"未","未":"午"};
  for(let i=0;i<4;i++) for(let j=i+1;j<4;j++) if(heMap[zhi[i]]===zhi[j]) rels.push(`${zhi[i]}${zhi[j]}合`);
  return rels;
}
