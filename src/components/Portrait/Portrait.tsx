import type { CharacterDef } from "../../core/data/characters";

// オリジナルの豚マスコットイラスト。既存作品の画像は使用せず、
// 「丸い体・立ち耳・大きな鼻・ハート型の目・ほっぺの赤み」という
// 一般的なかわいい豚の記号だけをSVGで独自に構成する。
// 色(colors)とアクセサリー(accessory)でキャラクターごとに描き分ける。
export function Portrait({ character, size = 72 }: { character: CharacterDef; size?: number }) {
  const [c1, c2] = character.colors;
  const gradientId = `portrait-grad-${character.id}`;
  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} role="img" aria-label={character.name}>
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </radialGradient>
      </defs>

      {character.glyph === "pig" ? (
        <PigBody s={s} cx={cx} cy={cy} c1={c1} c2={c2} gradientId={gradientId} eyeColors={character.eyeColors} />
      ) : (
        <circle cx={cx} cy={cy} r={s / 2 - 2} fill={`url(#${gradientId})`} stroke="#ffffff55" strokeWidth={2} />
      )}

      <AccessoryIcon accessory={character.accessory} size={s} />
    </svg>
  );
}

function PigBody({
  s,
  cx,
  cy,
  c1,
  c2,
  gradientId,
  eyeColors,
}: {
  s: number;
  cx: number;
  cy: number;
  c1: string;
  c2: string;
  gradientId: string;
  eyeColors?: [string, string];
}) {
  return (
    <g>
      {/* 耳（体の後ろに描く） */}
      <path
        d={`M ${cx - s * 0.32} ${cy - s * 0.22}
            L ${cx - s * 0.38} ${cy - s * 0.44}
            L ${cx - s * 0.14} ${cy - s * 0.34} Z`}
        fill={c2}
      />
      <path
        d={`M ${cx + s * 0.32} ${cy - s * 0.22}
            L ${cx + s * 0.38} ${cy - s * 0.44}
            L ${cx + s * 0.14} ${cy - s * 0.34} Z`}
        fill={c2}
      />
      {/* 内耳 */}
      <path
        d={`M ${cx - s * 0.29} ${cy - s * 0.25}
            L ${cx - s * 0.33} ${cy - s * 0.39}
            L ${cx - s * 0.18} ${cy - s * 0.32} Z`}
        fill={c1}
      />
      <path
        d={`M ${cx + s * 0.29} ${cy - s * 0.25}
            L ${cx + s * 0.33} ${cy - s * 0.39}
            L ${cx + s * 0.18} ${cy - s * 0.32} Z`}
        fill={c1}
      />

      {/* まんまるの体 */}
      <circle cx={cx} cy={cy + s * 0.02} r={s * 0.4} fill={`url(#${gradientId})`} stroke="#ffffff44" strokeWidth={1.5} />

      {/* 前足（ちょこんと） */}
      <ellipse cx={cx - s * 0.16} cy={cy + s * 0.38} rx={s * 0.07} ry={s * 0.045} fill={c2} />
      <ellipse cx={cx + s * 0.16} cy={cy + s * 0.38} rx={s * 0.07} ry={s * 0.045} fill={c2} />

      {/* ハート型の目（eyeColors指定でオッドアイになる） */}
      <HeartEye x={cx - s * 0.17} y={cy - s * 0.08} r={s * 0.06} color={eyeColors?.[0]} />
      <HeartEye x={cx + s * 0.17} y={cy - s * 0.08} r={s * 0.06} color={eyeColors?.[1]} />

      {/* ほっぺの赤み */}
      <ellipse cx={cx - s * 0.28} cy={cy + s * 0.08} rx={s * 0.07} ry={s * 0.045} fill="#ff7096" opacity={0.45} />
      <ellipse cx={cx + s * 0.28} cy={cy + s * 0.08} rx={s * 0.07} ry={s * 0.045} fill="#ff7096" opacity={0.45} />

      {/* 大きな鼻 */}
      <ellipse cx={cx} cy={cy + s * 0.08} rx={s * 0.15} ry={s * 0.11} fill={c1} stroke={c2} strokeWidth={1.5} />
      <ellipse cx={cx - s * 0.055} cy={cy + s * 0.08} rx={s * 0.025} ry={s * 0.04} fill={c2} />
      <ellipse cx={cx + s * 0.055} cy={cy + s * 0.08} rx={s * 0.025} ry={s * 0.04} fill={c2} />
    </g>
  );
}

