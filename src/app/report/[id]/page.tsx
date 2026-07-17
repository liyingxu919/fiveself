"use client";

import { useEffect, useState, use } from "react";
import ReactECharts from "echarts-for-react";

/* ── Colors from reference image palette ── */
const P = {
  bg: "#f5f1e9", card: "#fdfbf7", border: "#e8e0d5",
  text: "#3a342c", muted: "#8a7e74", gold: "#b4956a",
  wood: "#6b8b6c", fire: "#c07668", earth: "#b4956a", metal: "#8a8078", water: "#5c7a9a",
};
const WX = ["木","火","土","金","水"];
const WXE = ["Wood","Fire","Earth","Metal","Water"];
const WXC = [P.wood, P.fire, P.earth, P.metal, P.water];
const wxColor = (name: string) => WXC[WX.indexOf(name)] || P.gold;

function useData(id: string) {
  const [d, setD] = useState<any>(null);
  const [l, setL] = useState(true);
  useEffect(() => {
    fetch(`/api/admin/report/${id}`,{signal:AbortSignal.timeout(12000)})
      .then(r=>r.json()).then(j=>{if(j?.report?.content){const c=typeof j.report.content==="string"?JSON.parse(j.report.content):j.report.content;setD(c);}}).catch(()=>{}).finally(()=>setL(false));
  },[id]);
  return {d,l};
}

export default function ReportPage({params}:{params:Promise<{id:string}>}) {
  const {id}=use(params); const {d,l}=useData(id);
  if(l) return <Wait>Loading...</Wait>;
  if(!d) return <Wait><p>Report not found</p><a href="/order" className="text-amber-700 underline text-sm">Generate new →</a></Wait>;

  const dm=d.dayMaster,ed=d.wuxingDistribution,an=d.elementAnalysis;
  const dmC=wxColor(dm.wuxing);

  return (
    <div style={{fontFamily:"Georgia,'Noto Serif SC',serif",background:P.bg,color:P.text,minHeight:"100vh"}}>
      <style>{`@media print{body{background:#fff!important;}.nop{display:none!important;}}@page{size:A4;margin:0;}`}</style>
      <div className="nop" style={{position:"fixed",top:20,right:20,zIndex:100}}>
        <button onClick={()=>window.print()} style={{background:P.gold,color:"#fff",border:"none",padding:"12px 28px",fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",borderRadius:2}}>Download PDF</button>
      </div>

      <Cover d={d} dm={dm} dmC={dmC} />
      <div style={{maxWidth:860,margin:"0 auto",padding:"0 24px"}}>
        <Section1 d={d} dm={dm} dmC={dmC} />
        <Section2 d={d} ed={ed} dmC={dmC} />
        <Section3 d={d} ed={ed} an={an} dmC={dmC} />
        <Section4 d={d} dmC={dmC} />
        <Section5 d={d} dmC={dmC} />
      </div>
      <Footer d={d} />
    </div>
  );
}

function Wait({children}:any){return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:P.bg,fontFamily:"Georgia,serif",color:P.text,padding:40,textAlign:"center"}}>{children}</div>;}

function Cover({d,dm,dmC}:any) {
  return (
    <div style={{textAlign:"center",padding:"140px 24px 120px",background:`linear-gradient(180deg,${P.card} 0%,${P.bg} 100%)`,borderBottom:`1px solid ${P.border}`}}>
      <p style={{fontSize:10,letterSpacing:"0.3em",textTransform:"uppercase",color:P.muted,margin:"0 0 32px"}}>Five Elements · Life Blueprint</p>
      <h1 style={{fontSize:"clamp(42px,7vw,80px)",fontWeight:300,margin:"0 0 20px",letterSpacing:"-0.02em",lineHeight:1.1}}>五行人生蓝图</h1>
      <div style={{width:120,height:120,borderRadius:"50%",background:dmC,margin:"40px auto",display:"flex",alignItems:"center",justifyContent:"center",fontSize:52,fontWeight:300,color:"#fff",boxShadow:`0 16px 48px ${dmC}40`}}>{dm.gan}</div>
      <p style={{fontSize:24,color:dmC,margin:"0 0 4px",fontWeight:300}}>{dm.ganEn} · {dm.wuxingEn} · {dm.wuxing}</p>
      <p style={{color:P.muted,fontSize:15,margin:"16px 0 0"}}>Prepared for <strong style={{color:P.text}}>{d.customerName}</strong> · {d.birthDate}{d.birthTime?` · ${d.birthTime}`:""}</p>
      <p style={{color:P.gold,fontSize:10,marginTop:8,letterSpacing:"0.06em"}}>{d.reportId}</p>
      <div style={{display:"flex",justifyContent:"center",gap:28,marginTop:48}}>
        {["排盘","滴天髓","盲派","大运","幸运","图腾"].map((f,i)=>(
          <span key={i} style={{fontSize:10,color:P.muted,letterSpacing:"0.15em",textTransform:"uppercase"}}>{"ⅠⅡⅢⅣⅤⅥ"[i]} {f}</span>
        ))}
      </div>
    </div>
  );
}

