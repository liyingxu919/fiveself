/**
 * 八字命理增强引擎 v5
 * 融合: reed1898/bazi-tool + privilege404/bazi-shaoweihua (邵伟华风格)
 * 新增: 四季旺衰评分 / 格局体系 / 十专题 / 岁运触发
 */
import { type BaziResult, TIAN_GAN, DI_ZHI, WUXING_NAMES, WUXING_NAMES_EN } from "./bazi";

/* ═══ 基础常量 ═══ */
const STEM_ELEMENTS:Record<string,string>={"甲":"木","乙":"木","丙":"火","丁":"火","戊":"土","己":"土","庚":"金","辛":"金","壬":"水","癸":"水"};
const BRANCH_ELEMENTS:Record<string,string>={"子":"水","丑":"土","寅":"木","卯":"木","辰":"土","巳":"火","午":"火","未":"土","申":"金","酉":"金","戌":"土","亥":"水"};
const GAN_TO_WX:Record<string,number>={"甲":0,"乙":0,"丙":1,"丁":1,"戊":2,"己":2,"庚":3,"辛":3,"壬":4,"癸":4};

/* ═══ 藏干(含权重+角色) ═══ */
export const HIDDEN_STEMS: Record<string, Array<{stem:string;role:string;weight:number}>> = {
  "子":[{stem:"癸",role:"main_qi",weight:100}],"丑":[{stem:"己",role:"main_qi",weight:60},{stem:"癸",role:"middle_qi",weight:30},{stem:"辛",role:"residual_qi",weight:10}],
  "寅":[{stem:"甲",role:"main_qi",weight:60},{stem:"丙",role:"middle_qi",weight:30},{stem:"戊",role:"residual_qi",weight:10}],"卯":[{stem:"乙",role:"main_qi",weight:100}],
  "辰":[{stem:"戊",role:"main_qi",weight:60},{stem:"乙",role:"middle_qi",weight:30},{stem:"癸",role:"residual_qi",weight:10}],"巳":[{stem:"丙",role:"main_qi",weight:60},{stem:"庚",role:"middle_qi",weight:30},{stem:"戊",role:"residual_qi",weight:10}],
  "午":[{stem:"丁",role:"main_qi",weight:70},{stem:"己",role:"middle_qi",weight:30}],"未":[{stem:"己",role:"main_qi",weight:60},{stem:"丁",role:"middle_qi",weight:30},{stem:"乙",role:"residual_qi",weight:10}],
  "申":[{stem:"庚",role:"main_qi",weight:60},{stem:"壬",role:"middle_qi",weight:30},{stem:"戊",role:"residual_qi",weight:10}],"酉":[{stem:"辛",role:"main_qi",weight:100}],
  "戌":[{stem:"戊",role:"main_qi",weight:60},{stem:"辛",role:"middle_qi",weight:30},{stem:"丁",role:"residual_qi",weight:10}],"亥":[{stem:"壬",role:"main_qi",weight:70},{stem:"甲",role:"middle_qi",weight:30}],
};

