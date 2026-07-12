import type { Card, GameState } from "../engine/types";
import { playCard } from "../engine/resolveCard";

// docs/04_balance_rules.md: CPU AIは自分の弱点属性を隠しつつ、
// 誇りが半分未満のときは防御カードを優先する簡易ロジック。
// ただし防御カードは1ターンに1枚まで（回復付き防御を連打して
// 誇りが減らない「回復ループ」で対戦が膠着するのを防ぐため）。
export function runCpuTurn(state: GameState): void {
  let guard = 0;
  let defensePlayed = false;
  while (guard < 10) {
    guard += 1;
    const pool = state.cpu.hand.filter(
      (c) => c.cost <= state.costBudget && !(defensePlayed && c.type === "defense")
    );
    if (pool.length === 0) break;

    const lowPride = state.cpu.pride <= state.cpu.maxPride / 2;
    const card = pickCard(pool, lowPride && !defensePlayed);
    if (!card) break;
    if (card.type === "defense") defensePlayed = true;

    const result = playCard(state, "cpu", card);
    if (!result.ok) break;
    if (state.winner) break;
  }
}

function pickCard(pool: Card[], preferDefense: boolean): Card | null {
  // レジェンドカードが使えるなら最優先で切る（コスト7の勝負手）
  const legend = pool.find((c) => c.effects.some((e) => e.type === "legendAwaken"));
  if (legend) return legend;
  if (preferDefense) {
    const defense = pool.find((c) => c.type === "defense");
    if (defense) return defense;
  }
  const attacks = pool.filter((c) => c.type === "attack");
  if (attacks.length > 0) {
    return attacks.reduce((best, c) =>
      totalDamage(c) > totalDamage(best) ? c : best
    );
  }
  return pool[0] ?? null;
}

function totalDamage(card: Card): number {
  return card.effects
    .filter((e) => e.type === "damage" || e.type === "damageIfWeakness")
    .reduce((sum, e) => sum + (e.value ?? 0), 0);
}