function HeartEye({ x, y, r, color }: { x: number; y: number; r: number; color?: string }) {
  return (
    <path
      d={`M ${x} ${y + r}
          C ${x - r * 1.5} ${y - r * 0.4}, ${x - r * 0.6} ${y - r * 1.3}, ${x} ${y - r * 0.35}
          C ${x + r * 0.6} ${y - r * 1.3}, ${x + r * 1.5} ${y - r * 0.4}, ${x} ${y + r} Z`}
      fill={color ?? "#d6335f"}
    />
  );
}

function AccessoryIcon({ accessory, size }: { accessory: CharacterDef["accessory"]; size: number }) {
  const cx = size / 2;
  const topY = size * 0.08;

  if (accessory === "crown") {
    const w = size * 0.34;
    const x0 = cx - w / 2;
    return (
      <polygon
        points={`${x0},${topY + 10} ${x0 + w * 0.15},${topY} ${x0 + w * 0.3},${topY + 8} ${x0 + w * 0.5},${topY - 4} ${x0 + w * 0.7},${topY + 8} ${x0 + w * 0.85},${topY} ${x0 + w},${topY + 10} ${x0 + w},${topY + 16} ${x0},${topY + 16}`}
        fill="#fff59d"
        stroke="#c99a1e"
        strokeWidth={1}
      />
    );
  }

  if (accessory === "tophat") {
    const y = size * 0.06;
    const cw = size * 0.26; // ハット本体の幅
    return (
      <g>
        {/* つば */}
        <rect x={cx - size * 0.21} y={y + size * 0.13} width={size * 0.42} height={size * 0.05} rx={2} fill="#1f1f1f" />
        {/* ハット本体 */}
        <rect x={cx - cw / 2} y={y - size * 0.04} width={cw} height={size * 0.18} rx={2} fill="#1f1f1f" />
        {/* 青いリボン帯 */}
        <rect x={cx - cw / 2} y={y + size * 0.075} width={cw} height={size * 0.045} fill="#3d5fd4" />
        {/* 赤いバラ */}
        <circle cx={cx + size * 0.09} cy={y + size * 0.05} r={size * 0.05} fill="#c22a4e" />
        <circle cx={cx + size * 0.09} cy={y + size * 0.05} r={size * 0.025} fill="#ff7096" />
      </g>
    );
  }

  if (accessory === "bow") {
    const y = size * 0.14;
    const bx = cx + size * 0.22;
    return (
      <g fill="#ff5f8f" stroke="#c23360" strokeWidth={1}>
        <polygon points={`${bx - 9},${y - 6} ${bx - 1},${y} ${bx - 9},${y + 6}`} />
        <polygon points={`${bx + 9},${y - 6} ${bx + 1},${y} ${bx + 9},${y + 6}`} />
        <circle cx={bx} cy={y} r={2.5} fill="#c23360" stroke="none" />
      </g>
    );
  }

  if (accessory === "glasses") {
    const y = size * 0.42;
    return (
      <g fill="none" stroke="#1f3a5f" strokeWidth={2}>
        <circle cx={cx - size * 0.17} cy={y} r={size * 0.1} />
        <circle cx={cx + size * 0.17} cy={y} r={size * 0.1} />
        <line x1={cx - size * 0.07} y1={y} x2={cx + size * 0.07} y2={y} />
      </g>
    );
  }

  if (accessory === "brow") {
    const y = size * 0.3;
    return (
      <g stroke="#7a1f0f" strokeWidth={2.5} strokeLinecap="round">
        <line x1={cx - size * 0.24} y1={y - 3} x2={cx - size * 0.1} y2={y + 3} />
        <line x1={cx + size * 0.24} y1={y - 3} x2={cx + size * 0.1} y2={y + 3} />
      </g>
    );
  }

  return null;
}