function Sec({num,title,en,children}:any) {
  return (
    <div style={{padding:"64px 0",borderBottom:`1px solid ${P.border}`}}>
      <div style={{marginBottom:36}}>
        <span style={{fontSize:11,color:P.gold,letterSpacing:"0.1em"}}>{num}</span>
        <h2 style={{fontSize:26,fontWeight:300,margin:"4px 0 2px"}}>{title}</h2>
        <p style={{fontSize:13,color:P.muted,margin:0}}>{en}</p>
      </div>
      {children}
    </div>
  );
}

function Pillar({label,zh,en,sub}:any){return <div style={{background:P.card,border:`1px solid ${P.border}`,padding:"28px 16px",textAlign:"center"}}><p style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.15em",color:P.muted,margin:"0 0 10px"}}>{label}</p><p style={{fontSize:30,fontWeight:300,margin:"0 0 4px"}}>{zh}</p><p style={{fontSize:13,color:P.muted,margin:0}}>{en}</p><p style={{fontSize:11,color:P.gold,margin:"4px 0 0"}}>{sub}</p></div>;}

function Section1({d,dm,dmC}:any){return <Sec num="Ⅰ" title="完整生辰八字" en="Complete Birth Chart · 早子时/晚子时细分法"><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}><Pillar label="年柱 Year" zh={d.baziDisplay.year} en={d.baziDisplay.yearEn} sub={d.shengXiao?`生肖 ${d.shengXiao.nameEn} ${d.shengXiao.name}`:""}/><Pillar label="月柱 Month" zh={d.baziDisplay.month} en={d.baziDisplay.monthEn} sub="月令提纲"/><Pillar label="日柱 Day" zh={d.baziDisplay.day} en={d.baziDisplay.dayEn} sub={`日主 ${dm.gan}(${dm.wuxing})`}/><Pillar label="时柱 Hour" zh={d.baziDisplay.hour} en={d.baziDisplay.hourEn} sub="子时细分"/></div><p style={{textAlign:"center",marginTop:14,fontSize:10,color:P.muted}}>23:00-00:00晚子时日柱用前一日 · 00:00-01:00早子时日柱用当日</p></Sec>;}

