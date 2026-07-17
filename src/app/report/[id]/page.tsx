"use client";

import { useEffect, useState, use } from "react";

const WARM_PALETTE = {
  bg: "#FBF7F2", card: "#FFFCF9", accent: "#D4A88C",
  text: "#3D322C", muted: "#9B8E84", border: "#E8E0D5",
  gold: "#C4A882", rose: "#C2856A", sage: "#8B9D83",
  sky: "#8A9BAD", earth: "#B8A080", water: "#7B95A8",
};

const WARME: Record<number, string> = { 0: "#8B9D83", 1: "#C2856A", 2: "#B8A080", 3: "#9B8E84", 4: "#7B95A8" };
const WUXING_NAMES = ["木","火","土","金","水"];
const WUXING_EN = ["Wood","Fire","Earth","Metal","Water"];

function useReportData(id: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`/api/admin/report/${id}`, { signal: AbortSignal.timeout(12000) })
      .then(r => r.json()).then(d => {
        if (d?.report?.content) setData(typeof d.report.content === "string" ? JSON.parse(d.report.content) : d.report.content);
      }).catch(()=>{}).finally(()=>setLoading(false));
  }, [id]);
  return { data, loading };
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading } = useReportData(id);
  if (loading) return <Wait>Preparing your Blueprint...</Wait>;
  if (!data) return <Wait>Report not found<p style={{fontSize:13,marginTop:8}}><a href="/order" style={{color:WARM_PALETTE.rose}}>Generate a new one →</a></p></Wait>;
  if (loading) return <Centered>Loading...</Centered>;
  if (!data) return <Centered><h1>Report not found</h1><a href="/order">Generate new →</a></Centered>;
  const r = data, dm = r.dayMaster, ed = r.wuxingDistribution, an = r.elementAnalysis;
  const dmColor = WARME[dm?.wuxing === "木"?0:dm?.wuxing==="火"?1:dm?.wuxing==="土"?2:dm?.wuxing==="金"?3:4] || WARM_PALETTE.accent;

  return (
    <div style={{ fontFamily: "Georgia,'Noto Serif SC',serif", background: WARM_PALETTE.bg, minHeight: "100vh", color: WARM_PALETTE.text }}>
      <style>{`@media print{body{background:#fff!important;}.nop{display:none!important;}}@page{size:A4;margin:10mm;}`}</style>
      <PrintBtn />
      <Cover data={r} dmColor={dmColor} />
      <Section1 data={r} dmColor={dmColor} />
      <Section2 data={r} ed={ed} an={an} dmColor={dmColor} />
      <Section3 ed={ed} dmColor={dmColor} />
      <Section4 data={r} dmColor={dmColor} />
      <Section5 data={r} dmColor={dmColor} />
      <Section6 data={r} dmColor={dmColor} />
      <Footer data={r} />
    </div>
  );
}

