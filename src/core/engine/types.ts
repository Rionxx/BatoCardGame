export type CardType = "attack" | "defense" | "buff";

export type Attribute = "煽り" | "正論" | "皮肉" | "自虐からの逆転";

export type EffectType =
  | "damage"
  | "damageIfWeakness"
  | "damageIfSelfPrideBelowHalf"
  | "prideHeal"
  | "angerGain"
  | "angerGainSelfPridePenalty"
  | "blockNextDamage"
  | "negateNextAttack"
  | "revealOpponentHand"
  | "revealWeaknessHint"
  | "drawCards"
  | "discardOpponentHand"
  | "discardOpponentAll"
  | "reduceOpponentAngerGain"
  | "costReductionNextAttack"
  | "costIncreaseNextTurn"
  | "disableOpponentDefenseNextTurn"
  | "reduceOpponentCostRecoveryNextTurn"
  | "legendAwaken";

export interface Effect {
  type: EffectType;
  value?: number;
  duration?: number;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  attribute: Attribute | null;
  cost: number;
  effects: Effect[];
  flavor: string;
}

export type PersonalityType = "短気" | "プライド過剰" | "繊細" | "鈍感";

export const WEAKNESS_BY_PERSONALITY: Record<PersonalityType, Attribute> = {
  短気: "煽り",
  プライド過剰: "正論",
  繊細: "皮肉",
  鈍感: "自虐からの逆転",
};

export interface Actor {
  pride: number;
  maxPride: number;
  anger: number;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  blockNext: number;
  negateNextAttack: boolean;
  costReductionNextAttack: number;
  costRecoveryPenaltyNextTurn: number;
  defenseDisabledNextTurn: boolean;
  angerGainReduction: number;
  legendTurns: number; // レジェンド覚醒の残りターン数（>0の間、与ダメ2倍・被ダメ半減）
  hiddenHandCount?: number; // オンライン同期で手札内容を伏せたまま枚数だけ共有する
}

export interface LogEntry {
  turn: number;
  actor: "player" | "cpu";
  card: Card;
}

export interface GameState {
  turn: number;
  player: Actor;
  cpu: Actor;
  cpuWeakness: Attribute;
  playerWeakness: Attribute | null; // 2人対戦用。CPU戦ではnull（プレイヤーに弱点なし）
  actorLabels?: { player: string; cpu: string }; // ログ表示名（省略時: あなた/相手）
  costBudget: number;
  cpuBudgetBonus: number; // 難易度によるCPUのコスト予算補正
  winner: "player" | "cpu" | null;
  log: string[];
  history: LogEntry[];
  lastPlayerCard: Card | null;
  lastCpuCard: Card | null;
}