function Section2({d,ed,dmC}:any) {
  const wxData = WX.map(w=>ed.find((e:any)=>e.name===w)||{name:w,nameEn:WXE[WX.indexOf(w)],count:0,percentage:0});
  const maxVal = Math.max(...wxData.map((d:any)=>d.count),5)+1;

  const radarOpt = {
    radar: {
      center: ["50%", "55%"], radius: "65%",
      indicator: WX.map((w: any) => ({ name: w, max: maxVal })),
      axisName: { color: P.muted, fontSize: 13 },
      splitArea: { areaStyle: { color: ["#fdfbf7", "#f7f3ed", "#f1ece4", "#ebe5db", "#e5ded4"] } },
      splitLine: { lineStyle: { color: P.border } },
      axisLine: { lineStyle: { color: "#d4cbbf" } },
    },
    series: [{
      type: "radar",
      data: [{
        value: WX.map((w: any) => wxData.find((d2: any) => d2.name === w)?.count ?? 0),
        name: "Five Elements",
        areaStyle: { color: dmC, opacity: 0.12 },
        lineStyle: { color: dmC, width: 2.5 },
        itemStyle: { color: dmC },
        symbol: "circle",
        symbolSize: 8,
      }],
    }],
  };

  const barOption = {
    tooltip:{trigger:"axis"},grid:{left:40,right:20,top:20,bottom:30},
    xAxis:{type:"category",data:wxData.map((d:any)=>d.name),axisLine:{lineStyle:{color:"#d4cbbf"}},axisLabel:{color:P.muted,fontSize:12}},
    yAxis:{type:"value",splitLine:{lineStyle:{color:P.border,type:"dashed"}},axisLabel:{color:P.muted,fontSize:11}},
    series:[{type:"bar",data:wxData.map((d:any)=>({value:d.count,itemStyle:{color:WXC[WX.indexOf(d.name)]||P.gold,borderRadius:[6,6,0,0]}})),barWidth:"50%"}],
  };

  return <Sec num="Ⅱ" title="五行分析" en="Five Elements Analysis · ECharts"><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16,marginBottom:24}}><div style={{background:P.card,border:`1px solid ${P.border}`,padding:8}}><ReactECharts option={radarOpt} style={{height:380}}/><p style={{textAlign:"center",fontSize:11,color:P.muted,marginTop:4}}>Five Elements Radar · 五行雷达图</p></div><div style={{background:P.card,border:`1px solid ${P.border}`,padding:8}}><ReactECharts option={barOption} style={{height:380}}/><p style={{textAlign:"center",fontSize:11,color:P.muted,marginTop:4}}>Element Distribution · 五行分布</p></div></div>
    {/* Pentagon SVG */}
    <Pentagon wxData={wxData} dmC={dmC} />
  </Sec>;
}

