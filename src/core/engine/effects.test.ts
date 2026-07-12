import { describe, expect, it } from "vitest";
import { beginBattle } from "./turn";
import { playCard } from "./resolveCard";
import type { Card } from "./types";

const ANGER_BUFF: Card = {
  id: "T-BUFF1",
  name: "テスト強化",
  type: "buff",
  attribute: null,
  cost: 1,
  effects: [{ type: "angerGainSelfPridePenalty", value: 2 }],
  flavor: "",
};

const REDUCE_ANGER_ATTACK: Card = {
  id: "T-ATK-REDUCE",
  name: "怒り抑制攻撃",
  type: "attack",
  attribute: "皮肉",
  cost: 1,
  effects: [
    { type: "damage", value: 1 },
    { type: "reduceOpponentAngerGain", value: 5 },
  ],
  flavor: "",
};

describe("effects - エッジケース", () => {
  it("angerGainSelfPridePenaltyは怒り獲得と誇り減少の両方を適用する", () => {
    const state = beginBattle([ANGER_BUFF], [ANGER_BUFF], "煽り");
    const beforePride = state.player.pride;
    playCard(state, "player", ANGER_BUFF);
    expect(state.player.anger).toBe(2);
    expect(state.player.pride).toBe(beforePride - 1);
  });

  it("reduceOpponentAngerGainは相手の次の怒り獲得を打ち消す(0未満にはならない)", () => {
    const state = beginBattle([REDUCE_ANGER_ATTACK], [ANGER_BUFF], "皮肉");
    playCard(state, "player", REDUCE_ANGER_ATTACK); // cpuのangerGainReductionを5に
    expect(state.cpu.angerGainReduction).toBe(5);

    state.costBudget = 1; // プレイヤーのターンとは別に、CPU側の行動分のコストを用意する
    playCard(state, "cpu", ANGER_BUFF); // 本来2獲得だが5引かれて0未満にはしない
    expect(state.cpu.anger).toBe(0);
    expect(state.cpu.angerGainReduction).toBe(0); // 消費後はリセットされる
  });

  it("効果対象がいない防御カード(block)は誇りにマイナス影響を与えない", () => {
    const BLOCK_ONLY: Card = {
      id: "T-DEF-ONLY",
      name: "軽減のみ",
      type: "defense",
      attribute: null,
      cost: 1,
      effects: [{ type: "blockNextDamage", value: 3 }],
      flavor: "",
    };
    const state = beginBattle([BLOCK_ONLY], [BLOCK_ONLY], "煽り");
    const before = state.player.pride;
    playCard(state, "player", BLOCK_ONLY); // 攻撃を受けていない状態でも安全
    expect(state.player.pride).toBe(before);
    expect(state.player.blockNext).toBe(3);
  });

  it("drawCardsは使用したターン中に指定枚数を引き、手札上限を守る", () => {
    const DRAW: Card = { id: "T-DRAW", name: "ドロー", type: "buff", attribute: null, cost: 0, effects: [{ type: "drawCards", value: 5 }], flavor: "" };
    const fillers = Array.from({ length: 12 }, (_, i): Card => ({ ...ANGER_BUFF, id: `T-FILL-${i}` }));
    const state = beginBattle([DRAW, ...fillers], [ANGER_BUFF], "煽り");
    state.player.hand = [DRAW];
    playCard(state, "player", DRAW);
    expect(state.player.hand).toHaveLength(5);
    expect(state.player.hand.length).toBeLessThanOrEqual(10);
  });

  it("discardOpponentHandは指定枚数、discardOpponentAllは残りすべてを捨て札へ移す", () => {
    const DISCARD_TWO: Card = { id: "T-DISCARD-2", name: "2枚破棄", type: "buff", attribute: null, cost: 0, effects: [{ type: "discardOpponentHand", value: 2 }], flavor: "" };
    const DISCARD_ALL: Card = { id: "T-DISCARD-ALL", name: "全破棄", type: "buff", attribute: null, cost: 0, effects: [{ type: "discardOpponentAll" }], flavor: "" };
    const state = beginBattle([DISCARD_TWO, DISCARD_ALL], [ANGER_BUFF, REDUCE_ANGER_ATTACK, DISCARD_TWO, DISCARD_ALL], "煽り");
    state.player.hand = [DISCARD_TWO, DISCARD_ALL];
    const before = state.cpu.hand.length;
    playCard(state, "player", DISCARD_TWO);
    expect(state.cpu.hand).toHaveLength(Math.max(0, before - 2));
    state.player.hand.push(DISCARD_ALL);
    playCard(state, "player", DISCARD_ALL);
    expect(state.cpu.hand).toHaveLength(0);
    expect(state.cpu.discard.length).toBeGreaterThanOrEqual(before);
  });

  it("costIncreaseNextTurnは相手の次ターン予算を指定値だけ減らす", () => {
    const JAM: Card = { id: "T-JAM", name: "妨害", type: "buff", attribute: null, cost: 0, effects: [{ type: "costIncreaseNextTurn", value: 3 }], flavor: "" };
    const state = beginBattle([JAM], [ANGER_BUFF], "煽り");
    state.player.hand = [JAM];
    playCard(state, "player", JAM);
    expect(state.cpu.costRecoveryPenaltyNextTurn).toBe(-3);
  });

  it("reduceOpponentCostRecoveryNextTurnも相手の次ターン予算を減らす", () => {
    const SLOW: Card = { id: "T-SLOW", name: "回復妨害", type: "attack", attribute: null, cost: 0, effects: [{ type: "reduceOpponentCostRecoveryNextTurn", value: 2 }], flavor: "" };
    const state = beginBattle([SLOW], [ANGER_BUFF], "煽り");
    state.player.hand = [SLOW];
    playCard(state, "player", SLOW);
    expect(state.cpu.costRecoveryPenaltyNextTurn).toBe(-2);
  });
});
