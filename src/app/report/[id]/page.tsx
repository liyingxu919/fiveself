"use client";

import { useEffect, useState, use } from "react";
import ReactECharts from "echarts-for-react";

/* ═══ DESIGN TOKENS ═══ */
const T = {
  bg: "#f5efe6", card: "#faf6f0", border: "#e5dcd1", accent: "#8b9d83",
  gold: "#b8956a", rose: "#c08070", ink: "#3c342e", mute: "#8c8076",
  w:["#7a9a7b","#c0806e","#b8956a","#8c827a","#6a8aa0"],
};
const WX=["木","火","土","金","水"],WXE=["Wood","Fire","Earth","Metal","Water"];

function useData(id:string){const[d,setD]=useState<any>(null);const[l,setL]=useState(true);useEffect(()=>{fetch(`/api/admin/report/${id}`,{signal:AbortSignal.timeout(12000)}).then(r=>r.json()).then(j=>{if(j?.report?.content){setD(typeof j.report.content==="string"?JSON.parse(j.report.content):j.report.content)}}).catch(()=>{}).finally(()=>setL(false))},[id]);return{d,l}};

export default function Report({params}:{params:Promise<{id:string}>}){const{id}=use(params);const{d,l}=useData(id);if(l)return<Wait>Loading...</Wait>;if(!d)return<Wait><p style={{fontSize:18}}>Report not found</p><a href="/order" style={{color:T.gold}}>Generate new</a></Wait>;
  const dm=d.dayMaster,ed=d.wuxingDistribution,an=d.elementAnalysis,cp=d.colorPalette||[],wxData=WX.map(w=>ed.find((e:any)=>e.name===w)||{name:w,nameEn:WXE[WX.indexOf(w)],count:0,percentage:0});return<div style={{fontFamily:"'Cormorant Garamond','Noto Serif SC',Georgia,serif",background:T.bg,color:T.ink,minHeight:"100vh"}}><style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&display=swap');@media print{@page{size:A4;margin:12mm}body{background:#fff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}.nop{display:none!important}}`}</style><PrintBtn/><Cover d={d} dm={dm} ed={ed}/><div style={{maxWidth:940,margin:"0 auto",padding:24}}><S1 d={d} dm={dm}/><S2 wxData={wxData} dm={dm} ed={ed}/><S3 d={d} wxData={wxData} dm={dm} an={an}/><S4 d={d} dm={dm} cp={cp}/><S5 d={d} dm={dm}/></div><Footer d={d}/></div>}

function Wait({children}:any){return<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:T.bg,fontFamily:"'Cormorant Garamond','Noto Serif SC',Georgia,serif",color:T.ink,textAlign:"center",padding:48}}>{children}</div>}
function PrintBtn(){return<div className="nop" style={{position:"fixed",top:20,right:20,zIndex:999}}><button onClick={()=>window.print()} style={{background:T.ink,color:"#fff",border:"none",padding:"14px 32px",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",borderRadius:2,fontFamily:"inherit"}}>Download PDF</button></div>}
function Sec({num,title,en,children,wide}:any){return<div style={{padding:"56px 0",borderBottom:`1px solid ${T.border}`}}><div style={{display:"flex",alignItems:"baseline",gap:16,marginBottom:32}}><span style={{fontSize:24,color:T.gold,fontWeight:300}}>{num}</span><div><h2 style={{fontSize:24,fontWeight:400,margin:0}}>{title}</h2><p style={{fontSize:14,color:T.mute,margin:0}}>{en}</p></div></div><div style={wide?{}:{maxWidth:760}}>{children}</div></div>}

function Cover({d,dm,ed}:any){
  const dmIdx=WX.indexOf(dm.wuxing),dmC=T.w[dmIdx]||T.gold;
  return<div style={{minHeight:"90vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"80px 24px",background:`linear-gradient(180deg,${T.card} 0%,${T.bg} 100%)`,borderBottom:`1px solid ${T.border}`}}>
    <p style={{fontSize:10,letterSpacing:"0.35em",textTransform:"uppercase",color:T.mute,margin:"0 0 40px"}}>Five Elements · Personal Blueprint</p>
    <h1 style={{fontSize:"clamp(48px,8vw,96px)",fontWeight:300,lineHeight:1.05,letterSpacing:"-0.03em",margin:"0 0 28px"}}>五行<br/>人生蓝图</h1>
    <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:48}}>{ed.map((w:any,i:number)=><div key={i} style={{width:56,height:56,borderRadius:"50%",background:T.w[i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:300,color:"#fff"}}>{w.count}</div>)}</div>
    <div style={{width:140,height:140,borderRadius:"50%",background:dmC,margin:"0 auto 36px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:60,fontWeight:300,color:"#fff",boxShadow:`0 20px 60px ${dmC}35`}}>{dm.gan}</div>
    <p style={{fontSize:28,color:dmC,margin:"0 0 6px",fontWeight:300}}>{dm.ganEn} · {dm.wuxingEn}</p>
    <p style={{fontSize:16,color:T.mute,margin:"4px 0 0"}}>Prepared for <strong style={{color:T.ink}}>{d.customerName}</strong> · {d.birthDate}</p>
    <p style={{fontSize:10,color:T.gold,marginTop:12,letterSpacing:"0.08em"}}>{d.reportId}</p>
  </div>;
}

function S1({d,dm}:any){
  return<Sec num="Ⅰ" title="完整生辰八字" en="Birth Chart · 早子时晚子时细分">
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
      {[{l:"年柱 Year",zh:d.baziDisplay.year,en:d.baziDisplay.yearEn,sub:d.shengXiao?`生肖 ${d.shengXiao.nameEn}`:""},{l:"月柱 Month",zh:d.baziDisplay.month,en:d.baziDisplay.monthEn,sub:"月令提纲"},{l:"日柱 Day",zh:d.baziDisplay.day,en:d.baziDisplay.dayEn,sub:`日主 ${dm.gan}`},{l:"时柱 Hour",zh:d.baziDisplay.hour,en:d.baziDisplay.hourEn,sub:"子时细分"}].map((p,i)=><div key={i} style={{background:T.card,border:`1px solid ${T.border}`,padding:"32px 16px",textAlign:"center"}}><p style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.2em",color:T.mute,margin:"0 0 14px"}}>{p.l}</p><p style={{fontSize:34,fontWeight:300,margin:"0 0 6px"}}>{p.zh}</p><p style={{fontSize:14,color:T.mute,margin:0}}>{p.en}</p><p style={{fontSize:12,color:T.gold,margin:"6px 0 0"}}>{p.sub}</p></div>)}
    </div>
    <p style={{textAlign:"center",marginTop:16,fontSize:11,color:T.mute}}>23:00-00:00 晚子时 → 日柱用前一日 · 00:00-01:00 早子时 → 日柱用当日</p>
  </Sec>;
}

function S2({wxData,dm,ed}:any){
  const dmC=T.w[WX.indexOf(dm.wuxing)]||T.gold,maxVal=Math.max(...wxData.map((d:any)=>d.count),5)+1;
  const ro = {
    radar: {
      center: ["50%", "55%"], radius: "65%",
      indicator: WX.map((w: string) => ({ name: w, max: maxVal })),
      axisName: { color: T.mute, fontSize: 14, fontFamily: "Georgia,serif" },
      splitArea: { areaStyle: { color: ["#fbf7f0", "#f7f1e8", "#f2ebe0", "#ede5d8", "#e8dfd0"] } },
      splitLine: { lineStyle: { color: T.border } },
      axisLine: { lineStyle: { color: "#d8cfc0" } },
    },
    series: [{
      type: "radar",
      data: [{
        value: WX.map((w: string) => wxData.find((d2: any) => d2.name === w)?.count ?? 0),
        areaStyle: { color: dmC, opacity: 0.15 },
        lineStyle: { color: dmC, width: 2.5 },
        itemStyle: { color: dmC },
        symbol: "circle",
        symbolSize: 8,
      }],
    }],
  };
  const bo = {
    tooltip: { trigger: "axis" },
    grid: { left: 48, right: 24, top: 16, bottom: 32 },
    xAxis: { type: "category", data: wxData.map((d: any) => d.name), axisLine: { lineStyle: { color: "#d8cfc0" } }, axisLabel: { color: T.mute, fontSize: 13, fontFamily: "Georgia,serif" } },
    yAxis: { type: "value", splitLine: { lineStyle: { color: T.border, type: "dashed" } }, axisLabel: { color: T.mute, fontSize: 11 } },
    series: [{ type: "bar", data: wxData.map((d: any) => ({ value: d.count, itemStyle: { color: T.w[WX.indexOf(d.name)], borderRadius: [6, 6, 0, 0] } })), barWidth: "45%" }],
  };
  return<Sec num="Ⅱ" title="五行分析" en="Five Elements · 滴天髓理论" wide>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:28}}>
      <div style={{background:T.card,border:`1px solid ${T.border}`,padding:12}}><ReactECharts option={ro} style={{height:400}}/><p style={{textAlign:"center",fontSize:12,color:T.mute,marginTop:4}}>五行雷达图 · Radar Chart</p></div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,padding:12}}><ReactECharts option={bo} style={{height:400}}/><p style={{textAlign:"center",fontSize:12,color:T.mute,marginTop:4}}>五行分布 · Bar Chart</p></div>
    </div>
    <Pentagon wxData={wxData} dmC={dmC}/>
  </Sec>;
}

function Pentagon({wxData,dmC}:any){const cx=240,cy=220,r=160,ang=WX.map((_,i)=>(Math.PI*2*i/5-Math.PI/2)),pt=(i:number,rad:number)=>({x:cx+rad*Math.cos(ang[i]),y:cy+rad*Math.sin(ang[i])}),vals=WX.map(w=>Math.max(0.15,(wxData.find((d:any)=>d.name===w)?.count||0)/(Math.max(...WX.map(w=>wxData.find((d:any)=>d.name===w)?.count||1),1))));
  return<div style={{maxWidth:480,margin:"0 auto",background:T.card,border:`1px solid ${T.border}`,padding:16,textAlign:"center"}}><svg viewBox="0 0 480 460" width="100%">{[(r*0.4),(r*0.65),r].map(s=><polygon key={s} points={WX.map((_,i)=>pt(i,s)).map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke={T.border} strokeWidth={s===r?1.5:.7} strokeDasharray={s<r?"6,3":""}/>)}{[[0,2],[2,4],[4,1],[1,3],[3,0]].map(([a,b])=>{const pa=pt(a,r*.42),pb=pt(b,r*.42);return<line key={`c${a}`} x1={pa.x}y1={pa.y}x2={pb.x}y2={pb.y}stroke={T.rose}strokeWidth={1.5}strokeDasharray="6,3"opacity={.5}/>})}{[[0,1],[1,2],[2,3],[3,4],[4,0]].map(([a,b])=>{const pa=pt(a,r*.9),pb=pt(b,r*.9);return<line key={`g${a}`} x1={pa.x}y1={pa.y}x2={pb.x}y2={pb.y}stroke={T.accent}strokeWidth={2.5}opacity={.55}/>})}<polygon points={WX.map((_,i)=>{const p=pt(i,r*.65*vals[i]);return`${p.x},${p.y}`}).join(" ")}fill={dmC}fillOpacity={.12}stroke={dmC}strokeWidth={2.5}/>{WX.map((l,i)=>{const p=pt(i,r*.65*vals[i]);return<g key={i}><circle cx={p.x}cy={p.y}r={22}fill={T.w[i]}opacity={.9}/><text x={p.x}y={p.y+7}textAnchor="middle"fill="#fff"fontSize={14}fontWeight={300}>{l}</text></g>})}{WX.map((l,i)=>{const p=pt(i,r*1.18);return<text key={i}x={p.x}y={p.y+5}textAnchor="middle"fill={T.w[i]}fontSize={16}fontWeight={300}>{l}</text>})}</svg><p style={{fontSize:12,color:T.mute,marginTop:10}}>生克图 · Generating & Controlling Cycle</p></div>;
}

function S3({d,wxData,dm,an}:any){
  const dmC=T.w[WX.indexOf(dm.wuxing)]||T.gold;
  return<Sec num="Ⅲ" title="能量与大运" en="Energy & Life Cycle · 盲派理论">
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
      <div style={{background:T.card,border:`1px solid ${T.border}`,padding:28}}>
        <p style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.2em",color:T.mute,margin:"0 0 10px"}}>用神 · Yong Shen</p>
        <p style={{fontSize:40,fontWeight:300,color:T.w[WX.indexOf(d.disuitianshu?.yongshen||an.dominant.name)]||dmC,margin:"0 0 10px"}}>{d.disuitianshu?.yongshen||an.dominant.name}</p>
        <p style={{fontSize:14,lineHeight:1.9,margin:0}}>{d.disuitianshu?.analysis||an.dominant.desc}</p>
        <p style={{fontSize:12,color:T.mute,margin:"10px 0 0",fontStyle:"italic"}}>滴天髓：道有体用，不可以一端论也</p>
      </div>
      <div style={{background:`${dmC}08`,border:`2px solid ${dmC}`,padding:28,display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <p style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.2em",color:dmC,margin:"0 0 10px"}}>盲派做功 · Blind School</p>
        <p style={{fontSize:14,lineHeight:1.9,margin:0}}>{d.mangpai?.flow||""}</p>
      </div>
    </div>
    {d.dayun?.length>0&&<><p style={{fontSize:16,fontWeight:400,color:T.gold,margin:"0 0 14px"}}>大运流年 · Ten-Year Cycles</p><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:24}}>{d.dayun.slice(0,8).map((dy:any,i:number)=>{const dc=T.w[WX.indexOf(dy.wuxing)]||T.gold;return<div key={i} style={{padding:"16px 12px",border:`1px solid ${T.border}`,background:i===1?`${dc}08`:T.card,textAlign:"center"}}><p style={{fontSize:10,color:T.mute,margin:"0 0 4px"}}>{dy.age}</p><p style={{fontSize:20,fontWeight:300,margin:"0 0 3px"}}>{dy.ganzhi}</p><p style={{fontSize:10,color:dc,margin:0}}>{dy.nayin}</p></div>})}</div></>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div style={{background:T.card,border:`1px solid ${T.border}`,padding:24,textAlign:"center"}}><p style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.15em",color:T.mute,margin:"0 0 10px"}}>过去十年 · Past</p><p style={{fontSize:26,color:T.rose,fontWeight:300,margin:"0 0 4px"}}>{d.mangpai?.pastTen||""}</p></div>
      <div style={{background:`${dmC}08`,border:`2px solid ${dmC}`,padding:24,textAlign:"center"}}><p style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.15em",color:dmC,margin:"0 0 10px"}}>现在十年 · Current</p><p style={{fontSize:26,color:dmC,fontWeight:300,margin:"0 0 4px"}}>{d.mangpai?.currentTen||""}</p></div>
    </div>
  </Sec>;
}

function S4({d,dm,cp}:any){
  const dmC=T.w[WX.indexOf(dm.wuxing)]||T.gold;
  return<Sec num="Ⅳ" title="幸运体系" en="Lucky Colors · Environments · Timing">
    <p style={{fontSize:15,fontWeight:400,color:T.gold,margin:"0 0 12px"}}>幸运颜色</p><div style={{display:"flex",gap:12,marginBottom:32}}>{cp.map((c:any,i:number)=><div key={i} style={{flex:1,textAlign:"center"}}><div style={{height:64,borderRadius:"50%",background:c.hex,marginBottom:10,boxShadow:`0 6px 20px ${c.hex}25`}}/><p style={{fontSize:11,margin:0}}>{c.name}</p></div>)}</div>
    <p style={{fontSize:15,fontWeight:400,color:T.gold,margin:"0 0 12px"}}>幸运环境</p><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:32}}>{(d.lucky?.environments||[]).slice(0,6).map((e:string,i:number)=><div key={i} style={{background:T.card,border:`1px solid ${T.border}`,padding:"14px 16px",textAlign:"center"}}><p style={{fontSize:11,color:T.gold,margin:"0 0 3px"}}>{["Nature","Culture","Living","Social","Career","Travel"][i]}</p><p style={{fontSize:12,margin:0}}>{e}</p></div>)}</div>
    <p style={{fontSize:15,fontWeight:400,color:T.gold,margin:"0 0 12px"}}>幸运时机</p><div style={{display:"flex",gap:8}}>{(d.lucky?.timing||[]).map((t:string,i:number)=><div key={i} style={{flex:1,textAlign:"center",padding:"14px 8px",border:`2px solid ${cp[i]?.hex||T.border}`,background:T.card}}><p style={{fontSize:12,margin:"0 0 3px"}}>{["Spring","Summer","LateS.","Autumn","Winter"][i]}</p><p style={{fontSize:11,color:T.mute,margin:0}}>{t}</p></div>)}</div>
  </Sec>;
}

function S5({d,dm}:any){
  const dmC=T.w[WX.indexOf(dm.wuxing)]||T.gold;
  return<Sec num="Ⅴ" title="图腾与生活" en="Totem & Lifestyle">
    <div style={{background:T.card,border:`1px solid ${T.border}`,padding:40,textAlign:"center",marginBottom:28}}><p style={{fontSize:24,color:dmC,fontWeight:300,margin:"0 0 10px"}}>{d.totemDescription?.en}</p><p style={{fontSize:15,color:T.mute,margin:"0 0 20px"}}>{d.totemDescription?.cn}</p><div style={{display:"flex",justifyContent:"center",gap:12}}>{(d.totemDescription?.elements||[]).map((e:string,i:number)=><span key={i} style={{padding:"8px 20px",border:`1px solid ${dmC}`,color:dmC,fontSize:12,borderRadius:2}}>{e}</span>)}</div></div>
    <div style={{display:"grid",gap:10}}>{d.lifestyleTips?.map((t:any,i:number)=><div key={i} style={{background:T.card,border:`1px solid ${T.border}`,padding:"18px 24px"}}><p style={{fontSize:15,color:dmC,margin:"0 0 4px"}}>{t.titleEn} · {t.title}</p><p style={{fontSize:13,lineHeight:1.9,color:T.mute,margin:0}}>{t.tipEn}</p><p style={{fontSize:13,lineHeight:1.9,color:T.ink,margin:"2px 0 0"}}>{t.tip}</p></div>)}</div>
  </Sec>;
}

function Footer({d}:any){return<div style={{textAlign:"center",padding:"72px 24px",borderTop:`1px solid ${T.border}`,background:T.card}}><p style={{fontSize:20,fontWeight:300,margin:"0 0 6px"}}>Personal · Beautiful · Elemental</p><p style={{fontSize:11,color:T.mute,margin:0}}>FiveSelf Studio · {d.reportId} · 滴天髓 & 盲派理论</p></div>;}
