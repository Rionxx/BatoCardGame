import type { Card, GameState } from "./types";
import { applyDamage, applyEffect, sumDamage } from "./effects";

export interface PlayResult {
  ok: boolean;
  reason?: string;
}

export function playCard(
  state: GameState,
  actorKey: "player" | "cpu",
  card: Card
): PlayResult {
  const self = actorKey === "player" ? state.player : state.cpu;
  const opponent = actorKey === "player" ? state.cpu : state.player;
  // 攻撃対象の弱点属性。CPU戦ではプレイヤーに弱点がない（playerWeakness=null）。
  const weaknessAttr = actorKey === "player" ? state.cpuWeakness : state.playerWeakness;

  const effectiveCost = Math.max(
    0,
    card.cost - (card.type === "attack" ? self.costReductionNextAttack : 0)
  );
  if (effectiveCost > state.costBudget) {
    return { ok: false, reason: "insufficient cost budget" };
  }

  const handIndex = self.hand.findIndex((c) => c.id === card.id);
  if (handIndex === -1) return { ok: false, reason: "card not in hand" };

  // 防御カードは、直前に相手から disableOpponentDefenseNextTurn を受けていると不発になる。
  const defenseDisabled = card.type === "defense" && self.defenseDisabledNextTurn;
  if (card.type === "defense") self.defenseDisabledNextTurn = false;

  state.costBudget -= effectiveCost;
  if (card.type === "attack") self.costReductionNextAttack = 0;

  self.hand.splice(handIndex, 1);
  self.discard.push(card);

  if (actorKey === "player") state.lastPlayerCard = card;
  else state.lastCpuCard = card;
  state.history.push({ turn: state.turn, actor: actorKey, card });
  const actorLabel =
    actorKey === "player" ? state.actorLabels?.player ?? "あなた" : state.actorLabels?.cpu ?? "相手";
  state.log.push(
    `ターン${state.turn}: ${actorLabel}が「${card.name}」を使用${defenseDisabled ? "（不発）" : ""}`
  );

  if (!defenseDisabled) {
    const isWeaknessMatch = weaknessAttr !== null && card.attribute === weaknessAttr;
    const selfPrideBelowHalf = self.pride <= self.maxPride / 2;

    // カード1枚が持つダメージ系効果(damage/damageIfWeakness/damageIfSelfPrideBelowHalf)は
    // 合算した上で1回だけ相手のblock/negateを消費して適用する（1枚=1ヒットとして扱う）。
    let totalDamage = sumDamage(card.effects, isWeaknessMatch, selfPrideBelowHalf);
    if (totalDamage > 0) {
      // レジェンド覚醒: 攻撃側が覚醒中なら2倍、防御側が覚醒中なら半減（切り上げ）。両方なら相殺。
      if (self.legendTurns > 0) totalDamage *= 2;
      if (opponent.legendTurns > 0) totalDamage = Math.ceil(totalDamage / 2);
      applyDamage(opponent, totalDamage);
    }

    for (const effect of card.effects) {
      applyEffect(effect, { self, opponent, card, isWeaknessMatch });
    }
  }

  checkWinner(state);
  return { ok: true };
}

export function checkWinner(state: GameState): void {
  if (state.cpu.pride <= 0) state.winner = "player";
  else if (state.player.pride <= 0) state.winner = "cpu";
}