/* ═══ 四季旺衰评分(邵伟华风格) ═══ */
const BRANCH_SEASON:Record<string,string>={"寅":"spring","卯":"spring","辰":"spring","巳":"summer","午":"summer","未":"summer","申":"autumn","酉":"autumn","戌":"autumn","亥":"winter","子":"winter","丑":"winter"};
const STATE_SCORES:Record<string,number>={"旺":45,"相":30,"休":0,"囚":-25,"死":-45};
export function analyzeStrength(chart:BaziResult):any{
  const dm=TIAN_GAN[chart.dayPillar.gan],dmEl=STEM_ELEMENTS[dm];
  const mz=DI_ZHI[chart.monthPillar.zhi],season=BRANCH_SEASON[mz]||"summer";
  // Season state
  const states:Record<string,Record<string,string>>={"spring":{"木":"旺","火":"相","水":"休","金":"囚","土":"死"},"summer":{"火":"旺","土":"相","木":"休","水":"囚","金":"死"},"autumn":{"金":"旺","水":"相","土":"休","火":"囚","木":"死"},"winter":{"水":"旺","木":"相","金":"休","土":"囚","火":"死"}};
  const ss=states[season]||states["summer"];
  const seasonScore=STATE_SCORES[ss[dmEl]]||0;
  // Root strength
  let rootScore=0;
  const roots:any[]=[];
  for(const pos of ["yearPillar","monthPillar","dayPillar","hourPillar"]){
    const p=(chart as any)[pos]; if(!p)continue;
    const hs=HIDDEN_STEMS[p.zhiName]||[];
    for(const h of hs){if(h.stem===dm){const s=h.role==="main_qi"?h.weight:h.role==="middle_qi"?h.weight*0.55:h.weight*0.25;rootScore+=s;roots.push({pillar:pos,role:h.role,score:s});}}
  }
  // Support/pressure
  const wxCount=[0,0,0,0,0];
  for(const pos of["yearPillar","monthPillar","dayPillar","hourPillar"]){
    const p=(chart as any)[pos]; if(!p)continue;
    wxCount[GAN_TO_WX[p.ganName]]+=1;
    const hs=HIDDEN_STEMS[p.zhiName]||[];
    for(const h of hs) wxCount[GAN_TO_WX[h.stem]]+=(h.role==="main_qi"?0.6:h.role==="middle_qi"?0.3:0.1);
  }
  const dmIdx=GAN_TO_WX[dm];
  const support=wxCount[(dmIdx+4)%5]; // 生我
  const drain=wxCount[(dmIdx+1)%5]; // 我生
  const pressure=wxCount[(dmIdx+2)%5]; // 克我
  const total=seasonScore+rootScore+support*12-pressure*12;
  const cls=total>=25?"身旺":total>=10?"中和偏旺":total>=-10?"中和":"身弱";
  return {dayMaster:dm,element:dmEl,seasonScore,rootScore,rootDetails:roots,supportScore:support*12,pressureScore:pressure*12,totalScore:Math.round(total),classification:cls,seasonState:ss[dmEl]};
}

/* ═══ 格局体系 ═══ */
export function analyzeStructure(chart:BaziResult,strength:any):any{
  const mz=DI_ZHI[chart.monthPillar.zhi],mzEl=BRANCH_ELEMENTS[mz];
  const dm=TIAN_GAN[chart.dayPillar.gan],dmEl=STEM_ELEMENTS[dm];
  const dmIdx=GAN_TO_WX[dm];
  const mzIdx=["木","火","土","金","水"].indexOf(mzEl);
  const rel=(mzIdx-dmIdx+5)%5;
  const geNames=["建禄/月刃","食伤格","财格","官杀格","印格"];
  const ge=geNames[rel]||"杂格";
  const yongshen=strength.classification.includes("旺")?["食伤","财","官杀"][rel===0?1:rel===1?1:2]:strength.classification.includes("弱")?["印","比劫"][0]:"调候用神";
  return {geName:ge,monthBranch:mz,monthElement:mzEl,yongshen,yongshenReason:`月令${mz}${mzEl}，日主${dmEl}，${ge}。${strength.classification}，取${yongshen}为用。`};
}

/* ═══ 十神 ═══ */
const GAN_POLARITY=[true,false,true,false,true,false,true,false,true,false];
export function getTenGod(dayStemIdx:number,otherStemIdx:number):string{
  if(dayStemIdx===otherStemIdx)return"比肩";
  const meWx=Math.floor(dayStemIdx/2),otherWx=Math.floor(otherStemIdx/2);
  const samePol=GAN_POLARITY[dayStemIdx]===GAN_POLARITY[otherStemIdx];
  const sheng=(otherWx+1)%5===meWx,ke=(otherWx+2)%5===meWx,woSheng=(meWx+1)%5===otherWx,woKe=(meWx+2)%5===otherWx;
  if(meWx===otherWx)return samePol?"比肩":"劫财";
  if(sheng)return samePol?"偏印":"正印";
  if(woSheng)return samePol?"食神":"伤官";
  if(ke)return samePol?"七杀":"正官";
  if(woKe)return samePol?"偏财":"正财";
  return"比肩";
}

