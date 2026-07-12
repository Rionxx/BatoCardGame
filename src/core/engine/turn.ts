import type { Attribute, Card, GameState } from "./types";
import { INITIAL_HAND_SIZE } from "./constants";
import { createGameState, drawCards, startCpuTurn, startTurn, type BattleOptions } from "./state";
import { runCpuTurn } from "../ai/cpuStrategy";
import { playCard } from "./resolveCard";

export function beginBattle(
  playerDeck: Card[],
  cpuDeck: Card[],
  cpuWeakness: Attribute,
  options: BattleOptions = {}
): GameState {
  const state = createGameState(playerDeck, cpuDeck, cpuWeakness, options);
  startTurn(state);
  drawCards(state.player, INITIAL_HAND_SIZE);
  drawCards(state.cpu, INITIAL_HAND_SIZE);
  return state;
}

/** プレイヤーがターン終了を宣言した後の処理: CPU行動→勝敗判定→次ターン開始。
 *  手札は毎ターン1枚ずつ増える（初期4枚、上限はMAX_HAND_SIZE）。 */
export function endPlayerTurn(state: GameState): void {
  if (state.winner) return;

  startCpuTurn(state);
  runCpuTurn(state);
  if (state.winner) return;

  startTurn(state);
  drawCards(state.player, 1);
  drawCards(state.cpu, 1);
}

export type PlayerStrategy = (state: GameState) => Card | null;

/** テスト・バランスシミュレーション用: プレイヤー側も戦略関数で自動プレイする1戦フル進行。 */
export function runFullBattle(
  playerDeck: Card[],
  cpuDeck: Card[],
  cpuWeakness: Attribute,
  playerStrategy: PlayerStrategy,
  options: BattleOptions = {},
  maxTurns = 40
): GameState {
  const state = beginBattle(playerDeck, cpuDeck, cpuWeakness, options);

  while (!state.winner && state.turn <= maxTurns) {
    let guard = 0;
    while (guard < 10) {
      guard += 1;
      const card = playerStrategy(state);
      if (!card) break;
      const result = playCard(state, "player", card);
      if (!result.ok) break;
      if (state.winner) break;
    }
    if (state.winner) break;
    endPlayerTurn(state);
  }

  return state;
}
