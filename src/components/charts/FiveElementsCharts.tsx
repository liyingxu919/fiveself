"use client";

import ReactECharts from "echarts-for-react";

interface ChartProps {
  wuxingData: Array<{ name: string; nameEn: string; count: number; percentage: number }>;
  dayMasterWuxing: string;
}

const WX_COLORS: Record<string, string> = {
  "木": "#5B7A5C", "火": "#C2685C", "土": "#B8975A", "金": "#8B8580", "水": "#5C7B9A",
};
const WX_ORDER = ["木", "火", "土", "金", "水"];

export function FiveElementsRadar({ wuxingData, dayMasterWuxing }: ChartProps) {
  const dmIdx = WX_ORDER.indexOf(dayMasterWuxing);
  const dmColor = WX_COLORS[dayMasterWuxing] || "#B8975A";

  const option = {
    radar: {
      center: ["50%", "55%"],
      radius: "65%",
      indicator: WX_ORDER.map(w => ({
        name: w,
        max: Math.max(...wuxingData.map(d => d.count), 5) + 1,
      })),
      axisName: { color: "#9B8E84", fontSize: 13, fontFamily: "Georgia,serif" },
      splitArea: {
        areaStyle: { color: ["#fdfbf7", "#faf8f4", "#f7f3ed", "#f3efe7", "#efe9df"] },
      },
      splitLine: { lineStyle: { color: "#ebe5db" } },
      axisLine: { lineStyle: { color: "#d4cbbf" } },
    },
    series: [{
      type: "radar",
      data: [{
        value: WX_ORDER.map(w => wuxingData.find(d => d.name === w)?.count || 0),
        name: "Five Elements",
        areaStyle: { color: dmColor, opacity: 0.12 },
        lineStyle: { color: dmColor, width: 2.5 },
        itemStyle: { color: dmColor },
        symbol: "circle",
        symbolSize: 8,
      }],
    }],
  };

  return (
    <div className="card p-2">
      <ReactECharts option={option} style={{ height: 380 }} />
      <p className="text-xs text-center text-stone-400 -mt-2">Five Elements Radar · 五行雷达图</p>
    </div>
  );
}

export function FiveElementsBar({ wuxingData }: ChartProps) {
  const sorted = [...wuxingData].sort((a, b) => b.count - a.count);

  const option = {
    tooltip: { trigger: "axis" },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: "category",
      data: sorted.map(d => d.name),
      axisLine: { lineStyle: { color: "#d4cbbf" } },
      axisLabel: { color: "#9B8E84", fontSize: 12, fontFamily: "Georgia,serif" },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#ebe5db", type: "dashed" } },
      axisLabel: { color: "#9B8E84", fontSize: 11 },
    },
    series: [{
      type: "bar",
      data: sorted.map(d => ({
        value: d.count,
        itemStyle: {
          color: WX_COLORS[d.name] || "#B8975A",
          borderRadius: [6, 6, 0, 0],
        },
      })),
      barWidth: "50%",
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.15)" },
      },
    }],
  };

  return (
    <div className="card p-2">
      <ReactECharts option={option} style={{ height: 380 }} />
      <p className="text-xs text-center text-stone-400 -mt-2">Element Distribution · 五行分布</p>
    </div>
  );
}

/** Custom SVG pentagon: Five Elements generating & controlling cycles */
export function FiveElementsPentagon({ dayMasterWuxing }: { dayMasterWuxing: string }) {
  const dmColor = WX_COLORS[dayMasterWuxing] || "#B8975A";
  const cx = 200, cy = 200, r = 140;
  const labels = WX_ORDER;
  const angles = labels.map((_, i) => (Math.PI * 2 * i) / 5 - Math.PI / 2);

  // Generating cycle: 木→火→土→金→水→木 (outer)
  const genPairs = [[0,1],[1,2],[2,3],[3,4],[4,0]];
  // Controlling cycle: 木→土→水→火→金→木 (inner, star shape)
  const ctrlPairs = [[0,2],[2,4],[4,1],[1,3],[3,0]];

  const getPoint = (i: number, radius: number) => ({
    x: cx + radius * Math.cos(angles[i]),
    y: cy + radius * Math.sin(angles[i]),
  });

  return (
    <div className="card p-2 text-center" style={{ height: 440 }}>
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        {/* Background pentagon grid */}
        {[0.4, 0.65, 1.0].map(scale => (
          <polygon key={scale}
            points={labels.map((_, i) => getPoint(i, r * scale)).map(p => `${p.x},${p.y}`).join(" ")}
            fill="none" stroke="#ebe5db" strokeWidth={scale === 1 ? 1.5 : 0.8}
            strokeDasharray={scale < 1 ? "4,4" : ""}
          />
        ))}

        {/* Controlling cycle (star) */}
        {ctrlPairs.map(([a, b]) => {
          const pa = getPoint(a, r * 0.5), pb = getPoint(b, r * 0.5);
          return <line key={`ctrl-${a}-${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#C2856A" strokeWidth={1.5} strokeDasharray="6,3" opacity={0.6} />;
        })}

        {/* Generating cycle (outer circle arrows) */}
        {genPairs.map(([a, b]) => {
          const pa = getPoint(a, r * 0.92), pb = getPoint(b, r * 0.92);
          return <line key={`gen-${a}-${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#5B7A5C" strokeWidth={2.5} opacity={0.7} />;
        })}

        {/* Axis lines from center */}
        {labels.map((_, i) => {
          const p = getPoint(i, r);
          return <line key={`axis-${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#d4cbbf" strokeWidth={0.5} />;
        })}

        {/* Data polygon (connect wuxing values) - simplified as filled polygon */}
        <polygon
          points={labels.map((_, i) => getPoint(i, r * 0.7)).map(p => `${p.x},${p.y}`).join(" ")}
          fill={dmColor} fillOpacity={0.12} stroke={dmColor} strokeWidth={2.5}
        />

        {/* Node circles */}
        {labels.map((label, i) => {
          const p = getPoint(i, r * 0.7);
          const color = WX_COLORS[label] || "#B8975A";
          return <g key={i}>
            <circle cx={p.x} cy={p.y} r={18} fill={color} opacity={0.9} />
            <text x={p.x} y={p.y + 5} textAnchor="middle" fill="#fff" fontSize={12} fontFamily="Georgia,serif">{label}</text>
          </g>;
        })}

        {/* Label text at outer edge */}
        {labels.map((label, i) => {
          const p = getPoint(i, r * 1.2);
          const color = WX_COLORS[label] || "#B8975A";
          return <text key={`lbl-${i}`} x={p.x} y={p.y + 5} textAnchor="middle" fill={color} fontSize={14} fontFamily="Georgia,serif" fontWeight={300}>{label}</text>;
        })}

        {/* Legend */}
        <line x1={20} y1={370} x2={50} y2={370} stroke="#5B7A5C" strokeWidth={2} />
        <text x={55} y={374} fill="#9B8E84" fontSize={10} fontFamily="Georgia,serif">Generating 相生</text>
        <line x1={140} y1={370} x2={170} y2={370} stroke="#C2856A" strokeWidth={1.5} strokeDasharray="6,3" />
        <text x={175} y={374} fill="#9B8E84" fontSize={10} fontFamily="Georgia,serif">Controlling 相克</text>
      </svg>
      <p className="text-xs text-center text-stone-400">Five Elements Cycle · 五行生克图</p>
    </div>
  );
}