/* ═══ 大运 ═══ */
export function calcDayunAccurate(b:BaziResult,gender:string,birthM:number,birthD:number):Array<{age:number;ganzhi:string;nayin:string;analysis:string}>{
  const yg=b.yearPillar.gan,mg=b.monthPillar.gan,mz=b.monthPillar.zhi;
  const isYang=GAN_POLARITY[yg],isMale=gender==="male";
  const forward=(isYang&&isMale)||(!isYang&&!isMale);
  const sa=forward?Math.round(((12-birthM+1.5)%12)*10/3)/10+1:Math.round((birthM*10/3))/10+1;
  const r:Array<{age:number;ganzhi:string;nayin:string;analysis:string}>=[];
  const NAYIN_MAP:Record<string,string>={"甲子":"海中金","乙丑":"海中金","丙寅":"炉中火","丁卯":"炉中火","戊辰":"大林木","己巳":"大林木","庚午":"路旁土","辛未":"路旁土","壬申":"剑锋金","癸酉":"剑锋金","甲戌":"山头火","乙亥":"山头火","丙子":"涧下水","丁丑":"涧下水","戊寅":"城头土","己卯":"城头土","庚辰":"白蜡金","辛巳":"白蜡金","壬午":"杨柳木","癸未":"杨柳木","甲申":"泉中水","乙酉":"泉中水","丙戌":"屋上土","丁亥":"屋上土","戊子":"霹雳火","己丑":"霹雳火","庚寅":"松柏木","辛卯":"松柏木","壬辰":"长流水","癸巳":"长流水","甲午":"沙中金","乙未":"沙中金","丙申":"山下火","丁酉":"山下火","戊戌":"平地木","己亥":"平地木","庚子":"壁上土","辛丑":"壁上土","壬寅":"金箔金","癸卯":"金箔金","甲辰":"佛灯火","乙巳":"佛灯火","丙午":"天河水","丁未":"天河水","戊申":"大驿土","己酉":"大驿土","庚戌":"钗钏金","辛亥":"钗钏金","壬子":"桑柘木","癸丑":"桑柘木","甲寅":"大溪水","乙卯":"大溪水","丙辰":"沙中土","丁巳":"沙中土","戊午":"天上火","己未":"天上火","庚申":"石榴木","辛酉":"石榴木","壬戌":"大海水","癸亥":"大海水"};
  const wxPhase=["童蒙","学业","事业","鼎盛","稳健","收获","守成","安享"];
  for(let i=0;i<8;i++){
    const step=forward?i+1:-(i+1),gi=((mg+step)%10+10)%10,zi=((mz+step)%12+12)%12;
    const gz=TIAN_GAN[gi]+DI_ZHI[zi],na=NAYIN_MAP[gz]||"五行中和";
    const naDesc=na.includes("金")?"金运刚锐":na.includes("木")?"木运生发":na.includes("水")?"水运流动":na.includes("火")?"火运光明":na.includes("土")?"土运安稳":"中和";
    r.push({age:Math.round(sa+i*10),ganzhi:gz,nayin:na,analysis:`${gz}运，纳音${na}，${naDesc}，${wxPhase[i]}期。${i<2?"早年根基":i<4?"青年发展":i<6?"中年鼎盛":"晚年收获"}，${naDesc}气运主导。`});
  }
  return r;
}

