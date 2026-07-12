import type { Card } from "../engine/types";
import { EXPANDED_CARDS } from "./expandedCards";

// 攻撃値は定義後にbalanceAttackCardで新基準へ正規化する。
const BASE_CARDS: Card[] = [
  {
    id: "A01",
    name: "挑発の流し目",
    type: "attack",
    attribute: "煽り",
    cost: 1,
    effects: [
      { type: "damage", value: 2 },
      { type: "damageIfWeakness", value: 1 },
    ],
    flavor: "「へえ、それが精一杯？」",
  },
  {
    id: "A02",
    name: "煽りの二段活用",
    type: "attack",
    attribute: "煽り",
    cost: 2,
    effects: [
      { type: "damage", value: 4 },
      { type: "damageIfWeakness", value: 2 },
      { type: "costReductionNextAttack", value: 1 },
    ],
    flavor: "一発目で怯ませ、二発目で刈り取る。",
  },
  {
    id: "A03",
    name: "正論パンチ",
    type: "attack",
    attribute: "正論",
    cost: 1,
    effects: [
      { type: "damage", value: 2 },
      { type: "damageIfWeakness", value: 1 },
    ],
    flavor: "反論の余地がない一撃。",
  },
  {
    id: "A04",
    name: "議事録の突きつけ",
    type: "attack",
    attribute: "正論",
    cost: 2,
    effects: [
      { type: "damage", value: 4 },
      { type: "damageIfWeakness", value: 2 },
      { type: "disableOpponentDefenseNextTurn" },
    ],
    flavor: "過去の発言を、そのまま突き返す。",
  },
  {
    id: "A05",
    name: "遠回しな嫌味",
    type: "attack",
    attribute: "皮肉",
    cost: 1,
    effects: [
      { type: "damage", value: 2 },
      { type: "damageIfWeakness", value: 1 },
      { type: "revealOpponentHand" },
    ],
    flavor: "回りくどいほど、後から効いてくる。",
  },
  {
    id: "A06",
    name: "褒め殺しの刃",
    type: "attack",
    attribute: "皮肉",
    cost: 2,
    effects: [
      { type: "damage", value: 4 },
      { type: "damageIfWeakness", value: 2 },
      { type: "reduceOpponentAngerGain", value: 1 },
    ],
    flavor: "褒めているようで、褒めていない。",
  },
  {
    id: "A07",
    name: "自虐からのカウンター",
    type: "attack",
    attribute: "自虐からの逆転",
    cost: 1,
    effects: [
      { type: "damage", value: 2 },
      { type: "damageIfWeakness", value: 1 },
      { type: "prideHeal", value: 1 },
    ],
    flavor: "自分を落として、相手の油断を刺す。",
  },
  {
    id: "A08",
    name: "谷底からの這い上がり",
    type: "attack",
    attribute: "自虐からの逆転",
    cost: 2,
    effects: [
      { type: "damage", value: 4 },
      { type: "damageIfWeakness", value: 2 },
      { type: "damageIfSelfPrideBelowHalf", value: 3 },
    ],
    flavor: "底を見せた後の反撃は、深く刺さる。",
  },
  {
    id: "D01",
    name: "軽くいなす",
    type: "defense",
    attribute: null,
    cost: 1,
    effects: [{ type: "blockNextDamage", value: 3 }],
    flavor: "「はいはい、そうですね」",
  },
  {
    id: "D02",
    name: "話をすり替える",
    type: "defense",
    attribute: null,
    cost: 2,
    effects: [{ type: "negateNextAttack" }],
    flavor: "論点をずらせば、傷は負わない。",
  },
  {
    id: "D03",
    name: "無言の圧",
    type: "defense",
    attribute: null,
    cost: 1,
    effects: [
      { type: "blockNextDamage", value: 2 },
      { type: "reduceOpponentAngerGain", value: 1 },
    ],
    flavor: "何も言わないことが、一番効く時がある。",
  },
  {
    id: "B01",
    name: "深呼吸で冷静に",
    type: "buff",
    attribute: null,
    cost: 1,
    effects: [{ type: "prideHeal", value: 3 }],
    flavor: "頭を冷やせば、次の一手が見える。",
  },
  {
    id: "B02",
    name: "場の空気を読む",
    type: "buff",
    attribute: null,
    cost: 1,
    effects: [{ type: "revealWeaknessHint" }],
    flavor: "観察こそが、勝負の半分。",
  },
  {
    id: "B03",
    name: "怒りを飲み込む",
    type: "buff",
    attribute: null,
    cost: 1,
    effects: [
      { type: "angerGainSelfPridePenalty", value: 2 },
    ],
    flavor: "溜め込んだ怒りは、いずれ牙になる。",
  },
  // ここから コスト3〜5 のカード（ターンが進んでコスト予算が増えた後に使う強力な一枚）。
  {
    id: "A09",
    name: "積年の恨み節",
    type: "attack",
    attribute: "煽り",
    cost: 3,
    effects: [
      { type: "damage", value: 6 },
      { type: "damageIfWeakness", value: 2 },
      { type: "costReductionNextAttack", value: 1 },
    ],
    flavor: "溜め込んだ分だけ、重くのしかかる。",
  },
  {
    id: "A10",
    name: "完全論破",
    type: "attack",
    attribute: "正論",
    cost: 3,
    effects: [
      { type: "damage", value: 6 },
      { type: "damageIfWeakness", value: 2 },
      { type: "disableOpponentDefenseNextTurn" },
    ],
    flavor: "言い訳の逃げ道を、全部塞ぐ。",
  },
  {
    id: "A11",
    name: "笑顔の刃",
    type: "attack",
    attribute: "皮肉",
    cost: 3,
    effects: [
      { type: "damage", value: 6 },
      { type: "damageIfWeakness", value: 2 },
      { type: "revealOpponentHand" },
    ],
    flavor: "微笑みながら、手の内まで見透かす。",
  },
  {
    id: "A12",
    name: "覚悟の逆襲",
    type: "attack",
    attribute: "自虐からの逆転",
    cost: 3,
    effects: [
      { type: "damage", value: 6 },
      { type: "damageIfWeakness", value: 2 },
      { type: "prideHeal", value: 2 },
    ],
    flavor: "落ちるところまで落ちたなら、あとは上がるだけ。",
  },
  {
    id: "A13",
    name: "格の違いを見せつける一言",
    type: "attack",
    attribute: "煽り",
    cost: 4,
    effects: [
      { type: "damage", value: 8 },
      { type: "damageIfWeakness", value: 2 },
      { type: "angerGain", value: 2 },
    ],
    flavor: "格の違いを、言葉ひとつで思い知らせる。",
  },
  {
    id: "A14",
    name: "完膚なきまでの正論",
    type: "attack",
    attribute: "正論",
    cost: 4,
    effects: [
      { type: "damage", value: 8 },
      { type: "damageIfWeakness", value: 2 },
      { type: "reduceOpponentCostRecoveryNextTurn", value: 1 },
    ],
    flavor: "反論する気力すら、奪い取る。",
  },
  {
    id: "A15",
    name: "起死回生の啖呵",
    type: "attack",
    attribute: "自虐からの逆転",
    cost: 5,
    effects: [
      { type: "damage", value: 10 },
      { type: "damageIfWeakness", value: 3 },
      { type: "damageIfSelfPrideBelowHalf", value: 4 },
    ],
    flavor: "追い詰められた者だけが放てる、最後の啖呵。",
  },
  {
    id: "D04",
    name: "鉄壁の受け流し",
    type: "defense",
    attribute: null,
    cost: 3,
    effects: [{ type: "blockNextDamage", value: 9 }],
    flavor: "何を言われても、揺らがない。",
  },
  {
    id: "B04",
    name: "怒りの解放",
    type: "buff",
    attribute: null,
    cost: 3,
    effects: [{ type: "angerGainSelfPridePenalty", value: 6 }],
    flavor: "溜め込んだものを、一気に解き放つ。",
  },
  // ここから防御・強化の追加カード（種類の少なさを補う拡充。基準はdocs/04_balance_rules.md:
  // 防御軽減=コスト×3、強化の怒り獲得=コスト×2、回復=コスト×3。副次効果を持つ場合は主効果を1段階下げる）。
  {
    id: "D05",
    name: "「で、結論は？」",
    type: "defense",
    attribute: null,
    cost: 1,
    effects: [
      { type: "blockNextDamage", value: 2 },
      { type: "costReductionNextAttack", value: 1 },
    ],
    flavor: "話の長い相手には、これが一番効く。",
  },
  {
    id: "D06",
    name: "苦笑いでかわす",
    type: "defense",
    attribute: null,
    cost: 1,
    effects: [
      { type: "blockNextDamage", value: 2 },
      { type: "angerGain", value: 1 },
    ],
    flavor: "笑ってはいるが、目は笑っていない。",
  },
  {
    id: "D07",
    name: "揚げ足取りの構え",
    type: "defense",
    attribute: null,
    cost: 2,
    effects: [
      { type: "blockNextDamage", value: 4 },
      { type: "reduceOpponentCostRecoveryNextTurn", value: 1 },
    ],
    flavor: "その言い間違い、いただきます。",
  },
  {
    id: "D08",
    name: "心のシャッター",
    type: "defense",
    attribute: null,
    cost: 2,
    effects: [{ type: "blockNextDamage", value: 6 }],
    flavor: "本日の営業は終了しました。",
  },
  {
    id: "D09",
    name: "全肯定バリア",
    type: "defense",
    attribute: null,
    cost: 3,
    effects: [
      { type: "blockNextDamage", value: 6 },
      { type: "prideHeal", value: 3 },
    ],
    flavor: "なるほど、一理ある。だから傷つかない。",
  },
  {
    id: "D10",
    name: "沈黙の結界",
    type: "defense",
    attribute: null,
    cost: 2,
    effects: [
      { type: "blockNextDamage", value: 3 },
      { type: "reduceOpponentAngerGain", value: 2 },
    ],
    flavor: "何も返さないことで、何も与えない。",
  },
  {
    id: "B05",
    name: "闘志の火付け",
    type: "buff",
    attribute: null,
    cost: 1,
    effects: [{ type: "angerGain", value: 2 }],
    flavor: "よし、言うぞ。言うからな。",
  },
  {
    id: "B06",
    name: "セルフ演説",
    type: "buff",
    attribute: null,
    cost: 2,
    effects: [{ type: "angerGain", value: 4 }],
    flavor: "俺は強い。強いったら強い。",
  },
  {
    id: "B07",
    name: "傷を舐める",
    type: "buff",
    attribute: null,
    cost: 2,
    effects: [{ type: "prideHeal", value: 6 }],
    flavor: "今日はもう、自分を甘やかすと決めた。",
  },
  {
    id: "B08",
    name: "開き直り",
    type: "buff",
    attribute: null,
    cost: 1,
    effects: [
      { type: "prideHeal", value: 2 },
      { type: "angerGain", value: 1 },
    ],
    flavor: "それが何か？",
  },
  {
    id: "B09",
    name: "聞き耳を立てる",
    type: "buff",
    attribute: null,
    cost: 1,
    effects: [{ type: "revealOpponentHand" }],
    flavor: "壁に耳あり、豚に聞き耳。",
  },
  {
    id: "B10",
    name: "勝利の妄想",
    type: "buff",
    attribute: null,
    cost: 3,
    effects: [
      { type: "prideHeal", value: 4 },
      { type: "angerGain", value: 3 },
    ],
    flavor: "勝った後のことしか考えていない。",
  },
];

