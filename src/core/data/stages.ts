export interface Stage {
  id: string;
  name: string;
  background: string; // CSS background（グラデーション）
  border: string; // フィールド枠線色
  panel: string; // ログパネル背景色
}

// 対戦ごとにランダムで選ばれる背景ステージ。文字が白のため、いずれも暗めのトーンで統一する。
export const STAGES: Stage[] = [
  {
    id: "meadow",
    name: "草原",
    background: "linear-gradient(180deg, #1c4a2e 0%, #0f3d2e 60%, #0a2b20 100%)",
    border: "#2e7d4f",
    panel: "#0a2b20",
  },
  {
    id: "forest",
    name: "深い森",
    background: "linear-gradient(180deg, #14331f 0%, #0d2417 60%, #081a10 100%)",
    border: "#3a6b4a",
    panel: "#081a10",
  },
  {
    id: "earth",
    name: "大地",
    background: "linear-gradient(180deg, #5a3a1e 0%, #3d2814 60%, #2b1c0e 100%)",
    border: "#8a5a2e",
    panel: "#2b1c0e",
  },
  {
    id: "volcano",
    name: "火山",
    background:
      "radial-gradient(ellipse at 50% 100%, #ff5a2e33 0%, transparent 55%), linear-gradient(180deg, #4a1010 0%, #2b0a0a 100%)",
    border: "#b3402e",
    panel: "#1f0808",
  },
  {
    id: "snowfield",
    name: "雪原",
    background: "linear-gradient(180deg, #4a6b8a 0%, #2b3f5a 60%, #22344d 100%)",
    border: "#8ab4d4",
    panel: "#22344d",
  },
  {
    id: "night",
    name: "星降る夜",
    background: "linear-gradient(180deg, #1a1a3d 0%, #12122e 60%, #0d0d24 100%)",
    border: "#5a5aa8",
    panel: "#12122b",
  },
];

export function pickRandomStage(): Stage {
  return STAGES[Math.floor(Math.random() * STAGES.length)];
}
