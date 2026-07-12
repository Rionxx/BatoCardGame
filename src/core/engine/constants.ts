// docs/04_balance_rules.md の基準値。数値を変える場合はこのファイルと
// docs/04_balance_rules.md の両方を更新すること。
export const MAX_PRIDE = 40;
export const INITIAL_HAND_SIZE = 4; // 対戦開始時の手札枚数
export const MAX_HAND_SIZE = 10; // 手札の上限（毎ターン1枚ドローで溜まっていく）
export const ANGER_FINISHER_THRESHOLD = 10;
export const MAX_COST_BUDGET = 10;

// ターンが進むごとにコスト予算が1ずつ増え、10ターン目以降は上限10で固定される。
// レジェンドカード（コスト7）等の大技を後半に解禁するための成長カーブ。
export function costBudgetForTurn(turn: number): number {
  return Math.min(turn, MAX_COST_BUDGET);
}
