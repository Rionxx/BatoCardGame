import { describe, expect, it } from "vitest";
import { createGameState, startCpuTurn } from "./state";
import { beginBattle } from "./turn";
import { playCard } from "./resolveCard";
import type { Card } from "./types";

const HEAL_CARD: Card = {
  id: "T-HEAL",
  name: "テスト回復",
  type: "buff",
  attribute: null,
  cost: 1,
  effects: [{ type: "prideHeal", value: 10 }],
  flavor: "",
};

describe("難易度オプション（BattleOptions）", () => {
  it("playerPride/cpuPrideで両者の誇り初期値を個別に設定できる", () => {
    const state = createGameState([HEAL_CARD], [HEAL_CARD], "煽り", {
      playerPride: 30,
      cpuPride: 80,
    });
    expect(state.player.pride).toBe(30);
    expect(state.player.maxPride).toBe(30);
    expect(state.cpu.pride).toBe(80);
    expect(state.cpu.maxPride).toBe(80);
  });

  it("cpuBudgetBonusはCPUターンのコスト予算に加算される", () => {
    const state = createGameState([HEAL_CARD], [HEAL_CARD], "煽り", { cpuBudgetBonus: 2 });
    state.turn = 3;
    startCpuTurn(state);
    expect(state.costBudget).toBe(5); // 基本3 + ボーナス2
  });

  it("負のcpuBudgetBonus（簡単）でもコスト予算は0未満にならない", () => {
    const state = createGameState([HEAL_CARD], [HEAL_CARD], "煽り", { cpuBudgetBonus: -1 });
    state.turn = 1;
    startCpuTurn(state);
    expect(state.costBudget).toBe(0); // 基本1 - 1
  });

  it("prideHealは自分のmaxPrideを超えて回復しない", () => {
    const state = beginBattle([HEAL_CARD], [HEAL_CARD], "煽り", { playerPride: 30 });
    state.player.pride = 25;
    playCard(state, "player", HEAL_CARD);
    expect(state.player.pride).toBe(30); // 25+10=35ではなく上限30で止まる
  });
});