function PrintBtn() {
  return <div className="nop" style={{ position:"fixed",top:20,right:20,zIndex:100 }}>
    <button onClick={()=>window.print()} style={{ background:WARM_PALETTE.accent,color:"#fff",border:"none",padding:"12px 24px",fontSize:"11px",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",borderRadius:2 }}>Download PDF</button>
  </div>;
}

function Cover({ data, dmColor }: any) {
  return (
    <div style={{ textAlign:"center",padding:"120px 20px 100px",background:`linear-gradient(180deg,${WARM_PALETTE.card} 0%,${WARM_PALETTE.bg} 100%)`,borderBottom:`1px solid ${WARM_PALETTE.border}` }}>
      <p style={{ fontSize:11,letterSpacing:"0.25em",textTransform:"uppercase",color:WARM_PALETTE.muted,margin:"0 0 28px" }}>Five Elements Blueprint</p>
      <h1 style={{ fontSize:"clamp(38px,7vw,72px)",fontWeight:300,margin:"0 0 16px",lineHeight:1.1,letterSpacing:"-0.02em" }}>五行个人蓝图</h1>
      <div style={{ width:112,height:112,borderRadius:"50%",background:dmColor,margin:"32px auto",display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,fontWeight:300,color:"#fff",boxShadow:`0 8px 32px ${dmColor}30` }}>
        {data.dayMaster.gan}
      </div>
      <p style={{ fontSize:22,color:dmColor,margin:"0 0 4px" }}>{data.dayMaster.ganEn} · {data.dayMaster.wuxingEn} · {data.dayMaster.wuxing}</p>
      <p style={{ color:WARM_PALETTE.muted,fontSize:14,margin:"12px 0 0" }}>Prepared for <strong style={{color:WARM_PALETTE.text}}>{data.customerName}</strong> · {data.birthDate}</p>
      <p style={{ color:WARM_PALETTE.gold,fontSize:10,marginTop:8,letterSpacing:"0.05em" }}>{data.reportId}</p>
    </div>
  );
}

function Section1({ data, dmColor }: any) {
  return <Sec title="完整生辰八字" en="Complete Birth Chart" num="I">
    <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
      {[
        ["年柱 Year", data.baziDisplay.year, data.baziDisplay.yearEn, data.shengXiao ? `${data.shengXiao.nameEn}${data.shengXiao.name}` : ""],
        ["月柱 Month", data.baziDisplay.month, data.baziDisplay.monthEn, "月令提纲"],
        ["日柱 Day", data.baziDisplay.day, data.baziDisplay.dayEn, `日主 ${data.dayMaster.gan}(${data.dayMaster.wuxing})`],
        ["时柱 Hour", data.baziDisplay.hour, data.baziDisplay.hourEn, "早/晚子时细分"],
      ].map(([l,zh,en,note]:any,i)=>(
        <div key={i} style={{ background:WARM_PALETTE.card,border:`1px solid ${WARM_PALETTE.border}`,padding:"24px 16px",textAlign:"center" }}>
          <p style={{ fontSize:9,textTransform:"uppercase",letterSpacing:"0.15em",color:WARM_PALETTE.muted,margin:"0 0 10px" }}>{l}</p>
          <p style={{ fontSize:24,margin:"0 0 4px",fontWeight:300 }}>{zh}</p>
          <p style={{ fontSize:12,color:WARM_PALETTE.muted,margin:0 }}>{en}</p>
          <p style={{ fontSize:10,color:dmColor,margin:"4px 0 0" }}>{note}</p>
        </div>
      ))}
    </div>
    <p style={{ textAlign:"center",marginTop:14,fontSize:10,color:WARM_PALETTE.muted }}>
      排盘采用早子时/晚子时细分法 · 子时(23:00-01:00)区分两段分别定日柱时柱
    </p>
  </Sec>;
}

function Section2({ data, ed, an, dmColor }: any) {
  return <Sec title="五行分析彩图" en="Five Elements Analysis · 滴天髓理论" num="II">
    <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:28 }}>
      {ed.map((w:any,i:number)=>(
        <div key={i} style={{ textAlign:"center" }}>
          <div style={{ width:72,height:72,borderRadius:"50%",background:WARME[i]||WARM_PALETTE.accent,margin:"0 auto 10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:300,color:"#fff" }}>{w.count}</div>
          <p style={{ fontSize:12,color:WARM_PALETTE.text,margin:"0 0 1px" }}>{w.nameEn}</p>
          <p style={{ fontSize:10,color:WARM_PALETTE.muted,margin:0 }}>{w.name} {w.percentage}%</p>
        </div>
      ))}
    </div>
    <Card>
      <div style={{ display:"flex",gap:24,flexWrap:"wrap" }}>
        <div style={{ flex:1,minWidth:240 }}>
          <h3 style={{ fontSize:15,fontWeight:400,margin:"0 0 10px",color:dmColor }}>用神 · Yong Shen</h3>
          <p style={{ fontSize:28,color:dmColor,margin:"0 0 8px",fontWeight:300 }}>{data.disuitianshu?.yongshen || an.dominant.name}</p>
          <p style={{ fontSize:12,lineHeight:1.8,color:WARM_PALETTE.text,margin:0 }}>{data.disuitianshu?.analysis || an.dominant.desc}</p>
        </div>
        <div style={{ flex:1,minWidth:240 }}>
          <h3 style={{ fontSize:15,fontWeight:400,margin:"0 0 10px",color:dmColor }}>旺衰等级</h3>
          <p style={{ fontSize:12,lineHeight:1.8,color:WARM_PALETTE.text,margin:0 }}>
            {an.dominant.nameEn}({an.dominant.name})为{data.disuitianshu?.grade||"中"}等，
            {an.secondary.nameEn}({an.secondary.name})为辅。
            {an.missing.length>0?`缺${an.missing.map((m:any)=>m.name).join("、")}。`:"五行俱全。"}
          </p>
        </div>
      </div>
      <div style={{ marginTop:16,padding:"12px 18px",background:WARM_PALETTE.bg,borderRadius:4 }}>
        <span style={{ fontSize:10,color:WARM_PALETTE.muted }}>滴天髓云：</span>
        <span style={{ fontSize:11,color:WARM_PALETTE.text,fontStyle:"italic" }}>"道有体用，不可以一端论也。旺极者从其强，弱极者从其弱。扶之抑之得其宜。"</span>
      </div>
    </Card>
  </Sec>;
}

function Section3({ ed, dmColor }: any) {
  return <Sec title="五行能量强弱" en="Energy Dynamics · 盲派理论" num="III">
    <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20 }}>
      {ed.map((w:any,i:number)=>(
        <div key={i} style={{ padding:"12px 16px",border:`1px solid ${WARM_PALETTE.border}`,background:WARM_PALETTE.card }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
            <span style={{ fontSize:13 }}>{w.nameEn} {w.name}</span>
            <span style={{ fontSize:20,color:WARME[i]||dmColor,fontWeight:300 }}>{w.count}</span>
          </div>
          <div style={{ height:8,background:WARM_PALETTE.border,borderRadius:4 }}>
            <div style={{ height:8,width:`${Math.max(3,w.barWidth)}%`,background:WARME[i]||dmColor,borderRadius:4 }} />
          </div>
          <p style={{ fontSize:9,color:WARM_PALETTE.muted,margin:"3px 0 0" }}>{w.percentage}%</p>
        </div>
      ))}
    </div>
    <p style={{ fontSize:12,lineHeight:1.9,color:WARM_PALETTE.text,margin:0 }}>
      {data?.mangpai?.flow || `五行能量${ed[0].count>=4?'强劲':'平衡'}，${WUXING_EN[ed[0].percentage>30?0:ed[0].percentage>20?1:2]}为主导。`}
    </p>
  </Sec>;
}

function Section4({ data, dmColor }: any) {
  return <Sec title="五行人生轨迹" en="Life Trajectory · 过去现在十年" num="IV">
    <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14,marginBottom:20 }}>
      <div style={{ background:WARM_PALETTE.card,border:`1px solid ${WARM_PALETTE.border}`,padding:24,textAlign:"center" }}>
        <p style={{ fontSize:9,textTransform:"uppercase",letterSpacing:"0.12em",color:WARM_PALETTE.muted,margin:"0 0 10px" }}>过去十年 · Past Decade</p>
        <p style={{ fontSize:22,color:WARM_PALETTE.rose,margin:"0 0 8px",fontWeight:300 }}>{data.mangpai?.pastTen||"探索奠基期"}</p>
        <p style={{ fontSize:11,lineHeight:1.7,color:WARM_PALETTE.muted,margin:0 }}>{data.mangpai?.pastTenEn||""}</p>
      </div>
      <div style={{ background:dmColor+"10",border:`2px solid ${dmColor}`,padding:24,textAlign:"center" }}>
        <p style={{ fontSize:9,textTransform:"uppercase",letterSpacing:"0.12em",color:dmColor,margin:"0 0 10px" }}>现在十年 · Current Decade</p>
        <p style={{ fontSize:22,color:dmColor,margin:"0 0 8px",fontWeight:300 }}>{data.mangpai?.currentTen||"发展上升期"}</p>
        <p style={{ fontSize:11,lineHeight:1.7,color:WARM_PALETTE.muted,margin:0 }}>{data.mangpai?.currentTenEn||""}</p>
      </div>
    </div>
    {data.dayun?.length>0 && (
      <div>
        <h3 style={{ fontSize:14,fontWeight:400,margin:"0 0 12px",color:dmColor }}>大运流年 · 十年周期</h3>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6 }}>
          {data.dayun.slice(0,8).map((dy:any,i:number)=>(
            <div key={i} style={{ padding:"10px 12px",border:`1px solid ${WARM_PALETTE.border}`,background:i===1?dmColor+"10":WARM_PALETTE.card,textAlign:"center" }}>
              <p style={{ fontSize:9,color:WARM_PALETTE.muted,margin:"0 0 3px" }}>{dy.age}</p>
              <p style={{ fontSize:15,fontWeight:300,margin:"0 0 2px" }}>{dy.ganzhi}</p>
              <p style={{ fontSize:9,color:WARM_PALETTE.gold,margin:0 }}>{dy.nayin}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </Sec>;
}

function Section5({ data, dmColor }: any) {
  return <Sec title="人生幸运体系" en="Your Lucky Guide · 颜色·环境·时机" num="V">
    <h3 style={{ fontSize:13,fontWeight:400,color:dmColor,margin:"0 0 10px" }}>幸运颜色</h3>
    <div style={{ display:"flex",gap:8,marginBottom:24 }}>
      {data.colorPalette.map((c:any,i:number)=>(
        <div key={i} style={{ flex:1,textAlign:"center" }}>
          <div style={{ height:56,background:c.hex,borderRadius:40,marginBottom:6,boxShadow:`0 2px 8px ${WARM_PALETTE.border}` }} />
          <p style={{ fontSize:9,color:WARM_PALETTE.text,margin:0 }}>{c.name}</p>
        </div>
      ))}
    </div>
    <h3 style={{ fontSize:13,fontWeight:400,color:dmColor,margin:"0 0 10px" }}>幸运环境</h3>
    <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:24 }}>
      {(data.lucky?.environments||["自然环境","文化空间","生活空间"]).slice(0,6).map((e:string,i:number)=>(
        <div key={i} style={{ padding:"12px 14px",border:`1px solid ${WARM_PALETTE.border}`,background:WARM_PALETTE.card,textAlign:"center" }}>
          <p style={{ fontSize:10,color:WARM_PALETTE.text,margin:0 }}>{["Nature","Culture","Living","Social","Career","Travel"][i]}</p>
          <p style={{ fontSize:9,color:WARM_PALETTE.muted,margin:"2px 0 0" }}>{e}</p>
        </div>
      ))}
    </div>
    <h3 style={{ fontSize:13,fontWeight:400,color:dmColor,margin:"0 0 10px" }}>幸运时机</h3>
    <div style={{ display:"flex",gap:8 }}>
      {(data.lucky?.timing||["春季","夏季","长夏","秋季","冬季"]).map((t:string,i:number)=>(
        <div key={i} style={{ flex:1,textAlign:"center",padding:"12px 8px",border:`2px solid ${data.colorPalette[i]?.hex||WARM_PALETTE.border}`,background:"#fff" }}>
          <p style={{ fontSize:12,color:WARM_PALETTE.text,margin:"0 0 1px" }}>{["Spring","Summer","LateSum","Autumn","Winter"][i]}</p>
          <p style={{ fontSize:10,color:WARM_PALETTE.muted,margin:0 }}>{t}</p>
        </div>
      ))}
    </div>
  </Sec>;
}

