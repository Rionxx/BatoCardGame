import type { Actor, Card, Effect } from "./types";
import { drawCards } from "./state";

export interface EffectContext {
  self: Actor;
  opponent: Actor;
  card: Card;
  isWeaknessMatch: boolean;
}

const DAMAGE_EFFECT_TYPES = new Set([
  "damage",
  "damageIfWeakness",
  "damageIfSelfPrideBelowHalf",
]);

/** カード1枚分のダメージ系効果を合算した数値。実際の適用（軽減・無効化）はresolveCard側で1回だけ行う。 */
export function sumDamage(
  effects: Effect[],
  isWeaknessMatch: boolean,
  selfPrideBelowHalf: boolean
): number {
  let total = 0;
  for (const effect of effects) {
    if (effect.type === "damage") total += effect.value ?? 0;
    else if (effect.type === "damageIfWeakness" && isWeaknessMatch) total += effect.value ?? 0;
    else if (effect.type === "damageIfSelfPrideBelowHalf" && selfPrideBelowHalf) total += effect.value ?? 0;
  }
  return total;
}

/** ダメージを対象に適用する（無効化→軽減の順に1回だけ処理）。実際に通ったダメージ量を返す。 */
export function applyDamage(target: Actor, amount: number): number {
  if (amount <= 0) return 0;
  if (target.negateNextAttack) {
    target.negateNextAttack = false;
    return 0;
  }
  const mitigated = Math.max(0, amount - target.blockNext);
  target.blockNext = 0;
  target.pride -= mitigated;
  return mitigated;
}

// 新しい効果種別を追加する場合、EffectType(types.ts)にenumを1件追加し、
// このswitchにハンドラを1件追加する。カード側(cards.ts)のJSONは変更不要。
// ダメージ系(damage/damageIfWeakness/damageIfSelfPrideBelowHalf)はここでは扱わず、
// resolveCard側でsumDamage/applyDamageを使って1回だけ処理する。
export function applyEffect(effect: Effect, ctx: EffectContext): void {
  const { self, opponent } = ctx;
  if (DAMAGE_EFFECT_TYPES.has(effect.type)) return;

  switch (effect.type) {
    case "prideHeal": {
      self.pride = Math.min(self.maxPride, self.pride + (effect.value ?? 0));
      break;
    }
    case "angerGain": {
      self.anger += applyAngerGainReduction(self, effect.value ?? 0);
      break;
    }
    case "angerGainSelfPridePenalty": {
      self.anger += applyAngerGainReduction(self, effect.value ?? 0);
      self.pride -= 1;
      break;
    }
    case "blockNextDamage": {
      self.blockNext += effect.value ?? 0;
      break;
    }
    case "negateNextAttack": {
      self.negateNextAttack = true;
      break;
    }
    case "revealOpponentHand": {
      // UI層が参照する情報公開のみ。ロジック上の状態変化はない。
      break;
    }
    case "revealWeaknessHint": {
      // UI層のヒント表示トリガー。ロジック上の状態変化はない。
      break;
    }
    case "drawCards": {
      // 使用したそのターン中に即座に手札へ加える。上限と山札再構築はdrawCards側で処理する。
      drawCards(self, effect.value ?? 0);
      break;
    }
    case "discardOpponentHand": {
      const count = Math.min(effect.value ?? 0, opponent.hand.length);
      for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * opponent.hand.length);
        const [discarded] = opponent.hand.splice(index, 1);
        if (discarded) opponent.discard.push(discarded);
      }
      break;
    }
    case "discardOpponentAll": {
      opponent.discard.push(...opponent.hand.splice(0));
      break;
    }
    case "reduceOpponentAngerGain": {
      opponent.angerGainReduction += effect.value ?? 0;
      break;
    }
    case "costReductionNextAttack": {
      self.costReductionNextAttack += effect.value ?? 0;
      break;
    }
    case "costIncreaseNextTurn": {
      opponent.costRecoveryPenaltyNextTurn -= effect.value ?? 0;
      break;
    }
    case "disableOpponentDefenseNextTurn": {
      opponent.defenseDisabledNextTurn = true;
      break;
    }
    case "reduceOpponentCostRecoveryNextTurn": {
      opponent.costRecoveryPenaltyNextTurn -= effect.value ?? 0;
      break;
    }
    case "legendAwaken": {
      // 発動ターンを含めvalueターンの間、与ダメ2倍・被ダメ半減（適用はresolveCard側）
      self.legendTurns = effect.value ?? 5;
      break;
    }
  }
}

function applyAngerGainReduction(actor: Actor, base: number): number {
  const reduced = base - actor.angerGainReduction;
  actor.angerGainReduction = 0;
  return Math.max(0, reduced);
}
