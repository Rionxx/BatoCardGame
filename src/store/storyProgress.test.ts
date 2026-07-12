import { describe, expect, it } from "vitest";
import type { Card } from "../core/engine/types";
import { useGameStore } from "./useGameStore";

const WIN_CARD: Card = {
  id: "T-STORY-WIN",
  name: "ストーリー勝利テスト",
  type: "attack",
  attribute: null,
  cost: 0,
  effects: [{ type: "damage", value: 999 }],
  flavor: "",
};

describe("ストーリーモードの章進行", () => {
  it("CPU戦に勝つと勝利画面を経由して次の章を開く", () => {
    const store = useGameStore.getState();
    store.startStoryBattle("romako", "bg", 1);
    const battle = useGameStore.getState().battle;
    battle.player.hand = [WIN_CARD];
    battle.costBudget = 0;
    useGameStore.setState({ battle: { ...battle } });

    useGameStore.getState().playCardFromHand(WIN_CARD);
    expect(useGameStore.getState().screen).toBe("storyVictory");

    useGameStore.getState().continueStoryAfterVictory();
    expect(useGameStore.getState().showStoryMode).toBe(true);
    expect(useGameStore.getState().storyResume).toEqual({ protagonistId: "romako", chapter: 2 });
  });
});
