export interface Difficulty {
  id: string;
  name: string;
  description: string;
  playerPride: number; // プレイヤーの誇り初期値（最大値）
  cpuPride: number; // CPUの誇り初期値（最大値）
  cpuBudgetBonus: number; // CPUのターン毎コスト予算への加算（負値で弱体化）
}

// 数値の基準はdocs/04_balance_rules.mdの「難易度」節を参照。
export const DIFFICULTIES: Difficulty[] = [
  {
    id: "easy",
    name: "下級マゾ豚",
    description: "相手の誇りが少なく、動きも鈍い。まずはここから。",
    playerPride: 40,
    cpuPride: 30,
    cpuBudgetBonus: -1,
  },
  {
    id: "normal",
    name: "中級マゾ豚",
    description: "標準バランス。対等な言い合い。",
    playerPride: 40,
    cpuPride: 40,
    cpuBudgetBonus: 0,
  },
  {
    id: "hard",
    name: "上級マゾ豚",
    description: "相手の誇りが厚く、手数も多い。",
    playerPride: 40,
    cpuPride: 50,
    cpuBudgetBonus: 1,
  },
  {
    id: "oni",
    name: "鬼マゾ豚",
    description: "こちらの誇りは薄く、相手は絶好調。",
    playerPride: 35,
    cpuPride: 60,
    cpuBudgetBonus: 1,
  },
  {
    id: "beyond-god-maso-pig",
    name: "神を超えるマゾ豚",
    description: "勝てたら奇跡。罵倒され続けたい人だけどうぞ。",
    playerPride: 30,
    cpuPride: 80,
    cpuBudgetBonus: 2,
  },
];

export const DEFAULT_DIFFICULTY_ID = "normal";

export function getDifficulty(id: string): Difficulty {
  const found = DIFFICULTIES.find((d) => d.id === id);
  if (!found) throw new Error(`unknown difficulty id: ${id}`);
  return found;
}
