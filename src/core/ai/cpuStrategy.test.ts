import { describe, expect, it } from "vitest";
import { createGameState } from "../engine/state";
import { runCpuTurn } from "./cpuStrategy";
import type { Card } from "../engine/types";

const HEAL_DEFENSE: Card = {
  id: "T-HEALDEF",
  name: "回復付き防御",
  type: "defense",
  attribute: null,
  cost: 1,
  effects: [
    { type: "blockNextDamage", value: 3 },
    { type: "prideHeal", value: 3 },
  ],
  flavor: "",
};

describe("cpuStrategy", () => {
  it("防御カードは1ターンに1枚までしか使わない（回復ループ防止）", () => {
    const state = createGameState([HEAL_DEFENSE], [HEAL_DEFENSE], "煽り");
    // CPUを低誇り状態にし、手札を回復付き防御3枚にする
    state.cpu.pride = 10;
    state.cpu.hand = [HEAL_DEFENSE, HEAL_DEFENSE, HEAL_DEFENSE];
    state.costBudget = 3;

    runCpuTurn(state);

    const defensesPlayed = state.cpu.discard.filter((c) => c.type === "defense").length;
    expect(defensesPlayed).toBe(1);
  });
});
