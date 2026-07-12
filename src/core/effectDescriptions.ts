import type { Effect } from "./engine/types";

// カード効果(Effect)を日本語の説明文に変換する。カードギャラリー等の表示専用で、
// ゲームロジック（core/engine）には影響しない。
export function describeEffect(effect: Effect): string {
  const v = effect.value ?? 0;
  switch (effect.type) {
    case "damage":
      return `誇りを${v}減らす`;
    case "damageIfWeakness":
      return `相手の弱点属性と一致する場合、追加で${v}減らす`;
    case "damageIfSelfPrideBelowHalf":
      return `自分の誇りが半分以下のとき、追加で${v}減らす`;
    case "prideHeal":
      return `自分の誇りを${v}回復する（最大値を超えない）`;
    case "angerGain":
      return `怒りを${v}獲得する`;
    case "angerGainSelfPridePenalty":
      return `怒りを${v}獲得する（代わりに自分の誇りを1失う）`;
    case "blockNextDamage":
      return `次に受けるダメージを${v}軽減する`;
    case "negateNextAttack":
      return "次に受ける攻撃を1回無効化する";
    case "revealOpponentHand":
      return "相手の手札を見る";
    case "revealWeaknessHint":
      return "相手の弱点属性のヒントを得る";
    case "drawCards":
      return `このターン、カードを${v}枚引く`;
    case "discardOpponentHand":
      return `相手の手札をランダムに${v}枚捨てさせる`;
    case "discardOpponentAll":
      return "相手の手札をすべて捨てさせる";
    case "reduceOpponentAngerGain":
      return `相手の次の怒り獲得を${v}打ち消す`;
    case "costReductionNextAttack":
      return `次に使う攻撃カードのコストを${v}軽減する`;
    case "costIncreaseNextTurn":
      return `相手の次のターンのコスト予算を${v}減らす`;
    case "disableOpponentDefenseNextTurn":
      return "相手が次に使う防御カードを1回不発にする";
    case "reduceOpponentCostRecoveryNextTurn":
      return `相手の次のターンのコスト予算を${v}減らす`;
    case "legendAwaken":
      return `発動ターンを含む${v}ターンの間、与えるダメージ2倍・受けるダメージ半減`;
    default:
      return effect.type;
  }
}
