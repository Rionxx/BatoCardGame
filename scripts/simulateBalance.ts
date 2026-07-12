import { writeFileSync } from "node:fs";
import { CARDS, LEGEND_CARD } from "../src/core/data/cards";
import { CHARACTERS } from "../src/core/data/characters";
import { runFullBattle, type PlayerStrategy } from "../src/core/engine/turn";
import type { Card, GameState } from "../src/core/engine/types";

const GAMES = 1000;
const DECK_SIZE = 14;

function randomDeck(): Card[] {
  const attacks = CARDS.filter((c) => c.type === "attack");
  const defenses = CARDS.filter((c) => c.type === "defense");
  const buffs = CARDS.filter((c) => c.type === "buff");

  const deck: Card[] = [];
  for (let i = 0; i < DECK_SIZE; i++) {
    const roll = Math.random();
    const pool = roll < 0.6 ? attacks : roll < 0.85 ? defenses : buffs;
    deck.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  // 実ゲームと同じく、レジェンドカードを1枚だけ入れる（CPUデッキにも入っているため公平にする）
  deck.push(LEGEND_CARD);
  return deck;
}

const heuristicStrategy: PlayerStrategy = (state: GameState) => {
  const affordable = state.player.hand.filter((c) => c.cost <= state.costBudget);
  if (affordable.length === 0) return null;

  // CPU AIと同じく、レジェンドカードは使えるようになったら最優先で切る
  const legend = affordable.find((c) => c.effects.some((e) => e.type === "legendAwaken"));
  if (legend) return legend;

  const lowPride = state.player.pride <= state.player.maxPride / 2;
  if (lowPride) {
    const defense = affordable.find((c) => c.type === "defense");
    if (defense) return defense;
  }
  const attacks = affordable.filter((c) => c.type === "attack");
  if (attacks.length > 0) {
    return attacks.reduce((best, c) =>
      cardScore(c, state.cpuWeakness) > cardScore(best, state.cpuWeakness) ? c : best
    );
  }
  return affordable[0];
};

function cardScore(card: Card, weakness: string): number {
  const base = card.effects
    .filter((e) => e.type === "damage")
    .reduce((s, e) => s + (e.value ?? 0), 0);
  const bonus =
    card.attribute === weakness
      ? card.effects
          .filter((e) => e.type === "damageIfWeakness")
          .reduce((s, e) => s + (e.value ?? 0), 0)
      : 0;
  return (base + bonus) / Math.max(card.cost, 1);
}

interface CardStat {
  included: number;
  includedAndWon: number;
}

function main() {
  const cardStats = new Map<string, CardStat>();
  for (const c of [...CARDS, LEGEND_CARD]) cardStats.set(c.id, { included: 0, includedAndWon: 0 });

  let wins = 0;
  let totalTurns = 0;
  const turnCounts: number[] = [];

  for (let i = 0; i < GAMES; i++) {
    const deck = randomDeck();
    const opponent = CHARACTERS[i % CHARACTERS.length];
    // 両者を同じ生成条件のデッキにして、カード数値そのものの偏りを測る。
    // 実ゲームのCPU初期デッキ弱体化による勝率変化は、このカード単体レポートから切り離す。
    const state = runFullBattle(
      deck,
      randomDeck(),
      opponent.weakness,
      heuristicStrategy,
      { playerWeakness: opponent.weakness },
    );

    const won = state.winner === "player";
    if (won) wins++;
    totalTurns += state.turn;
    turnCounts.push(state.turn);

    const uniqueIds = new Set(deck.map((c) => c.id));
    for (const id of uniqueIds) {
      const stat = cardStats.get(id)!;
      stat.included++;
      if (won) stat.includedAndWon++;
    }
  }

  turnCounts.sort((a, b) => a - b);
  const winRate = (wins / GAMES) * 100;
  const avgTurns = totalTurns / GAMES;

  const rows = [...cardStats.entries()]
    .filter(([, s]) => s.included >= 20) // サンプル数が少なすぎるカードは除外
    .map(([id, s]) => {
      const card = [...CARDS, LEGEND_CARD].find((c) => c.id === id)!;
      return {
        id,
        name: card.name,
        type: card.type,
        adoptionRate: (s.included / GAMES) * 100,
        winRateWhenIncluded: (s.includedAndWon / s.included) * 100,
      };
    })
    .sort((a, b) => b.winRateWhenIncluded - a.winRateWhenIncluded);

  const top5 = rows.slice(0, 5);
  const bottom5 = rows.slice(-5).reverse();

  const csvLines = [
    "id,name,type,adoption_rate_pct,win_rate_when_included_pct",
    ...rows.map(
      (r) =>
        `${r.id},${r.name},${r.type},${r.adoptionRate.toFixed(1)},${r.winRateWhenIncluded.toFixed(1)}`
    ),
  ];

  const report = `# 自動バランステスト結果（シミュレーション ${GAMES}戦）

> スクリプト: scripts/simulateBalance.ts / 実行: \`npm run simulate\`
> 手法: 毎回ランダムなデッキ（${DECK_SIZE}枚、攻撃60%/防御25%/強化15%の重み）を生成し、
> docs/04_balance_rules.md 準拠の簡易ヒューリスティックAIで対称条件のデッキ同士を対戦させた。
> 「採用率」はそのカードがデッキに含まれていた試行の割合、「勝率」はそのカードを含むデッキの
> 試行に占める勝利数の割合。相関であり因果ではない点に注意（強いデッキに偶然含まれていた
> だけの弱いカードも高勝率に見える可能性がある）。

## サマリー

- 総試行数: ${GAMES}
- プレイヤー全体勝率: ${winRate.toFixed(1)}%
- 平均決着ターン数: ${avgTurns.toFixed(2)}（中央値: ${turnCounts[Math.floor(turnCounts.length / 2)]}）
- 目標決着ターン数（docs/04_balance_rules.md）: 14〜18ターン

## 勝率が高い上位5カード

${top5.map((r) => `- ${r.name}（${r.id}, ${r.type}）: 採用率${r.adoptionRate.toFixed(1)}% / 勝率${r.winRateWhenIncluded.toFixed(1)}%`).join("\n")}

## 勝率が低い下位5カード

${bottom5.map((r) => `- ${r.name}（${r.id}, ${r.type}）: 採用率${r.adoptionRate.toFixed(1)}% / 勝率${r.winRateWhenIncluded.toFixed(1)}%`).join("\n")}

## 全カードのCSVデータ

\`\`\`csv
${csvLines.join("\n")}
\`\`\`

## 修正案

${suggestFixes(top5, bottom5, avgTurns)}
`;

  writeFileSync(new URL("../docs/06_balance_report.md", import.meta.url), report);
  console.log(report);
}

function suggestFixes(
  top5: { name: string; type: string; winRateWhenIncluded: number }[],
  bottom5: { name: string; type: string; winRateWhenIncluded: number }[],
  avgTurns: number
): string {
  const lines: string[] = [];
  if (avgTurns < 14) {
    lines.push(
      `- 平均決着ターン数が${avgTurns.toFixed(1)}ターンで目標(14〜18)を下回っている。攻撃カードの基礎ダメージを引き下げるか、誇り初期値を引き上げることをdocs/04_balance_rules.mdで再検討する。`
    );
  } else if (avgTurns > 18) {
    lines.push(
      `- 平均決着ターン数が${avgTurns.toFixed(1)}ターンで目標(14〜18)を上回っている。攻撃カードの基礎ダメージを引き上げるか、防御カードの軽減量を下げることを検討する。`
    );
  } else {
    lines.push(`- 平均決着ターン数は目標レンジ(14〜18)に収まっている。`);
  }

  const extremeTop = top5.filter((r) => r.winRateWhenIncluded > 75);
  if (extremeTop.length > 0) {
    lines.push(
      `- ${extremeTop.map((r) => r.name).join("、")} は勝率が75%を超えており、他カードとの採用バランスを崩す可能性がある。コストを+1するかダメージ量を下げる調整を検討する。`
    );
  }
  const extremeBottom = bottom5.filter((r) => r.winRateWhenIncluded < 40);
  if (extremeBottom.length > 0) {
    lines.push(
      `- ${extremeBottom.map((r) => r.name).join("、")} は勝率が40%を下回っており、単独では機能していない可能性がある。効果を強化するか、他カードとのシナジーを設計するか検討する。`
    );
  }
  return lines.join("\n");
}

main();
