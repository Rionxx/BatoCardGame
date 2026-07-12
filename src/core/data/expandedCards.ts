import type { Attribute, Card, Effect } from "../engine/types";

// 追加70種。基礎値は「攻撃=コスト×2、防御=コスト×3、回復=コスト×3」を上限とし、
// 副次効果が強いカードは基礎値を1〜3段階落としている。
const ATTRIBUTES: Attribute[] = ["煽り", "正論", "皮肉", "自虐からの逆転"];

const ATTACK_NAMES = [
  "鼻で笑う", "矛盾の指摘", "丁寧すぎる嫌味", "失敗談からの逆襲", "マウントの小手調べ",
  "証拠のスクリーンショット", "遠回しな追撃", "弱みを笑いに変える", "上から目線の採点", "反論封じの三段論法",
  "拍手という名の皮肉", "黒歴史の開き直り", "余裕のあくび", "数字で殴る", "お世辞の毒針",
  "自爆覚悟の暴露", "煽り散らかし", "規約全文朗読", "満面の営業スマイル", "土壇場の強がり",
  "王者のため息", "最終弁論", "祝辞に見せた宣戦布告", "敗者復活の咆哮", "公開処刑の前口上",
  "逃げ道ゼロの検証", "沈黙を裂く一言", "どん底からの大逆転", "伝説級の煽り文句", "結論だけで完全論破",
] as const;

function attackEffects(index: number, cost: number): Effect[] {
  const effects: Effect[] = [
    { type: "damage", value: cost * 2 - (index % 3 === 0 ? 1 : 0) },
    { type: "damageIfWeakness", value: Math.max(1, Math.ceil(cost / 2)) },
  ];
  const variant = index % 8;
  if (variant === 1) effects.push({ type: "costReductionNextAttack", value: 1 });
  if (variant === 2) effects.push({ type: "reduceOpponentAngerGain", value: Math.min(2, cost) });
  if (variant === 3) effects.push({ type: "prideHeal", value: cost });
  if (variant === 4) effects.push({ type: "damageIfSelfPrideBelowHalf", value: cost + 1 });
  if (variant === 5 && cost >= 2) effects.push({ type: "disableOpponentDefenseNextTurn" });
  if (variant === 6) effects.push({ type: "angerGain", value: Math.ceil(cost / 2) });
  if (variant === 7) effects.push({ type: "blockNextDamage", value: cost });
  return effects;
}

export const EXPANDED_ATTACK_CARDS: Card[] = ATTACK_NAMES.map((name, index) => {
  const cost = (index % 5) + 1;
  return {
    id: `A${String(index + 16).padStart(2, "0")}`,
    name,
    type: "attack",
    attribute: ATTRIBUTES[index % ATTRIBUTES.length],
    cost,
    effects: attackEffects(index, cost),
    flavor: `言葉の角度を変えた、新しい攻め筋その${index + 1}。`,
  };
});

const DEFENSE_SEEDS: Array<[string, number, Effect[]]> = [
  ["聞こえないふり", 1, [{ type: "blockNextDamage", value: 3 }]],
  ["既読スルー", 1, [{ type: "blockNextDamage", value: 2 }, { type: "angerGain", value: 1 }]],
  ["論点整理ノート", 2, [{ type: "blockNextDamage", value: 5 }, { type: "revealWeaknessHint" }]],
  ["大人の対応", 2, [{ type: "blockNextDamage", value: 4 }, { type: "prideHeal", value: 2 }]],
  ["鉄面皮", 3, [{ type: "blockNextDamage", value: 9 }]],
  ["完璧なポーカーフェイス", 3, [{ type: "blockNextDamage", value: 7 }, { type: "angerGain", value: 2 }]],
  ["華麗な話題転換", 4, [{ type: "negateNextAttack" }, { type: "prideHeal", value: 3 }]],
  ["絶対領域の沈黙", 5, [{ type: "blockNextDamage", value: 15 }]],
  ["逆質問の盾", 2, [{ type: "blockNextDamage", value: 4 }, { type: "costReductionNextAttack", value: 1 }]],
  ["心を無にする", 3, [{ type: "blockNextDamage", value: 6 }, { type: "reduceOpponentAngerGain", value: 2 }]],
  ["笑ってごまかす", 1, [{ type: "blockNextDamage", value: 2 }, { type: "prideHeal", value: 1 }]],
  ["専門外です", 2, [{ type: "blockNextDamage", value: 5 }, { type: "revealOpponentHand" }]],
  ["記憶にございません", 3, [{ type: "negateNextAttack" }]],
  ["反論準備中", 3, [{ type: "blockNextDamage", value: 7 }, { type: "costReductionNextAttack", value: 2 }]],
  ["集団心理バリア", 4, [{ type: "blockNextDamage", value: 9 }, { type: "prideHeal", value: 3 }]],
  ["無敵の開き直り", 4, [{ type: "blockNextDamage", value: 10 }, { type: "angerGain", value: 2 }]],
  ["完全黙秘", 5, [{ type: "negateNextAttack" }, { type: "blockNextDamage", value: 6 }]],
  ["鋼のメンタル", 5, [{ type: "blockNextDamage", value: 12 }, { type: "prideHeal", value: 4 }]],
  ["次回に持ち越し", 2, [{ type: "blockNextDamage", value: 4 }, { type: "reduceOpponentCostRecoveryNextTurn", value: 1 }]],
  ["最終防衛ライン", 5, [{ type: "blockNextDamage", value: 10 }, { type: "angerGain", value: 4 }]],
];