/** 高コスト攻撃の瞬間火力を抑え、CPUの一方的な大ダメージを防ぐ。 */
function balanceAttackCard(card: Card, signature = false): Card {
  if (card.type !== "attack") return card;
  const baseCap = Math.ceil(card.cost * 1.5) + (signature ? 1 : 0);
  const weaknessCap = Math.max(1, Math.ceil(card.cost * 0.4));
  const comebackCap = Math.max(2, Math.ceil(card.cost * 0.75));
  return {
    ...card,
    effects: card.effects.map((effect) => {
      if (effect.type === "damage") return { ...effect, value: Math.min(effect.value ?? 0, baseCap) };
      if (effect.type === "damageIfWeakness") return { ...effect, value: Math.min(effect.value ?? 0, weaknessCap) };
      if (effect.type === "damageIfSelfPrideBelowHalf") return { ...effect, value: Math.min(effect.value ?? 0, comebackCap) };
      return effect;
    }),
  };
}

/** 共通カード全種（既存35種 + 追加70種）。 */
export const CARDS: Card[] = [...BASE_CARDS, ...EXPANDED_CARDS].map((card) => balanceAttackCard(card));

export const FINISHER_CARD: Card = balanceAttackCard({
  id: "F01",
  name: "積年の怒りの一言",
  type: "attack",
  attribute: null,
  cost: 3,
  effects: [{ type: "damage", value: 8 }],
  flavor: "これまでの積み重ねが、今この一言に乗る。",
}, true);