/* ═══ 神煞大全 ═══ */
export function calcAllShenSha(b:BaziResult):string[]{
  const ss:string[]=[],allZ=[b.yearPillar.zhi,b.monthPillar.zhi,b.dayPillar.zhi,b.hourPillar.zhi];
  const dmG=b.dayPillar.gan,dmZ=b.dayPillar.zhi,dmZN=DI_ZHI[dmZ];
  // 天乙
  const ty:Record<number,number[]>={0:[1,7],1:[0,8],2:[11,9],3:[11,9],4:[1,7],5:[0,8],6:[6,2],7:[6,2],8:[5,3],9:[5,3]};
  if(ty[dmG]?.some(z=>allZ.includes(z)))ss.push("天乙贵人");
  // 文昌
  const wc:Record<number,number>={0:5,1:6,2:8,3:9,4:8,5:9,6:11,7:0,8:2,9:3};
  if(allZ.includes(wc[dmG]))ss.push("文昌星");
  // 桃花
  const th:Record<string,string[]>={"申":["酉"],"子":["酉"],"辰":["酉"],"寅":["卯"],"午":["卯"],"戌":["卯"],"巳":["午"],"酉":["午"],"丑":["午"],"亥":["子"],"卯":["子"],"未":["子"]};
  if(th[dmZN]?.some(z=>allZ.includes(DI_ZHI.indexOf(z))))ss.push("桃花");
  // 驿马
  const ym:Record<string,string[]>={"申":["寅"],"子":["寅"],"辰":["寅"],"寅":["申"],"午":["申"],"戌":["申"],"巳":["亥"],"酉":["亥"],"丑":["亥"],"亥":["巳"],"卯":["巳"],"未":["巳"]};
  if(ym[dmZN]?.some(z=>[b.yearPillar.zhi,b.monthPillar.zhi].includes(DI_ZHI.indexOf(z))))ss.push("驿马");
  // 华盖
  const hg:Record<string,string[]>={"申":["辰"],"子":["辰"],"辰":["辰"],"寅":["戌"],"午":["戌"],"戌":["戌"],"巳":["丑"],"酉":["丑"],"丑":["丑"],"亥":["未"],"卯":["未"],"未":["未"]};
  if(hg[dmZN]?.some(z=>allZ.includes(DI_ZHI.indexOf(z))))ss.push("华盖");
  // 禄神
  const ls:Record<number,number>={0:2,1:3,2:5,3:6,4:5,5:6,6:8,7:9,8:11,9:0};
  if(allZ.includes(ls[dmG]))ss.push("禄神");
  // 羊刃
  const yr:Record<number,number>={0:3,1:2,2:6,3:5,4:6,5:5,6:9,7:8,8:0,9:11};
  if(allZ.includes(yr[dmG]))ss.push("羊刃");
  // 天德/月德
  const td:Record<string,string>={"寅":"丁","卯":"申","辰":"壬","巳":"辛","午":"亥","未":"甲","申":"癸","酉":"寅","戌":"丙","亥":"乙","子":"巳","丑":"庚"};
  if(td[DI_ZHI[b.monthPillar.zhi]])ss.push("天德");
  const yd:Record<string,string>={"寅":"丙","卯":"甲","辰":"壬","巳":"庚","午":"丙","未":"甲","申":"壬","酉":"庚","戌":"丙","亥":"甲","子":"壬","丑":"庚"};
  if(yd[DI_ZHI[b.monthPillar.zhi]])ss.push("月德");
  // 将星
  const jx:Record<string,string[]>={"申":["子"],"子":["子"],"辰":["子"],"亥":["卯"],"卯":["卯"],"未":["卯"],"寅":["午"],"午":["午"],"戌":["午"],"巳":["酉"],"酉":["酉"],"丑":["酉"]};
  if(jx[dmZN]?.some(z=>allZ.includes(DI_ZHI.indexOf(z))))ss.push("将星");
  // 天喜
  const txi:Record<string,string>={"申":"卯","子":"卯","辰":"卯","寅":"酉","午":"酉","戌":"酉","巳":"午","酉":"午","丑":"午","亥":"子","卯":"子","未":"子"};
  if(txi[dmZN]&&allZ.includes(DI_ZHI.indexOf(txi[dmZN])))ss.push("天喜");
  // 红鸾
  const hl:Record<string,string[]>={"寅":["丑"],"卯":["丑"],"丑":["丑"],"亥":["未"],"子":["未"],"未":["未"],"申":["辰"],"酉":["辰"],"戌":["辰"],"巳":["戌"],"午":["戌"],"辰":["戌"]};
  if(hl[dmZN]?.some(z=>allZ.includes(DI_ZHI.indexOf(z))))ss.push("红鸾");
  return[...new Set(ss)];
}

/* ═══ 五行加权计分 ═══ */
export function analyzeWuxingWeighted(b:BaziResult){const s=[0,0,0,0,0];for(const p of[b.yearPillar,b.monthPillar,b.dayPillar,b.hourPillar]){s[GAN_TO_WX[p.ganName]]+=1;const hs=HIDDEN_STEMS[p.zhiName]||[];for(const h of hs)s[GAN_TO_WX[h.stem]]+=(h.role==="main_qi"?0.6:h.role==="middle_qi"?0.3:0.1);}const t=s.reduce((a,b)=>a+b,0);return s.map((sc,i)=>({name:WUXING_NAMES[i],nameEn:WUXING_NAMES_EN[i],score:Math.round(sc*10)/10,percent:Math.round(sc/t*100)}));}

/* ═══ 刑冲合害 ═══ */
export function analyzeRelations(b:BaziResult):string[]{const r:string[]=[];const z=[b.yearPillar.zhiName,b.monthPillar.zhiName,b.dayPillar.zhiName,b.hourPillar.zhiName];const ch:Record<string,string>={"子":"午","午":"子","丑":"未","未":"丑","寅":"申","申":"寅","卯":"酉","酉":"卯","辰":"戌","戌":"辰","巳":"亥","亥":"巳"};for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)if(ch[z[i]]===z[j])r.push(`${z[i]}${z[j]}冲`);const he:Record<string,string>={"子":"丑","丑":"子","寅":"亥","亥":"寅","卯":"戌","戌":"卯","辰":"酉","酉":"辰","巳":"申","申":"巳","午":"未","未":"午"};for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)if(he[z[i]]===z[j])r.push(`${z[i]}${z[j]}合`);return r;}