export const EXPANDED_DEFENSE_CARDS: Card[] = DEFENSE_SEEDS.map(([name, cost, effects], index) => ({
  id: `D${String(index + 11).padStart(2, "0")}`,
  name,
  type: "defense",
  attribute: null,
  cost,
  effects,
  flavor: `受け止め方を変えれば、言葉の痛みも変わる。`,
}));

const BUFF_SEEDS: Array<[string, number, Effect[]]> = [
  ["次の一手を読む", 1, [{ type: "drawCards", value: 1 }]],
  ["情報収集", 2, [{ type: "drawCards", value: 2 }]],
  ["作戦会議", 3, [{ type: "drawCards", value: 3 }]],
  ["ひらめきの連鎖", 5, [{ type: "drawCards", value: 5 }]],
  ["手札への小言", 2, [{ type: "discardOpponentHand", value: 1 }]],
  ["選択肢を奪う", 3, [{ type: "discardOpponentHand", value: 2 }]],
  ["計画の破棄命令", 4, [{ type: "discardOpponentHand", value: 3 }]],
  ["ちゃぶ台返し", 5, [{ type: "discardOpponentAll" }]],
  ["小さな足止め", 1, [{ type: "costIncreaseNextTurn", value: 1 }]],
  ["予定の横やり", 2, [{ type: "costIncreaseNextTurn", value: 2 }]],
  ["面倒な追加確認", 3, [{ type: "costIncreaseNextTurn", value: 3 }]],
  ["終わらない再審査", 4, [{ type: "costIncreaseNextTurn", value: 4 }]],
  ["全面差し戻し", 5, [{ type: "costIncreaseNextTurn", value: 5 }]],
  ["自己肯定タイム", 1, [{ type: "prideHeal", value: 3 }]],
  ["怒りの貯金", 2, [{ type: "angerGain", value: 4 }]],
  ["弱点分析", 2, [{ type: "revealWeaknessHint" }, { type: "drawCards", value: 1 }]],
  ["先回りの準備", 3, [{ type: "costReductionNextAttack", value: 2 }, { type: "drawCards", value: 1 }]],
  ["不屈の自己暗示", 4, [{ type: "prideHeal", value: 8 }, { type: "angerGain", value: 3 }]],
  ["怒りの臨界点", 5, [{ type: "angerGainSelfPridePenalty", value: 10 }]],
  ["心技一体", 5, [{ type: "prideHeal", value: 7 }, { type: "angerGain", value: 5 }]],
];

export const EXPANDED_BUFF_CARDS: Card[] = BUFF_SEEDS.map(([name, cost, effects], index) => ({
  id: `B${String(index + 11).padStart(2, "0")}`,
  name,
  type: "buff",
  attribute: null,
  cost,
  effects,
  flavor: `盤面を動かすための、とっておきの準備。`,
}));

export const EXPANDED_CARDS: Card[] = [
  ...EXPANDED_ATTACK_CARDS,
  ...EXPANDED_DEFENSE_CARDS,
  ...EXPANDED_BUFF_CARDS,
];

if (EXPANDED_CARDS.length !== 70) {
  throw new Error(`expanded card count must be 70, got ${EXPANDED_CARDS.length}`);
}