function Pentagon({wxData,dmC}:any){
  const cx=220,cy=220,r=150;
  const angles=WX.map((_,i)=>(Math.PI*2*i)/5-Math.PI/2);
  const pt=(i:number,rad:number)=>({x:cx+rad*Math.cos(angles[i]),y:cy+rad*Math.sin(angles[i])});
  const vals=WX.map(w=>(wxData.find((d:any)=>d.name===w)?.count||0)/Math.max(...WX.map(w=>wxData.find((d:any)=>d.name===w)?.count||1),1));
  return <div style={{background:P.card,border:`1px solid ${P.border}`,padding:16,textAlign:"center"}}>
    <svg viewBox="0 0 440 440" width="100%" style={{maxWidth:440}}>
      {[0.4,0.65,1.0].map(s=><polygon key={s} points={WX.map((_,i)=>pt(i,r*s)).map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke={P.border} strokeWidth={s===1?1.5:0.8} strokeDasharray={s<1?"6,4":""}/>)}
      {/* Controlling cycle */}{[[0,2],[2,4],[4,1],[1,3],[3,0]].map(([a,b])=>{const pa=pt(a,r*0.45),pb=pt(b,r*0.45);return <line key={`c${a}${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={P.fire} strokeWidth={1.5} strokeDasharray="6,3" opacity={0.5}/>;})}
      {/* Generating cycle */}{[[0,1],[1,2],[2,3],[3,4],[4,0]].map(([a,b])=>{const pa=pt(a,r*0.92),pb=pt(b,r*0.92);return <line key={`g${a}${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={P.wood} strokeWidth={2.5} opacity={0.6}/>;})}
      {/* Data polygon */}<polygon points={WX.map((_,i)=>{const p=pt(i,r*0.65*vals[i]);return`${p.x},${p.y}`}).join(" ")} fill={dmC} fillOpacity={0.12} stroke={dmC} strokeWidth={2.5}/>
      {/* Nodes */}{WX.map((label,i)=>{const p=pt(i,r*0.65*vals[i]);return <g key={i}><circle cx={p.x} cy={p.y} r={20} fill={WXC[i]} opacity={0.9}/><text x={p.x} y={p.y+6} textAnchor="middle" fill="#fff" fontSize={13} fontWeight={300}>{label}</text></g>;})}
      {/* Labels */}{WX.map((label,i)=>{const p=pt(i,r*1.15);return <text key={i} x={p.x} y={p.y+5} textAnchor="middle" fill={WXC[i]} fontSize={15} fontWeight={300}>{label}</text>;})}
      {/* Legend */}<line x1={60} y1={415} x2={90} y2={415} stroke={P.wood} strokeWidth={2}/><text x={95} y={420} fill={P.muted} fontSize={10}>相生 Generating</text><line x1={200} y1={415} x2={230} y2={415} stroke={P.fire} strokeWidth={1.5} strokeDasharray="6,3"/><text x={235} y={420} fill={P.muted} fontSize={10}>相克 Controlling</text>
    </svg>
    <p style={{fontSize:11,color:P.muted,marginTop:8}}>Five Elements Cycle · 五行生克图</p>
  </div>;
}

function Section3({d,ed,an,dmC}:any){
  return <Sec num="Ⅲ" title="能量强弱与大运" en="Energy Dynamics & Life Cycles · 滴天髓+盲派">
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16,marginBottom:24}}>
      <div style={{background:P.card,border:`1px solid ${P.border}`,padding:24}}>
        <p style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.15em",color:P.muted,margin:"0 0 8px"}}>用神 · Yong Shen</p>
        <p style={{fontSize:36,color:wxColor(d.disuitianshu?.yongshen||an.dominant.name),margin:"0 0 8px",fontWeight:300}}>{d.disuitianshu?.yongshen||an.dominant.name}</p>
        <p style={{fontSize:13,lineHeight:1.8,color:P.text,margin:0}}>{d.disuitianshu?.analysis||an.dominant.desc}</p>
        <p style={{fontSize:11,color:P.muted,margin:"8px 0 0",fontStyle:"italic"}}>滴天髓云：道有体用，不可以一端论也</p>
      </div>
      <div style={{background:P.card,border:`1px solid ${P.border}`,padding:24}}>
        <p style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.15em",color:P.muted,margin:"0 0 8px"}}>盲派做功 · Blind School</p>
        <p style={{fontSize:14,lineHeight:1.9,color:P.text,margin:0}}>{d.mangpai?.flow||""}</p>
      </div>
    </div>
    {/* 大运 */}
    {d.dayun?.length>0 && <>
      <p style={{fontSize:15,fontWeight:400,color:P.gold,margin:"0 0 12px"}}>大运流年 · Ten-Year Cycles</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
        {d.dayun.slice(0,8).map((dy:any,i:number)=>{const dc=wxColor(dy.wuxing);return <div key={i} style={{padding:"14px 12px",border:`1px solid ${P.border}`,background:i===1?`${dc}0a`:P.card,textAlign:"center"}}><p style={{fontSize:9,color:P.muted,margin:"0 0 4px"}}>{dy.age}</p><p style={{fontSize:18,fontWeight:300,margin:"0 0 3px"}}>{dy.ganzhi}</p><p style={{fontSize:10,color:dc,margin:0}}>{dy.nayin}</p></div>;})}
      </div>
    </>}
    {/* 过去/现在十年 */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14,marginTop:20}}>
      <div style={{background:P.card,border:`1px solid ${P.border}`,padding:24,textAlign:"center"}}><p style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.12em",color:P.muted,margin:"0 0 10px"}}>过去十年 · Past Decade</p><p style={{fontSize:24,color:P.fire,margin:"0 0 6px",fontWeight:300}}>{d.mangpai?.pastTen||""}</p><p style={{fontSize:12,color:P.muted,margin:0}}>{d.mangpai?.pastTenEn||""}</p></div>
      <div style={{background:`${dmC}0a`,border:`2px solid ${dmC}`,padding:24,textAlign:"center"}}><p style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.12em",color:dmC,margin:"0 0 10px"}}>现在十年 · Current Decade</p><p style={{fontSize:24,color:dmC,margin:"0 0 6px",fontWeight:300}}>{d.mangpai?.currentTen||""}</p><p style={{fontSize:12,color:P.muted,margin:0}}>{d.mangpai?.currentTenEn||""}</p></div>
    </div>
  </Sec>;
}

