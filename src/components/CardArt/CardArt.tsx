import type { Attribute, Card, CardType } from "../../core/engine/types";
import { CHARACTERS } from "../../core/data/characters";
import { Portrait } from "../Portrait/Portrait";
import { useId } from "react";

// カード内容に対応したモチーフイラストをSVGで描く（完全オリジナル素材）。
// 必殺カードは持ち主キャラクターの豚ポートレートをそのまま採用する。

const ATTRIBUTE_COLORS: Record<Attribute, [string, string]> = {
  煽り: ["#ff7a45", "#c0392b"],
  正論: ["#4aa3ff", "#1f5fa8"],
  皮肉: ["#b980f0", "#6c3f9e"],
  自虐からの逆転: ["#5fd07a", "#2f8f4e"],
};

const TYPE_COLORS: Record<CardType, [string, string]> = {
  attack: ["#ff8a65", "#b71c1c"],
  defense: ["#64b5f6", "#0d47a1"],
  buff: ["#ffd54f", "#c9971b"],
};

function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function CardArt({ card, width = 120, height = 80 }: { card: Card; width?: number; height?: number }) {
  const uid = useId().replace(/:/g, "");
  const signatureOwner = CHARACTERS.find((ch) => ch.signatureCardId === card.id);
  const [c1, c2] = signatureOwner
    ? signatureOwner.colors
    : card.attribute
      ? ATTRIBUTE_COLORS[card.attribute]
      : TYPE_COLORS[card.type];
  // カード名を種にすることで、同じ属性・タイプでも色、模様、シンボル配置が固有になる。
  const seed = hashSeed(card.name);
  const gradientId = `grad-${uid}`;
  const patternId = `pattern-${uid}`;
  const accent = `hsl(${seed % 360} 78% 62%)`;
  const rng = mulberry32(seed);
  const bubbles = Array.from({ length: 3 + (seed % 4) }, (_, i) => ({
    cx: rng() * width,
    cy: rng() * height,
    r: 8 + rng() * (height / 3),
    key: i,
  }));

  return (
    <div className="card-art" style={{ position: "relative", width, height, display: "inline-block" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${card.name}のイラスト`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} />
            <stop offset={`${35 + (seed % 30)}%`} stopColor={accent} stopOpacity={0.72} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
          <pattern id={patternId} width={12 + (seed % 11)} height={12 + (seed % 11)} patternUnits="userSpaceOnUse" patternTransform={`rotate(${seed % 90})`}>
            <path d={`M 0 0 L ${6 + (seed % 8)} ${6 + (seed % 8)}`} stroke="#ffffff" strokeWidth="1" opacity="0.13" />
            <circle cx={2 + (seed % 5)} cy={8 + (seed % 4)} r={1 + (seed % 2)} fill="#ffffff" opacity="0.12" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill={`url(#${gradientId})`} rx={6} />
        <rect width={width} height={height} fill={`url(#${patternId})`} rx={6} />
        {bubbles.map((b) => (
          <circle key={b.key} cx={b.cx} cy={b.cy} r={b.r} fill="#ffffff" opacity={0.1} />
        ))}
        {!signatureOwner && <Motif cardId={card.id} seed={seed} w={width} h={height} dark={c2} />}
      </svg>
      {signatureOwner && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Portrait character={signatureOwner} size={Math.min(width, height) * 0.85} />
        </div>
      )}
    </div>
  );
}

// カードIDごとの内容モチーフ。白のアイコン調で統一する。
function Motif({ cardId, seed, w, h, dark }: { cardId: string; seed: number; w: number; h: number; dark: string }) {
  const cx = w / 2;
  const cy = h / 2;
  const s = Math.min(w, h) * 0.32; // 基本スケール
  const white = { fill: "#ffffff", opacity: 0.92 } as const;
  const stroke = { fill: "none", stroke: "#ffffff", strokeWidth: s * 0.14, opacity: 0.92, strokeLinecap: "round" as const };

  switch (cardId) {
    case "A01": // 挑発の流し目 → 横目
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={s * 1.5} ry={s * 0.8} {...white} />
          <circle cx={cx + s * 0.6} cy={cy} r={s * 0.42} fill={dark} />
          <circle cx={cx + s * 0.72} cy={cy - s * 0.14} r={s * 0.12} fill="#fff" />
        </g>
      );
    case "A02": // 煽りの二段活用 → 二連の炎
      return (
        <g {...white}>
          <Flame cx={cx - s * 0.7} cy={cy + s * 0.1} s={s * 0.75} />
          <Flame cx={cx + s * 0.55} cy={cy - s * 0.1} s={s * 1.05} />
        </g>
      );
    case "A03": // 正論パンチ → 拳と衝撃線
      return (
        <g>
          <rect x={cx - s * 0.7} y={cy - s * 0.55} width={s * 1.4} height={s * 1.1} rx={s * 0.3} {...white} />
          <line x1={cx + s * 0.95} y1={cy - s * 0.7} x2={cx + s * 1.45} y2={cy - s * 1.05} {...stroke} />
          <line x1={cx + s * 1.05} y1={cy} x2={cx + s * 1.6} y2={cy} {...stroke} />
          <line x1={cx + s * 0.95} y1={cy + s * 0.7} x2={cx + s * 1.45} y2={cy + s * 1.05} {...stroke} />
        </g>
      );
    case "A04": // 議事録の突きつけ → 書類
      return (
        <g>
          <rect x={cx - s * 0.75} y={cy - s} width={s * 1.5} height={s * 2} rx={s * 0.12} {...white} />
          {[-0.5, -0.1, 0.3, 0.7].map((t, i) => (
            <line key={i} x1={cx - s * 0.45} y1={cy + s * t} x2={cx + s * 0.45} y2={cy + s * t} stroke={dark} strokeWidth={s * 0.12} strokeLinecap="round" />
          ))}
        </g>
      );
    case "A05": // 遠回しな嫌味 → 渦巻き
      return (
        <path
          d={`M ${cx} ${cy}
              m ${s * 0.2} 0
              a ${s * 0.2} ${s * 0.2} 0 1 1 ${-s * 0.4} 0
              a ${s * 0.45} ${s * 0.45} 0 1 1 ${s * 0.9} 0
              a ${s * 0.75} ${s * 0.75} 0 1 1 ${-s * 1.5} 0
              a ${s * 1.05} ${s * 1.05} 0 1 1 ${s * 2.1} 0`}
          {...stroke}
        />
      );
    case "A06": // 褒め殺しの刃 → キラリと光る短剣
      return (
        <g>
          <polygon points={`${cx - s * 0.15},${cy - s} ${cx + s * 0.15},${cy - s} ${cx},${cy + s * 0.7}`} {...white} />
          <rect x={cx - s * 0.45} y={cy - s * 1.3} width={s * 0.9} height={s * 0.22} rx={s * 0.1} {...white} />
          <Sparkle cx={cx + s * 0.8} cy={cy - s * 0.6} s={s * 0.35} />
        </g>
      );
    case "A07": // 自虐からのカウンター → ハート＋反撃矢印
      return (
        <g>
          <Heart cx={cx - s * 0.3} cy={cy} s={s * 0.75} />
          <path d={`M ${cx + s * 0.2} ${cy + s * 0.7} Q ${cx + s * 1.1} ${cy + s * 0.5} ${cx + s * 1.0} ${cy - s * 0.5}`} {...stroke} />
          <polygon points={`${cx + s * 1.0},${cy - s * 0.85} ${cx + s * 0.75},${cy - s * 0.35} ${cx + s * 1.3},${cy - s * 0.4}`} {...white} />
        </g>
      );
    case "A08": // 谷底からの這い上がり → 谷と上向き矢印
      return (
        <g>
          <path d={`M ${cx - s * 1.4} ${cy - s * 0.6} L ${cx - s * 0.4} ${cy + s * 0.8} L ${cx + s * 0.3} ${cy - s * 0.1} L ${cx + s * 1.2} ${cy + s * 0.8}`} {...stroke} />
          <line x1={cx - s * 0.4} y1={cy + s * 0.6} x2={cx - s * 0.4} y2={cy - s * 0.8} {...stroke} />
          <polygon points={`${cx - s * 0.4},${cy - s * 1.1} ${cx - s * 0.7},${cy - s * 0.55} ${cx - s * 0.1},${cy - s * 0.55}`} {...white} />
        </g>
      );
    case "A09": // 積年の恨み節 → 雷雲
      return (
        <g>
          <circle cx={cx - s * 0.55} cy={cy - s * 0.25} r={s * 0.5} {...white} />
          <circle cx={cx} cy={cy - s * 0.5} r={s * 0.62} {...white} />
          <circle cx={cx + s * 0.6} cy={cy - s * 0.2} r={s * 0.48} {...white} />
          <rect x={cx - s * 0.9} y={cy - s * 0.35} width={s * 1.9} height={s * 0.55} {...white} />
          <polygon points={`${cx},${cy + s * 0.25} ${cx - s * 0.35},${cy + s * 0.85} ${cx - s * 0.05},${cy + s * 0.85} ${cx - s * 0.3},${cy + s * 1.4} ${cx + s * 0.35},${cy + s * 0.7} ${cx + s * 0.05},${cy + s * 0.7} ${cx + s * 0.3},${cy + s * 0.25}`} {...white} />
        </g>
      );
    case "A10": // 完全論破 → ガベル（木槌）
      return (
        <g {...white}>
          <rect x={cx - s * 0.9} y={cy - s * 0.85} width={s * 1.1} height={s * 0.7} rx={s * 0.12} transform={`rotate(-35 ${cx} ${cy})`} />
          <rect x={cx - s * 0.12} y={cy - s * 0.2} width={s * 0.24} height={s * 1.3} rx={s * 0.1} transform={`rotate(-35 ${cx} ${cy})`} />
          <rect x={cx - s * 1.2} y={cy + s * 0.85} width={s * 2.4} height={s * 0.22} rx={s * 0.1} />
        </g>
      );
    case "A11": // 笑顔の刃 → 笑顔の仮面
      return (
        <g>
          <circle cx={cx} cy={cy} r={s * 0.95} {...white} />
          <circle cx={cx - s * 0.35} cy={cy - s * 0.2} r={s * 0.13} fill={dark} />
          <circle cx={cx + s * 0.35} cy={cy - s * 0.2} r={s * 0.13} fill={dark} />
          <path d={`M ${cx - s * 0.45} ${cy + s * 0.25} Q ${cx} ${cy + s * 0.75} ${cx + s * 0.45} ${cy + s * 0.25}`} fill="none" stroke={dark} strokeWidth={s * 0.12} strokeLinecap="round" />
        </g>
      );
    case "A12": // 覚悟の逆襲 → 立ち上る炎
      return (
        <g {...white}>
          <Flame cx={cx} cy={cy} s={s * 1.3} />
        </g>
      );
    case "A13": // 格の違いを見せつける一言 → 王冠
      return (
        <polygon
          points={`${cx - s * 1.1},${cy + s * 0.6} ${cx - s * 1.1},${cy - s * 0.4} ${cx - s * 0.55},${cy + s * 0.05} ${cx},${cy - s * 0.8} ${cx + s * 0.55},${cy + s * 0.05} ${cx + s * 1.1},${cy - s * 0.4} ${cx + s * 1.1},${cy + s * 0.6}`}
          {...white}
        />
      );
    case "A14": // 完膚なきまでの正論 → 天秤
      return (
        <g>
          <line x1={cx} y1={cy - s * 0.9} x2={cx} y2={cy + s * 0.9} {...stroke} />
          <line x1={cx - s * 1.0} y1={cy - s * 0.55} x2={cx + s * 1.0} y2={cy - s * 0.55} {...stroke} />
          <path d={`M ${cx - s * 1.35} ${cy + s * 0.1} a ${s * 0.35} ${s * 0.35} 0 0 0 ${s * 0.7} 0`} {...stroke} />
          <path d={`M ${cx + s * 0.65} ${cy + s * 0.1} a ${s * 0.35} ${s * 0.35} 0 0 0 ${s * 0.7} 0`} {...stroke} />
          <rect x={cx - s * 0.5} y={cy + s * 0.9} width={s} height={s * 0.18} rx={s * 0.09} {...white} />
        </g>
      );
    case "A15": // 起死回生の啖呵 → 爆発バースト
      return <Burst cx={cx} cy={cy} s={s * 1.25} />;
    case "D01": // 軽くいなす → 手のひら
      return (
        <g {...white}>
          <rect x={cx - s * 0.55} y={cy - s * 0.3} width={s * 1.1} height={s * 1.1} rx={s * 0.3} />
          {[-0.38, -0.13, 0.12, 0.37].map((t, i) => (
            <rect key={i} x={cx + s * t} y={cy - s * 1.0} width={s * 0.2} height={s * 0.85} rx={s * 0.1} />
          ))}
        </g>
      );
    case "D02": // 話をすり替える → 入れ替え矢印
      return (
        <g>
          <path d={`M ${cx - s * 1.0} ${cy - s * 0.35} H ${cx + s * 0.7}`} {...stroke} />
          <polygon points={`${cx + s * 1.05},${cy - s * 0.35} ${cx + s * 0.55},${cy - s * 0.65} ${cx + s * 0.55},${cy - s * 0.05}`} {...white} />
          <path d={`M ${cx + s * 1.0} ${cy + s * 0.35} H ${cx - s * 0.7}`} {...stroke} />
          <polygon points={`${cx - s * 1.05},${cy + s * 0.35} ${cx - s * 0.55},${cy + s * 0.05} ${cx - s * 0.55},${cy + s * 0.65}`} {...white} />
        </g>
      );
    case "D03": // 無言の圧 → 「…」の吹き出し
      return (
        <g>
          <rect x={cx - s * 1.1} y={cy - s * 0.75} width={s * 2.2} height={s * 1.3} rx={s * 0.4} {...white} />
          <polygon points={`${cx - s * 0.4},${cy + s * 0.5} ${cx - s * 0.1},${cy + s * 1.05} ${cx + s * 0.15},${cy + s * 0.5}`} {...white} />
          {[-0.45, 0, 0.45].map((t, i) => (
            <circle key={i} cx={cx + s * t} cy={cy - s * 0.1} r={s * 0.13} fill={dark} />
          ))}
        </g>
      );
    case "D04": // 鉄壁の受け流し → 盾
      return (
        <path
          d={`M ${cx} ${cy - s * 1.05} L ${cx + s * 0.9} ${cy - s * 0.6} L ${cx + s * 0.9} ${cy + s * 0.15}
              Q ${cx} ${cy + s * 1.15} ${cx - s * 0.9} ${cy + s * 0.15} L ${cx - s * 0.9} ${cy - s * 0.6} Z`}
          {...white}
        />
      );
    case "B01": // 深呼吸で冷静に → 葉っぱ
      return (
        <g>
          <path d={`M ${cx - s * 0.9} ${cy + s * 0.8} Q ${cx - s * 1.0} ${cy - s * 0.9} ${cx + s * 0.9} ${cy - s * 0.9} Q ${cx + s * 0.9} ${cy + s * 0.9} ${cx - s * 0.9} ${cy + s * 0.8} Z`} {...white} />
          <path d={`M ${cx - s * 0.75} ${cy + s * 0.65} Q ${cx} ${cy} ${cx + s * 0.7} ${cy - s * 0.7}`} fill="none" stroke={dark} strokeWidth={s * 0.1} strokeLinecap="round" />
        </g>
      );
    case "B02": // 場の空気を読む → 虫めがね
      return (
        <g>
          <circle cx={cx - s * 0.25} cy={cy - s * 0.25} r={s * 0.75} {...stroke} />
          <line x1={cx + s * 0.3} y1={cy + s * 0.3} x2={cx + s * 1.0} y2={cy + s * 1.0} {...stroke} />
        </g>
      );
    case "B03": // 怒りを飲み込む → 円に収めた炎
      return (
        <g>
          <circle cx={cx} cy={cy} r={s * 1.05} {...stroke} />
          <g {...white}>
            <Flame cx={cx} cy={cy + s * 0.1} s={s * 0.8} />
          </g>
        </g>
      );
    case "B04": // 怒りの解放 → 炎＋放射線
      return (
        <g>
          <g {...white}>
            <Flame cx={cx} cy={cy + s * 0.1} s={s * 1.0} />
          </g>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1={cx + Math.cos((deg * Math.PI) / 180) * s * 1.1}
              y1={cy + Math.sin((deg * Math.PI) / 180) * s * 1.1}
              x2={cx + Math.cos((deg * Math.PI) / 180) * s * 1.45}
              y2={cy + Math.sin((deg * Math.PI) / 180) * s * 1.45}
              {...stroke}
            />
          ))}
        </g>
      );
    case "F01": // 積年の怒りの一言 → バースト
      return <Burst cx={cx} cy={cy} s={s * 1.25} />;
    case "L01": // レジェンド覚醒 → 大きな稲妻＋放射光
      return (
        <g>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1={cx + Math.cos((deg * Math.PI) / 180) * s * 1.2}
              y1={cy + Math.sin((deg * Math.PI) / 180) * s * 1.2}
              x2={cx + Math.cos((deg * Math.PI) / 180) * s * 1.55}
              y2={cy + Math.sin((deg * Math.PI) / 180) * s * 1.55}
              stroke="#ffffff"
              strokeWidth={s * 0.12}
              strokeLinecap="round"
              opacity={0.85}
            />
          ))}
          <polygon
            points={`${cx + s * 0.35},${cy - s * 1.15} ${cx - s * 0.45},${cy + s * 0.15} ${cx - s * 0.05},${cy + s * 0.15} ${cx - s * 0.35},${cy + s * 1.15} ${cx + s * 0.55},${cy - s * 0.2} ${cx + s * 0.1},${cy - s * 0.2}`}
            fill="#ffe45a"
            stroke="#ffffff"
            strokeWidth={s * 0.06}
          />
        </g>
      );
    default:
      return <ProceduralMotif seed={seed} cx={cx} cy={cy} s={s} dark={dark} />;
  }
}

