import { describe, expect, it } from "vitest";
import { beginBattle, endPlayerTurn } from "./turn";
import { playCard } from "./resolveCard";
import { startTurn } from "./state";
import { LEGEND_CARD } from "../data/cards";
import { INITIAL_HAND_SIZE, MAX_HAND_SIZE } from "./constants";
import type { Card } from "./types";

const ATTACK: Card = {
  id: "T-ATK",
  name: "テスト攻撃",
  type: "attack",
  attribute: "煽り",
  cost: 1,
  effects: [{ type: "damage", value: 4 }],
  flavor: "",
};

function manyCards(n: number): Card[] {
  return Array.from({ length: n }, () => ATTACK);
}

describe("レジェンドカード", () => {
  it("覚醒中は与えるダメージが2倍になる", () => {
    const state = beginBattle([LEGEND_CARD, ATTACK, ATTACK, ATTACK], manyCards(6), "正論");
    state.costBudget = 8;
    playCard(state, "player", LEGEND_CARD);
    expect(state.player.legendTurns).toBe(5);
    const before = state.cpu.pride;
    playCard(state, "player", ATTACK);
    expect(before - state.cpu.pride).toBe(8); // 4 × 2
  });

  it("相手が覚醒中は受けるダメージが半減する（切り上げ）", () => {
    const state = beginBattle(manyCards(6), [LEGEND_CARD, ATTACK, ATTACK, ATTACK], "正論");
    state.costBudget = 8;
    playCard(state, "cpu", LEGEND_CARD); // CPU側が覚醒
    state.costBudget = 2;
    const before = state.cpu.pride;
    playCard(state, "player", ATTACK);
    expect(before - state.cpu.pride).toBe(2); // 4 ÷ 2
  });

  it("両者覚醒中は相殺されて等倍になる", () => {
    const state = beginBattle([LEGEND_CARD, ATTACK, ATTACK, ATTACK], [LEGEND_CARD, ATTACK, ATTACK, ATTACK], "正論");
    state.costBudget = 8;
    playCard(state, "player", LEGEND_CARD);
    state.costBudget = 8;
    playCard(state, "cpu", LEGEND_CARD);
    state.costBudget = 2;
    const before = state.cpu.pride;
    playCard(state, "player", ATTACK);
    expect(before - state.cpu.pride).toBe(4); // 2倍 → 半減 = 等倍
  });

  it("覚醒は持ち主のターン開始5回で切れる（発動ターン含め5ターン持続）", () => {
    const state = beginBattle([LEGEND_CARD, ATTACK, ATTACK, ATTACK], manyCards(6), "正論");
    state.costBudget = 8;
    playCard(state, "player", LEGEND_CARD);
    expect(state.player.legendTurns).toBe(5);
    for (let i = 0; i < 5; i++) startTurn(state);
    expect(state.player.legendTurns).toBe(0);
  });
});

describe("手札のドロールール", () => {
  it("開始時は4枚、ターン終了ごとに1枚ずつ増える", () => {
    const state = beginBattle(manyCards(12), manyCards(12), "正論");
    expect(state.player.hand.length).toBe(INITIAL_HAND_SIZE);
    endPlayerTurn(state); // 何もプレイせずターン終了
    expect(state.player.hand.length).toBe(INITIAL_HAND_SIZE + 1);
  });

  it("手札は上限10枚を超えない", () => {
    const state = beginBattle(manyCards(20), manyCards(20), "正論");
    for (let i = 0; i < 10; i++) endPlayerTurn(state);
    expect(state.player.hand.length).toBeLessThanOrEqual(MAX_HAND_SIZE);
  });
});

describe("2人対戦の弱点属性", () => {
  it("playerWeakness指定時、CPU側(P2)の攻撃にも弱点ボーナスが乗る", () => {
    const WEAK_ATTACK: Card = {
      id: "T-WEAK",
      name: "弱点攻撃",
      type: "attack",
      attribute: "煽り",
      cost: 1,
      effects: [
        { type: "damage", value: 2 },
        { type: "damageIfWeakness", value: 1 },
      ],
      flavor: "",
    };
    const state = beginBattle([WEAK_ATTACK], [WEAK_ATTACK, WEAK_ATTACK, WEAK_ATTACK, WEAK_ATTACK], "正論", {
      playerWeakness: "煽り", // P1の弱点＝煽り
    });
    state.costBudget = 1;
    const before = state.player.pride;
    playCard(state, "cpu", WEAK_ATTACK);
    expect(before - state.player.pride).toBe(3); // 2 + 弱点ボーナス1
  });
});
