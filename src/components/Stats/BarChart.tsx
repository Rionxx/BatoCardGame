import { useState, type CSSProperties } from "react";

export interface BarDatum {
  label: string;
  value: number;
}

// 単一指標を横棒で比較する最小のバーチャート。
// dataviz skillの指針に従い: (1)複数カテゴリの単一指標なので色はsequential(単色)、
// (2)バーは細め(<=24px)・値端を丸めてベースラインは直角、(3)値は棒の先端に直接ラベル、
// (4)表形式への切り替えを常設し、色だけに依存しないようにする。
export function BarChart({
  title,
  data,
  hue,
  unit = "",
  formatValue,
}: {
  title: string;
  data: BarDatum[];
  hue: string;
  unit?: string;
  formatValue?: (v: number) => string;
}) {
  const [showTable, setShowTable] = useState(false);
  const max = Math.max(1, ...data.map((d) => d.value));
  const fmt = formatValue ?? ((v: number) => `${v.toFixed(1)}${unit}`);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>{title}</h3>
        <button onClick={() => setShowTable((v) => !v)} style={{ fontSize: 12, padding: "4px 10px" }}>
          {showTable ? "グラフで見る" : "表で見る"}
        </button>
      </div>

      {data.length === 0 ? (
        <div style={{ fontSize: 13, color: "#888" }}>データがありません。</div>
      ) : showTable ? (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={thStyle}>項目</th>
              <th style={{ ...thStyle, textAlign: "right" }}>値</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <td style={tdStyle}>{d.label}</td>
                <td style={{ ...tdStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <svg width="100%" height={data.length * 28 + 8} role="img" aria-label={title}>
          {/* ベースライン（軸） */}
          <line x1="38%" y1={0} x2="38%" y2={data.length * 28} stroke="#c3c2b7" strokeWidth={1} />
          {data.map((d, i) => {
            const barMaxWidthPct = 46; // ベースラインから右端までの幅（%）。残りは先端ラベル用の余白
            const w = (d.value / max) * barMaxWidthPct;
            const y = i * 28 + 4;
            return (
              <g key={d.label}>
                <text x="36%" y={y + 10} textAnchor="end" fontSize={12} fill="#52514e">
                  {d.label}
                </text>
                <rect x="38%" y={y} width={`${w}%`} height={16} rx={4} fill={hue}>
                  <title>{`${d.label}: ${fmt(d.value)}`}</title>
                </rect>
                <text x={`${38 + w}%`} y={y + 12} dx={6} fontSize={11} fill="#0b0b0b">
                  {fmt(d.value)}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

const thStyle: CSSProperties = { textAlign: "left", borderBottom: "1px solid #ccc", padding: "4px 6px" };
const tdStyle: CSSProperties = { borderBottom: "1px solid #eee", padding: "4px 6px" };