function Section6({ data, dmColor }: any) {
  return <Sec title="生活指引与空间色彩" en="Lifestyle & Space Guidance" num="VI">
    <div style={{ display:"grid",gap:8,marginBottom:24 }}>
      {data.lifestyleTips.map((t:any,i:number)=>(
        <div key={i} style={{ padding:"14px 18px",border:`1px solid ${WARM_PALETTE.border}`,background:WARM_PALETTE.card }}>
          <h3 style={{ fontSize:13,fontWeight:400,margin:"0 0 4px",color:dmColor }}>{t.titleEn} · {t.title}</h3>
          <p style={{ fontSize:11,lineHeight:1.8,color:WARM_PALETTE.muted,margin:0 }}>{t.tipEn}</p>
          <p style={{ fontSize:11,lineHeight:1.8,color:WARM_PALETTE.text,margin:"2px 0 0" }}>{t.tip}</p>
        </div>
      ))}
    </div>
    <h3 style={{ fontSize:13,fontWeight:400,color:dmColor,margin:"0 0 10px" }}>专属图腾</h3>
    <div style={{ textAlign:"center",padding:"28px 20px",background:WARM_PALETTE.card,border:`1px solid ${WARM_PALETTE.border}`,marginBottom:20 }}>
      <p style={{ fontSize:18,color:dmColor,margin:"0 0 6px",fontWeight:300 }}>{data.totemDescription.en}</p>
      <p style={{ fontSize:13,color:WARM_PALETTE.muted,margin:"0 0 12px" }}>{data.totemDescription.cn}</p>
      <div style={{ display:"flex",justifyContent:"center",gap:8 }}>
        {data.totemDescription.elements.map((e:string,i:number)=>(
          <span key={i} style={{ padding:"4px 14px",border:`1px solid ${dmColor}`,color:dmColor,fontSize:10,borderRadius:2 }}>{e}</span>
        ))}
      </div>
    </div>
    <div style={{ display:"grid",gap:8 }}>
      {data.spaceTips.map((s:any,i:number)=>(
        <div key={i} style={{ padding:"14px 18px",border:`1px solid ${WARM_PALETTE.border}`,background:WARM_PALETTE.card,display:"flex",gap:12,alignItems:"flex-start" }}>
          <div style={{ width:20,height:20,background:s.color,borderRadius:3,flexShrink:0,marginTop:2 }} />
          <div>
            <p style={{ fontSize:13,fontWeight:400,margin:"0 0 3px" }}>{s.areaEn} · {s.area}</p>
            <p style={{ fontSize:11,lineHeight:1.8,color:WARM_PALETTE.muted,margin:0 }}>{s.adviceEn}</p>
            <p style={{ fontSize:11,lineHeight:1.8,color:WARM_PALETTE.text,margin:"2px 0 0" }}>{s.advice}</p>
          </div>
        </div>
      ))}
    </div>
  </Sec>;
}

