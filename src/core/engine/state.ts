import type { Actor, Attribute, Card, GameState } from "./types";
import { MAX_HAND_SIZE, MAX_PRIDE, costBudgetForTurn } from "./constants";

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createActor(deckCards: Card[], maxPride: number = MAX_PRIDE): Actor {
  return {
    pride: maxPride,
    maxPride,
    anger: 0,
    deck: shuffle(deckCards),
    hand: [],
    discard: [],
    blockNext: 0,
    negateNextAttack: false,
    costReductionNextAttack: 0,
    costRecoveryPenaltyNextTurn: 0,
    defenseDisabledNextTurn: false,
    angerGainReduction: 0,
    legendTurns: 0,
  };
}

// 難易度・対戦モードによる初期値の補正。省略時はdocs/04_balance_rules.mdの標準値。
export interface BattleOptions {
  playerPride?: number;
  cpuPride?: number;
  cpuBudgetBonus?: number;
  playerWeakness?: Attribute; // 2人対戦用: プレイヤー側キャラクターの弱点属性
  labels?: { player: string; cpu: string }; // ログ表示名（2人対戦で「プレイヤー1/2」にする）
}

export function createGameState(
  playerDeck: Card[],
  cpuDeck: Card[],
  cpuWeakness: Attribute,
  options: BattleOptions = {}
): GameState {
  return {
    turn: 0,
    player: createActor(playerDeck, options.playerPride ?? MAX_PRIDE),
    cpu: createActor(cpuDeck, options.cpuPride ?? MAX_PRIDE),
    cpuWeakness,
    playerWeakness: options.playerWeakness ?? null,
    actorLabels: options.labels,
    costBudget: 0,
    cpuBudgetBonus: options.cpuBudgetBonus ?? 0,
    winner: null,
    log: [],
    history: [],
    lastPlayerCard: null,
    lastCpuCard: null,
  };
}

/** 山札からcount枚引く（手札上限を超えては引かない）。山札が尽きたら捨て札をシャッフルして山札に戻す。 */
export function drawCards(actor: Actor, count: number, maxHand: number = MAX_HAND_SIZE): void {
  for (let i = 0; i < count; i++) {
    if (actor.hand.length >= maxHand) break;
    if (actor.deck.length === 0) {
      if (actor.discard.length === 0) break;
      actor.deck = shuffle(actor.discard);
      actor.discard = [];
    }
    const card = actor.deck.pop();
    if (!card) break;
    actor.hand.push(card);
  }
}

export function startTurn(state: GameState): void {
  state.turn += 1;
  // レジェンド覚醒は持ち主のターン開始時に1ずつ減る（発動ターン含め5ターン持続）
  if (state.player.legendTurns > 0) state.player.legendTurns -= 1;
  const base = costBudgetForTurn(state.turn);
  state.costBudget = Math.max(0, base + state.player.costRecoveryPenaltyNextTurn);
  state.player.costRecoveryPenaltyNextTurn = 0;
}

export function startCpuTurn(state: GameState): void {
  if (state.cpu.legendTurns > 0) state.cpu.legendTurns -= 1;
  const base = costBudgetForTurn(state.turn) + state.cpuBudgetBonus;
  state.costBudget = Math.max(0, base + state.cpu.costRecoveryPenaltyNextTurn);
  state.cpu.costRecoveryPenaltyNextTurn = 0;
}