/** 追加カード向けの固有シンボル。形・頂点数・角度・補助記号をカード名から決める。 */
function ProceduralMotif({ seed, cx, cy, s, dark }: { seed: number; cx: number; cy: number; s: number; dark: string }) {
  const variant = seed % 8;
  const rotation = seed % 360;
  const count = 3 + (seed % 6);
  const stroke = { fill: "none", stroke: "#ffffff", strokeWidth: s * 0.13, opacity: 0.94, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const white = { fill: "#ffffff", opacity: 0.92 } as const;

  if (variant === 0) {
    const points = Array.from({ length: count * 2 }, (_, index) => {
      const radius = index % 2 === 0 ? s * 1.25 : s * (0.42 + (seed % 20) / 100);
      const angle = (index * Math.PI) / count - Math.PI / 2;
      return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
    });
    return <polygon points={points.join(" ")} transform={`rotate(${rotation} ${cx} ${cy})`} {...white} />;
  }
  if (variant === 1) {
    return <g transform={`rotate(${rotation} ${cx} ${cy})`}>
      {Array.from({ length: count }, (_, index) => <circle key={index} cx={cx} cy={cy} r={s * (0.3 + index * 0.16)} {...stroke} opacity={0.35 + index / (count * 1.7)} />)}
      <circle cx={cx + s * 0.9} cy={cy} r={s * 0.23} {...white} />
    </g>;
  }
  if (variant === 2) {
    return <g transform={`rotate(${rotation} ${cx} ${cy})`}>
      {Array.from({ length: Math.min(count, 5) }, (_, index) => {
        const size = s * (1.05 - index * 0.15);
        return <rect key={index} x={cx - size / 2} y={cy - size / 2 + index * s * 0.12} width={size} height={size} transform={`rotate(45 ${cx} ${cy})`} {...stroke} />;
      })}
    </g>;
  }
  if (variant === 3) {
    return <g>
      {Array.from({ length: 7 }, (_, index) => {
        const x = cx + (index - 3) * s * 0.34;
        const height = s * (0.45 + ((seed >> index) % 6) * 0.18);
        return <line key={index} x1={x} y1={cy - height / 2} x2={x} y2={cy + height / 2} {...stroke} />;
      })}
    </g>;
  }
  if (variant === 4) {
    return <g transform={`rotate(${rotation % 25 - 12} ${cx} ${cy})`}>
      <rect x={cx - s * 1.2} y={cy - s * 0.72} width={s * 2.4} height={s * 1.25} rx={s * 0.38} {...white} />
      <polygon points={`${cx - s * 0.45},${cy + s * 0.45} ${cx - s * 0.1},${cy + s} ${cx + s * 0.12},${cy + s * 0.45}`} {...white} />
      {Array.from({ length: 2 + (seed % 4) }, (_, index) => <circle key={index} cx={cx + (index - 1.5) * s * 0.38} cy={cy - s * 0.1} r={s * 0.1} fill={dark} />)}
    </g>;
  }
  if (variant === 5) {
    return <g transform={`rotate(${rotation} ${cx} ${cy})`}>
      {Array.from({ length: 3 }, (_, index) => <path key={index} d={`M ${cx - s * 1.15} ${cy + (index - 1) * s * 0.55} H ${cx + s * 0.65}`} {...stroke} />)}
      <polygon points={`${cx + s * 1.2},${cy} ${cx + s * 0.5},${cy - s * 0.48} ${cx + s * 0.5},${cy + s * 0.48}`} {...white} />
    </g>;
  }
  if (variant === 6) {
    const sides = 5 + (seed % 4);
    const points = Array.from({ length: sides }, (_, index) => {
      const angle = (index * Math.PI * 2) / sides - Math.PI / 2;
      return `${cx + Math.cos(angle) * s},${cy + Math.sin(angle) * s}`;
    });
    return <g transform={`rotate(${rotation} ${cx} ${cy})`}>
      <polygon points={points.join(" ")} {...stroke} />
      <text x={cx} y={cy + s * 0.28} textAnchor="middle" fill="#fff" fontSize={s * 0.9} fontWeight="bold">{String.fromCharCode(65 + (seed % 26))}</text>
    </g>;
  }
  return <g transform={`rotate(${rotation % 18 - 9} ${cx} ${cy})`}>
    <path d={`M ${cx - s * 1.1} ${cy - s * 0.85} Q ${cx - s * 0.25} ${cy - s * 1.05} ${cx} ${cy - s * 0.5} Q ${cx + s * 0.25} ${cy - s * 1.05} ${cx + s * 1.1} ${cy - s * 0.85} V ${cy + s * 0.85} Q ${cx + s * 0.25} ${cy + s * 0.65} ${cx} ${cy + s * 1.0} Q ${cx - s * 0.25} ${cy + s * 0.65} ${cx - s * 1.1} ${cy + s * 0.85} Z`} {...white} />
    <line x1={cx} y1={cy - s * 0.48} x2={cx} y2={cy + s * 0.75} stroke={dark} strokeWidth={s * 0.1} />
    <circle cx={cx + s * (0.35 + (seed % 4) * 0.13)} cy={cy - s * 0.15} r={s * 0.12} fill={dark} />
  </g>;
}

function Flame({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  return (
    <path
      d={`M ${cx} ${cy - s}
          C ${cx + s * 0.65} ${cy - s * 0.2}, ${cx + s * 0.35} ${cy + s * 0.15}, ${cx + s * 0.5} ${cy + s * 0.75}
          C ${cx + s * 0.5} ${cy + s * 1.1}, ${cx - s * 0.5} ${cy + s * 1.1}, ${cx - s * 0.5} ${cy + s * 0.75}
          C ${cx - s * 0.6} ${cy + s * 0.25}, ${cx - s * 0.15} ${cy + s * 0.05}, ${cx} ${cy - s} Z`}
    />
  );
}

function Heart({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  return (
    <path
      d={`M ${cx} ${cy + s}
          C ${cx - s * 1.5} ${cy - s * 0.4}, ${cx - s * 0.6} ${cy - s * 1.3}, ${cx} ${cy - s * 0.35}
          C ${cx + s * 0.6} ${cy - s * 1.3}, ${cx + s * 1.5} ${cy - s * 0.4}, ${cx} ${cy + s} Z`}
      fill="#ffffff"
      opacity={0.92}
    />
  );
}

function Sparkle({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  return (
    <path
      d={`M ${cx} ${cy - s} L ${cx + s * 0.25} ${cy - s * 0.25} L ${cx + s} ${cy} L ${cx + s * 0.25} ${cy + s * 0.25}
          L ${cx} ${cy + s} L ${cx - s * 0.25} ${cy + s * 0.25} L ${cx - s} ${cy} L ${cx - s * 0.25} ${cy - s * 0.25} Z`}
      fill="#ffffff"
      opacity={0.92}
    />
  );
}

function Burst({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  const points: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? s : s * 0.5;
    const a = (i * Math.PI) / 8;
    points.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
  }
  return <polygon points={points.join(" ")} fill="#ffffff" opacity={0.92} />;
}