// キャラクター固有の必殺カード。基準はdocs/04_balance_rules.md:
// 「必殺カードは同コスト帯の基準値より効果量+2相当のプレミアムを持つ代わりに、
// デッキに1枚だけ・キャラクター固有」とする。属性は持たない（弱点判定の対象外）。
const SIGNATURE_CARD_DEFINITIONS: Card[] = [
  {
    id: "S01",
    name: "女王様の罵倒",
    type: "attack",
    attribute: null,
    cost: 5,
    effects: [{ type: "damage", value: 12 }],
    flavor: "たっく、気色悪りぃ！！ぶち落としてやんわ",
  },
  {
    id: "S02",
    name: "BGの正論爆撃",
    type: "attack",
    attribute: null,
    cost: 4,
    effects: [
      { type: "damage", value: 8 },
      { type: "disableOpponentDefenseNextTurn" },
    ],
    flavor: "そんなことやっても無駄ぶひ！！",
  },
  {
    id: "S03",
    name: "しんごのスッキリタイム",
    type: "attack",
    attribute: null,
    cost: 4,
    effects: [
      { type: "damage", value: 6 },
      { type: "prideHeal", value: 4 },
    ],
    flavor: "ロマ子さまのこと想像すると、スッキリするぶひ！！",
  },
  {
    id: "S04",
    name: "Hisaの静かな圧",
    type: "attack",
    attribute: null,
    cost: 4,
    effects: [
      { type: "damage", value: 8 },
      { type: "angerGain", value: 3 },
    ],
    flavor: "なんだか調子が悪いぶひ....",
  },
  {
    id: "S05",
    name: "たけちゃんのほいでねノイローゼ",
    type: "attack",
    attribute: null,
    cost: 4,
    effects: [{ type: "damage", value: 10 }],
    flavor: "ロマ子さま、あのね、ほいでね、ほいでね、ほいでね、プキーン！！",
  },
  {
    id: "S06",
    name: "てるぞーの照れ隠し",
    type: "attack",
    attribute: null,
    cost: 4,
    effects: [
      { type: "damage", value: 4 },
      { type: "prideHeal", value: 8 },
    ],
    flavor: "べ、別に効いてないんだピョーン！！",
  },
  {
    id: "S07",
    name: "りおんの起死回生",
    type: "attack",
    attribute: null,
    cost: 4,
    effects: [
      { type: "damage", value: 10 },
      { type: "damageIfSelfPrideBelowHalf", value: 6 },
    ],
    flavor: "これで終わりだ！！",
  },
  {
    id: "S08",
    name: "バクの夢喰い",
    type: "attack",
    attribute: null,
    cost: 4,
    effects: [
      { type: "damage", value: 7 },
      { type: "reduceOpponentCostRecoveryNextTurn", value: 2 },
    ],
    flavor: "ロマ子様のことを考えると、もう食べちゃった。",
  },
  {
    id: "S09",
    name: "さちよの包容力",
    type: "buff",
    attribute: null,
    cost: 4,
    effects: [{ type: "prideHeal", value: 12 }],
    flavor: "はいはい、みんなえらいえらい。",
  },
  {
    id: "S10",
    name: "うえむのクレーム叩きつけタイム",
    type: "attack",
    attribute: null,
    cost: 4,
    effects: [
      { type: "damage", value: 6 },
      { type: "revealOpponentHand" },
      { type: "blockNextDamage", value: 3 },
    ],
    flavor: "ロマ子がまた変なこと言ってるぶひ！！クレーム入れよっと",
  },
  {
    id: "S11",
    name: "みとの変態発言",
    type: "attack",
    attribute: null,
    cost: 4,
    effects: [
      { type: "damage", value: 9 },
      { type: "reduceOpponentAngerGain", value: 2 },
    ],
    flavor: "え、え、はっは恥ずかしい////",
  },
  {
    id: "S12",
    name: "ピッコーの奇襲",
    type: "attack",
    attribute: null,
    cost: 3,
    effects: [
      { type: "damage", value: 5 },
      { type: "costReductionNextAttack", value: 2 },
    ],
    flavor: "ロマ子様の隙をついて、家を荒らすぶひ！！",
  },
  {
    id: "S13",
    name: "臥龍の眼光",
    type: "attack",
    attribute: null,
    cost: 5,
    effects: [
      { type: "damage", value: 8 },
      { type: "blockNextDamage", value: 6 },
    ],
    flavor: "ロマ子様の下着は何色ぶひ？",
  },
];

