import type { Card } from "../engine/types";
import { CARDS, INITIAL_DECK_IDS, LEGEND_CARD, getSignatureCard } from "../data/cards";
import { CHARACTERS, getCharacter, type CharacterDef } from "../data/characters";

/** プレイヤー以外のキャラクターから、1ラン分の対戦相手をランダムに選ぶ。 */
export function pickOpponents(playerCharacterId: string, count = 3): CharacterDef[] {
  const pool = CHARACTERS.filter((c) => c.id !== playerCharacterId);
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

/** 初期デッキ = 共通カード + 必殺カード1枚 + レジェンドカード1枚。 */
export function getInitialDeck(playerCharacterId: string): Card[] {
  const base = INITIAL_DECK_IDS.map((id) => {
    const card = CARDS.find((c) => c.id === id);
    if (!card) throw new Error(`unknown card id in initial deck: ${id}`);
    return card;
  });
  const character = getCharacter(playerCharacterId);
  return [...base, getSignatureCard(character.signatureCardId), LEGEND_CARD];
}

/** CPUもプレイヤーと同じ初期デッキ構成にし、未獲得の高コストカードを一方的に使わせない。 */
export function getCpuDeck(opponentCharacterId: string): Card[] {
  return getInitialDeck(opponentCharacterId);
}

// 勝利報酬の候補。攻撃・防御・強化すべてのカードから選ばれる
// （防御・強化カードも報酬経由でデッキに追加できるようにする）。
export function pickRewardChoices(count = 3): Card[] {
  const shuffled = [...CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export interface RunState {
  round: number; // 0-indexed, opponentsのインデックス
  deck: Card[];
  opponents: CharacterDef[];
  cleared: boolean;
  defeated: boolean;
  isTournament?: boolean; // トーナメントモード（1回戦→決勝の4連戦）
}

export const RUN_LENGTH_OPTIONS = [3, 5, 7, 9] as const;
export const DEFAULT_RUN_LENGTH = 3;

export function createRun(playerCharacterId: string, runLength: number = DEFAULT_RUN_LENGTH): RunState {
  return {
    round: 0,
    deck: getInitialDeck(playerCharacterId),
    opponents: pickOpponents(playerCharacterId, runLength),
    cleared: false,
    defeated: false,
  };
}

/** ストーリーモード用: 指定した相手1人とだけ戦う単発ラン。 */
export function createStoryRun(playerCharacterId: string, opponentCharacterId: string): RunState {
  return {
    round: 0,
    deck: getInitialDeck(playerCharacterId),
    opponents: [getCharacter(opponentCharacterId)],
    cleared: false,
    defeated: false,
  };
}

export const TOURNAMENT_ROUND_LABELS = ["1回戦", "2回戦", "準決勝", "決勝"] as const;

/** トーナメントモード: 1回戦→2回戦→準決勝→決勝の4連戦。 */
export function createTournamentRun(playerCharacterId: string): RunState {
  return {
    round: 0,
    deck: getInitialDeck(playerCharacterId),
    opponents: pickOpponents(playerCharacterId, TOURNAMENT_ROUND_LABELS.length),
    cleared: false,
    defeated: false,
    isTournament: true,
  };
}

export function advanceRun(run: RunState, rewardCard: Card | null): RunState {
  const nextDeck = rewardCard ? [...run.deck, rewardCard] : run.deck;
  const nextRound = run.round + 1;
  return {
    round: nextRound,
    deck: nextDeck,
    opponents: run.opponents,
    cleared: nextRound >= run.opponents.length,
    defeated: false,
    isTournament: run.isTournament,
  };
}