function Section4({d,dmC}:any){
  const cp=d.colorPalette||[];
  return <Sec num="Ⅳ" title="幸运体系" en="Lucky Colors · Environments · Timing">
    {/* Colors */}
    <p style={{fontSize:14,fontWeight:400,color:P.gold,margin:"0 0 10px"}}>幸运颜色 · Lucky Colors</p>
    <div style={{display:"flex",gap:10,marginBottom:28}}>{cp.map((c:any,i:number)=><div key={i} style={{flex:1,textAlign:"center"}}><div style={{height:56,borderRadius:"50%",background:c.hex,marginBottom:8,boxShadow:`0 4px 16px ${c.hex}30`}}/><p style={{fontSize:10,color:P.text,margin:0}}>{c.name}</p></div>)}</div>
    {/* Environments */}
    <p style={{fontSize:14,fontWeight:400,color:P.gold,margin:"0 0 10px"}}>幸运环境 · Environments</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:28}}>{(d.lucky?.environments||[]).slice(0,6).map((e:string,i:number)=><div key={i} style={{background:P.card,border:`1px solid ${P.border}`,padding:"12px 14px",textAlign:"center"}}><p style={{fontSize:10,color:P.gold,margin:"0 0 2px"}}>{["Nature","Culture","Living","Social","Career","Travel"][i]}</p><p style={{fontSize:11,color:P.text,margin:0}}>{e}</p></div>)}</div>
    {/* Timing */}
    <p style={{fontSize:14,fontWeight:400,color:P.gold,margin:"0 0 10px"}}>幸运时机 · Lucky Timing</p>
    <div style={{display:"flex",gap:8}}>{(d.lucky?.timing||[]).map((t:string,i:number)=><div key={i} style={{flex:1,textAlign:"center",padding:"12px 8px",border:`2px solid ${cp[i]?.hex||P.border}`,background:P.card}}><p style={{fontSize:12,color:P.text,margin:"0 0 2px"}}>{["Spring","Summer","LateS.","Autumn","Winter"][i]}</p><p style={{fontSize:10,color:P.muted,margin:0}}>{t}</p></div>)}</div>
  </Sec>;
}

function Section5({d,dmC}:any){
  return <Sec num="Ⅴ" title="图腾与生活指引" en="Totem & Lifestyle Guidance">
    <div style={{background:P.card,border:`1px solid ${P.border}`,padding:36,textAlign:"center",marginBottom:24}}>
      <p style={{fontSize:22,color:dmC,margin:"0 0 8px",fontWeight:300}}>{d.totemDescription?.en}</p>
      <p style={{fontSize:14,color:P.muted,margin:"0 0 16px"}}>{d.totemDescription?.cn}</p>
      <div style={{display:"flex",justifyContent:"center",gap:10}}>{(d.totemDescription?.elements||[]).map((e:string,i:number)=><span key={i} style={{padding:"6px 16px",border:`1px solid ${dmC}`,color:dmC,fontSize:11,borderRadius:2}}>{e}</span>)}</div>
    </div>
    <div style={{display:"grid",gap:10,marginBottom:24}}>{d.lifestyleTips?.map((t:any,i:number)=><div key={i} style={{background:P.card,border:`1px solid ${P.border}`,padding:"16px 20px"}}><p style={{fontSize:14,color:dmC,margin:"0 0 4px"}}>{t.titleEn} · {t.title}</p><p style={{fontSize:12,lineHeight:1.8,color:P.muted,margin:0}}>{t.tipEn}</p><p style={{fontSize:12,lineHeight:1.8,color:P.text,margin:"2px 0 0"}}>{t.tip}</p></div>)}</div>
    <div style={{display:"grid",gap:10}}>{d.spaceTips?.map((s:any,i:number)=><div key={i} style={{background:P.card,border:`1px solid ${P.border}`,padding:"16px 20px",display:"flex",gap:14,alignItems:"flex-start"}}><div style={{width:22,height:22,background:s.color,borderRadius:3,flexShrink:0,marginTop:2}}/><div><p style={{fontSize:13,fontWeight:400,margin:"0 0 3px"}}>{s.areaEn} · {s.area}</p><p style={{fontSize:11,lineHeight:1.8,color:P.muted,margin:0}}>{s.adviceEn}</p><p style={{fontSize:11,lineHeight:1.8,color:P.text,margin:"2px 0 0"}}>{s.advice}</p></div></div>)}</div>
  </Sec>;
}

function Footer({d}:any){return <div style={{textAlign:"center",padding:"64px 24px",borderTop:`1px solid ${P.border}`,background:P.card}}><p style={{fontSize:18,color:P.text,margin:"0 0 4px"}}>Personal · Beautiful · Elemental</p><p style={{fontSize:10,color:P.muted,margin:0}}>FiveSelf Studio · {d.reportId}</p><p style={{fontSize:9,color:P.gold,margin:"4px 0 0"}}>滴天髓理论 · 盲派命理精髓 · For personal enrichment only</p></div>;}