export const SIGNATURE_CARDS: Card[] = SIGNATURE_CARD_DEFINITIONS.map((card) => balanceAttackCard(card, true));

export function getSignatureCard(id: string): Card {
  const found = SIGNATURE_CARDS.find((c) => c.id === id);
  if (!found) throw new Error(`unknown signature card id: ${id}`);
  return found;
}

// レジェンドカード: 全キャラクターのデッキに1枚だけ入る切り札。
// コスト7（コスト予算がターン7以降で届く）で、発動ターンを含む5ターンの間
// 「与えるダメージ2倍・受けるダメージ半減」の覚醒状態になる。
// 発動中は対戦BGMも専用の激しいものに切り替わる（sound.ts）。
export const LEGEND_CARD: Card = {
  id: "L01",
  name: "レジェンド覚醒",
  type: "buff",
  attribute: null,
  cost: 7,
  effects: [{ type: "legendAwaken", value: 5 }],
  flavor: "ここからの5ターン、主役は俺だ。",
};

// 初期デッキはコスト1・2を中心に構成する。コスト3〜5のカードは
// 勝利後のカード報酬（pickRewardChoices）を通じて徐々に手に入る設計とする。
export const INITIAL_DECK_IDS = [
  "A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08",
  "D01", "D02", "D03", "B01", "B02",
  // 新効果を初戦から体験できる基本カード。強力な上位版は勝利報酬で獲得する。
  "B11", "B15", "B19",
];