function Footer({ data }: any) {
  return <div style={{ textAlign:"center",padding:"60px 20px",borderTop:`1px solid ${WARM_PALETTE.border}`,background:WARM_PALETTE.card }}>
    <p style={{ fontSize:16,color:WARM_PALETTE.text,margin:"0 0 4px" }}>Personal. Beautiful. Elemental.</p>
    <p style={{ fontSize:10,color:WARM_PALETTE.muted,margin:0 }}>FiveSelf Studio · {data.reportId}</p>
    <p style={{ fontSize:9,color:WARM_PALETTE.gold,margin:"4px 0 0" }}>本报告基于滴天髓理论与盲派命理精髓 · For personal enrichment only</p>
  </div>;
}

function Sec({ title, en, num, children }: { title:string; en:string; num:string; children:React.ReactNode }) {
  return <div style={{ maxWidth:820,margin:"0 auto",padding:"56px 20px",borderBottom:`1px solid ${WARM_PALETTE.border}` }}>
    <div style={{ marginBottom:28 }}>
      <span style={{ fontSize:12,color:WARM_PALETTE.gold,fontWeight:300,letterSpacing:"0.05em" }}>{num}</span>
      <h2 style={{ fontSize:22,fontWeight:400,margin:"4px 0 2px" }}>{title}</h2>
      <p style={{ fontSize:12,color:WARM_PALETTE.muted,margin:0 }}>{en}</p>
    </div>
    {children}
  </div>;
}

function Card({ children }: any) {
  return <div style={{ background:WARM_PALETTE.card,border:`1px solid ${WARM_PALETTE.border}`,padding:28,borderRadius:2 }}>{children}</div>;
}

function Wait({ children }: any) {
  return <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:WARM_PALETTE.bg,fontFamily:"Georgia,'Noto Serif SC',serif",color:WARM_PALETTE.text,padding:40,textAlign:"center" }}>{children}</div>;
}
