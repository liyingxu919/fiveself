"use client";

import { useEffect, useState, use } from "react";

function useReport(id: string) {
  const [d, setD] = useState<any>(null);
  const [l, setL] = useState(true);
  useEffect(() => {
    fetch(`/api/admin/report/${id}`, { signal: AbortSignal.timeout(12000) })
      .then(r => r.json()).then(j => {
        if (j?.report?.content) {
          const c = typeof j.report.content === "string" ? JSON.parse(j.report.content) : j.report.content;
          setD(c);
        }
      }).catch(()=>{}).finally(()=>setL(false));
  }, [id]);
  return { d, l };
}

const COLORS: Record<string, string> = { "木": "#5B7A5C", "火": "#C2685C", "土": "#B8975A", "金": "#8B8580", "水": "#5C7B9A" };
const WX = ["木","火","土","金","水"];
const WXE = ["Wood","Fire","Earth","Metal","Water"];

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { d, l } = useReport(id);
  if (l) return <div className="flex items-center justify-center min-h-screen bg-[#faf8f4]"><p className="text-sm text-stone-400 font-serif">Loading...</p></div>;
  if (!d) return <div className="flex flex-col items-center justify-center min-h-screen bg-[#faf8f4] gap-4"><p className="text-xl text-stone-600 font-serif">Report not found</p><a href="/order" className="text-sm text-amber-700 underline">Generate new</a></div>;

  return (
    <div className="min-h-screen bg-[#faf8f4] text-stone-800 font-serif print:bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&display=swap');
        @media print { @page { size: A4; margin: 0; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .nop { display: none !important; } .page-break { page-break-before: always; } }
        .serif { font-family: 'Cormorant Garamond', 'Noto Serif SC', Georgia, serif; }
        .h1 { font-size: clamp(40px, 6vw, 80px); font-weight: 300; line-height: 1.05; letter-spacing: -0.02em; }
        .h2 { font-size: 32px; font-weight: 300; letter-spacing: -0.01em; }
        .h3 { font-size: 20px; font-weight: 400; }
        .label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #9B8E84; }
        .muted { color: #9B8E84; }
        .card { background: #fff; border: 1px solid #ebe5db; }
        .pillar { background: #fdfbf7; border: 1px solid #ebe5db; padding: 28px 16px; text-align: center; }
          .pillar .num { font-size: 32px; font-weight: 300; margin: 0 0 2px; }
          .pillar .en { font-size: 13px; color: #9B8E84; margin: 0; }
          .pillar .sub { font-size: 11px; color: #B8975A; margin: 4px 0 0; }
        .circle { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 300; color: #fff; }
        .bar-track { height: 6px; background: #ebe5db; border-radius: 3px; overflow: hidden; }
        .bar-fill { height: 6px; border-radius: 3px; }
        .btn { display: inline-block; padding: 12px 32px; border: 1px solid #B8975A; color: #B8975A; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; transition: all 0.3s; }
          .btn:hover { background: #B8975A; color: #fff; }
        .tag { display: inline-block; padding: 4px 14px; border: 1px solid; font-size: 10px; border-radius: 2px; }
      `}</style>

      <div className="nop fixed top-5 right-5 z-50">
        <button onClick={() => window.print()} className="bg-amber-700 text-white px-6 py-3 text-xs tracking-[0.15em] uppercase cursor-pointer hover:bg-amber-800 transition">Download PDF</button>
      </div>

      {/* ═══ COVER ═══ */}
      <Cover d={d} />

      {/* ═══ SECTION 1: 八字 ═══ */}
      <Section num="Ⅰ" title="完整生辰八字" en="Complete Birth Chart">
        <div className="grid grid-cols-4 gap-4">
          {[["年柱 Year", d.baziDisplay.year, d.baziDisplay.yearEn, d.shengXiao?.name||""],
            ["月柱 Month", d.baziDisplay.month, d.baziDisplay.monthEn, "月令提纲"],
            ["日柱 Day", d.baziDisplay.day, d.baziDisplay.dayEn, `日主 ${d.dayMaster.gan}(${d.dayMaster.wuxing})`],
            ["时柱 Hour", d.baziDisplay.hour, d.baziDisplay.hourEn, "子时细分"]].map(([l,zh,en,sub],i) => (
            <div key={i} className="pillar">
              <p className="label mb-2">{l}</p>
              <p className="num">{zh}</p>
              <p className="en">{en}</p>
              <p className="sub">{sub}</p>
            </div>
          ))}
        </div>
        <p className="text-xs muted text-center mt-4">早子时/晚子时细分法 · 23:00-00:00晚子时日柱用前一日 · 00:00-01:00早子时日柱用当日</p>
      </Section>

      {/* ═══ SECTION 2: 五行 + 滴天髓 ═══ */}
      <Section num="Ⅱ" title="五行分析彩图" en="Di Tian Sui · Five Elements">
        <div className="flex justify-center gap-6 mb-10">
          {d.wuxingDistribution.map((w:any,i:number) => {
            const wc = COLORS[WX[i]]||"#B8975A";
            return <div key={i} className="text-center">
              <div className="circle mx-auto mb-2" style={{background:wc}}>{w.count}</div>
              <p className="text-xs font-medium">{w.nameEn}</p>
              <p className="text-[10px] muted">{w.name} {w.percentage}%</p>
            </div>;
          })}
        </div>

        <div className="card p-8 mb-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="label mb-1">用神 · Yong Shen</p>
              <p className="text-3xl font-light mb-3" style={{color:COLORS[d.disuitianshu?.yongshen]||"#B8975A"}}>{d.disuitianshu?.yongshen||"土"}</p>
              <p className="text-sm leading-relaxed">{d.disuitianshu?.analysis||""}</p>
            </div>
            <div>
              <p className="label mb-1">旺衰等级</p>
              <p className="text-sm leading-relaxed">{d.disuitianshu?.analysisEn||""}</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-[#fdfbf7] border border-[#ebe5db] text-xs italic muted">
            "道有体用，不可以一端论也。旺极者从其强，弱极者从其弱。扶之抑之得其宜。" —— 滴天髓
          </div>
        </div>

        {d.wuxingDistribution.map((w:any,i:number) => {
          const wc = COLORS[WX[i]]||"#B8975A";
          return <div key={i} className="flex items-center gap-4 mb-3 px-2">
            <span className="text-sm w-20">{w.nameEn} {w.name}</span>
            <div className="bar-track flex-1"><div className="bar-fill" style={{width:`${Math.max(3,w.barWidth)}%`,background:wc}} /></div>
            <span className="text-sm w-8 text-right muted">{w.count}</span>
          </div>;
        })}
      </Section>

      <div className="page-break" />

      {/* ═══ SECTION 3: 能量 + 盲派 ═══ */}
      <Section num="Ⅲ" title="五行能量强弱" en="Blind School · Energy Dynamics">
        <div className="card p-8 mb-8">
          <p className="label mb-2">盲派能量做功</p>
          <p className="text-sm leading-relaxed">{d.mangpai?.flow||""}</p>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="card p-8 text-center">
            <p className="label mb-2">过去十年 · Past Decade</p>
            <p className="text-2xl font-light text-red-400 mb-2">{d.mangpai?.pastTen||""}</p>
            <p className="text-xs muted">{d.mangpai?.pastTenEn||""}</p>
          </div>
          <div className="p-8 text-center" style={{background:`${COLORS[d.dayMaster.wuxing]||"#B8975A"}08`,border:`2px solid ${COLORS[d.dayMaster.wuxing]||"#B8975A"}`}}>
            <p className="label mb-2" style={{color:COLORS[d.dayMaster.wuxing]}}>现在十年 · Current Decade</p>
            <p className="text-2xl font-light mb-2" style={{color:COLORS[d.dayMaster.wuxing]}}>{d.mangpai?.currentTen||""}</p>
            <p className="text-xs muted">{d.mangpai?.currentTenEn||""}</p>
          </div>
        </div>

        {d.dayun?.length > 0 && <>
          <p className="label mb-4">大运流年 · Ten-Year Cycles</p>
          <div className="grid grid-cols-4 gap-3">
            {d.dayun.slice(0,8).map((dy:any,i:number) => {
              const dwc = COLORS[dy.wuxing]||"#B8975A";
              return <div key={i} className={`p-4 text-center ${i===1?'bg-opacity-10':''}`} style={{background:i===1?`${dwc}10`:'#fff',border:`1px solid ${i===1?dwc:'#ebe5db'}`}}>
                <p className="text-[10px] muted mb-1">{dy.age}</p>
                <p className="text-lg font-light mb-1">{dy.ganzhi}</p>
                <p className="text-[10px]" style={{color:dwc}}>{dy.nayin}</p>
              </div>;
            })}
          </div>
        </>}
      </Section>

      {/* ═══ SECTION 4: 幸运 ═══ */}
      <Section num="Ⅳ" title="人生幸运体系" en="Lucky Colors · Environments · Timing">
        <p className="label mb-3">幸运颜色</p>
        <div className="flex gap-3 mb-8">
          {d.colorPalette?.map((c:any,i:number) => (
            <div key={i} className="flex-1 text-center">
              <div className="h-14 rounded-full mb-2" style={{background:c.hex,boxShadow:`0 4px 16px ${c.hex}30`}} />
              <p className="text-[10px]">{c.name}</p>
            </div>
          ))}
        </div>
        <p className="label mb-3">幸运环境</p>
        <div className="grid grid-cols-3 gap-2 mb-8">
          {(d.lucky?.environments||[]).slice(0,6).map((e:string,i:number) => (
            <div key={i} className="card p-3 text-center">
              <p className="text-[10px] text-amber-700 mb-0.5">{["Nature","Culture","Living","Social","Career","Travel"][i]}</p>
              <p className="text-xs">{e}</p>
            </div>
          ))}
        </div>
        <p className="label mb-3">幸运时机</p>
        <div className="flex gap-2">
          {(d.lucky?.timing||[]).map((t:string,i:number) => (
            <div key={i} className="flex-1 card p-3 text-center" style={d.colorPalette?.[i] ? {borderColor:d.colorPalette[i].hex,borderWidth:2} : {}}>
              <p className="text-xs">{["Spring","Summer","LateS.","Autumn","Winter"][i]}</p>
              <p className="text-[10px] muted">{t}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="page-break" />

      {/* ═══ SECTION 5: 图腾 + 生活 ═══ */}
      <Section num="Ⅴ" title="专属图腾" en="Personal Totem">
        <div className="card p-12 text-center mb-8">
          <p className="text-2xl font-light mb-4" style={{color:COLORS[d.dayMaster.wuxing]}}>{d.totemDescription?.en}</p>
          <p className="text-sm muted mb-6">{d.totemDescription?.cn}</p>
          <div className="flex justify-center gap-3">
            {d.totemDescription?.elements?.map((e:string,i:number) => (
              <span key={i} className="tag" style={{borderColor:COLORS[d.dayMaster.wuxing],color:COLORS[d.dayMaster.wuxing]}}>{e}</span>
            ))}
          </div>
        </div>

        <p className="label mb-4">生活指引 · Lifestyle Guidance</p>
        <div className="grid gap-3 mb-10">
          {d.lifestyleTips?.map((t:any,i:number) => (
            <div key={i} className="card p-5">
              <p className="text-sm font-medium mb-1" style={{color:COLORS[d.dayMaster.wuxing]}}>{t.titleEn} · {t.title}</p>
              <p className="text-xs leading-relaxed muted">{t.tipEn}</p>
              <p className="text-xs leading-relaxed mt-0.5">{t.tip}</p>
            </div>
          ))}
        </div>

        <p className="label mb-4">空间色彩 · Space & Color</p>
        <div className="grid gap-3">
          {d.spaceTips?.map((s:any,i:number) => (
            <div key={i} className="card p-5 flex gap-4 items-start">
              <div className="w-5 h-5 rounded-sm mt-0.5 shrink-0" style={{background:s.color}} />
              <div>
                <p className="text-sm font-medium mb-0.5">{s.areaEn} · {s.area}</p>
                <p className="text-xs leading-relaxed muted">{s.adviceEn}</p>
                <p className="text-xs leading-relaxed mt-0.5">{s.advice}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* FOOTER */}
      <div className="max-w-3xl mx-auto px-8 py-20 border-t border-[#ebe5db] text-center">
        <p className="text-xl font-light mb-1">Personal · Beautiful · Elemental</p>
        <p className="text-xs muted">FiveSelf Studio · {d.reportId}</p>
        <p className="text-[10px] text-amber-700/60 mt-1">滴天髓理论 · 盲派命理精髓 · For personal enrichment</p>
      </div>
    </div>
  );
}

function Cover({ d }: any) {
  const dm = d.dayMaster, dmC = COLORS[dm.wuxing]||"#B8975A";
  return <div className="min-h-screen flex flex-col items-center justify-center text-center px-8 bg-gradient-to-b from-[#fdfbf7] to-[#faf8f4] border-b border-[#ebe5db]">
    <p className="label mb-8">Five Elements Blueprint</p>
    <h1 className="h1 mb-6">五行个人蓝图</h1>
    <div className="w-28 h-28 rounded-full flex items-center justify-center text-5xl font-light text-white mb-8" style={{background:dmC,boxShadow:`0 16px 48px ${dmC}30`}}>
      {dm.gan}
    </div>
    <p className="text-2xl font-light mb-1" style={{color:dmC}}>{dm.ganEn} · {dm.wuxingEn} · {dm.wuxing}</p>
    <p className="text-sm muted mt-4">Prepared for <strong className="text-stone-800">{d.customerName}</strong> · {d.birthDate}</p>
    <p className="text-xs text-amber-700/60 mt-2 tracking-[0.05em]">{d.reportId}</p>
    <div className="flex gap-4 mt-12">
      {["排盘","滴天髓","盲派","大运","幸运"].map((f,i) => (
        <span key={i} className="text-[11px] text-amber-700/70 tracking-[0.12em] uppercase">{"ⅠⅡⅢⅣⅤ"[i]} {f}</span>
      ))}
    </div>
  </div>;
}

function Section({ num, title, en, children }: any) {
  return <div className="max-w-3xl mx-auto px-8 py-20 border-b border-[#ebe5db]">
    <div className="mb-10">
      <span className="text-xs text-amber-700/70 tracking-[0.1em]">{num}</span>
      <h2 className="h2 mt-1 mb-1">{title}</h2>
      <p className="text-sm muted">{en}</p>
    </div>
    {children}
  </div>;
}
