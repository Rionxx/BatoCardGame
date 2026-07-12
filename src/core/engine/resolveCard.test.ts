import { describe, expect, it } from "vitest";
import { beginBattle } from "./turn";
import { playCard } from "./resolveCard";
import type { Card } from "./types";

const ATTACK_1: Card = {
  id: "T-ATK1",
  name: "テスト攻撃1",
  type: "attack",
  attribute: "煽り",
  cost: 1,
  effects: [
    { type: "damage", value: 2 },
    { type: "damageIfWeakness", value: 1 },
  ],
  flavor: "",
};

const ATTACK_ZERO_COST: Card = {
  id: "T-ATK0",
  name: "コスト0攻撃",
  type: "attack",
  attribute: "正論",
  cost: 0,
  effects: [{ type: "damage", value: 1 }],
  flavor: "",
};

const DEFENSE_BLOCK: Card = {
  id: "T-DEF1",
  name: "テスト防御",
  type: "defense",
  attribute: null,
  cost: 1,
  effects: [{ type: "blockNextDamage", value: 3 }],
  flavor: "",
};

const DEFENSE_NEGATE: Card = {
  id: "T-DEF2",
  name: "テスト無効化",
  type: "defense",
  attribute: null,
  cost: 1,
  effects: [{ type: "negateNextAttack" }],
  flavor: "",
};

function newBattle(deckExtra: Card[] = []) {
  const deck = [ATTACK_1, ATTACK_ZERO_COST, DEFENSE_BLOCK, DEFENSE_NEGATE, ...deckExtra];
  const cpuDeck = [ATTACK_1, DEFENSE_BLOCK, DEFENSE_NEGATE, ATTACK_ZERO_COST];
  return beginBattle(deck, cpuDeck, "煽り");
}

describe("playCard - 基本挙動", () => {
  it("弱点属性が一致すると追加ダメージが乗る", () => {
    const state = newBattle();
    const before = state.cpu.pride;
    playCard(state, "player", ATTACK_1);
    expect(state.cpu.pride).toBe(before - 3); // damage2 + weakness bonus1
  });

  it("弱点属性が一致しない場合は基礎ダメージのみ", () => {
    const state = newBattle();
    state.cpuWeakness = "正論"; // ATTACK_1は煽り属性なので一致しない
    const before = state.cpu.pride;
    playCard(state, "player", ATTACK_1);
    expect(state.cpu.pride).toBe(before - 2);
  });

  it("コスト0のカードは残りコストが0でも使用できる", () => {
    const state = newBattle();
    state.costBudget = 0;
    const result = playCard(state, "player", ATTACK_ZERO_COST);
    expect(result.ok).toBe(true);
  });

  it("コストが足りない場合は使用できずゲーム状態も変化しない", () => {
    const state = newBattle();
    state.costBudget = 0;
    const before = state.cpu.pride;
    const result = playCard(state, "player", ATTACK_1);
    expect(result.ok).toBe(false);
    expect(state.cpu.pride).toBe(before);
  });

  it("手札にないカードは使用できない", () => {
    const state = newBattle();
    state.player.hand = state.player.hand.filter((c) => c.id !== ATTACK_1.id);
    const result = playCard(state, "player", ATTACK_1);
    expect(result.ok).toBe(false);
  });

  it("blockNextDamageは次の被ダメージを軽減し、超過分のみ通す", () => {
    const state = newBattle();
    state.costBudget = 2;
    playCard(state, "cpu", DEFENSE_BLOCK); // cpu側が3軽減を得る
    const before = state.cpu.pride;
    playCard(state, "player", ATTACK_1); // 2+1=3ダメージ想定だが軽減3で相殺
    expect(state.cpu.pride).toBe(before);
  });

  it("negateNextAttackは効果対象がいない状態でも安全に消費される", () => {
    const state = newBattle();
    state.costBudget = 2;
    playCard(state, "cpu", DEFENSE_NEGATE);
    const before = state.cpu.pride;
    playCard(state, "player", ATTACK_1);
    expect(state.cpu.pride).toBe(before); // ダメージが完全無効化される
    expect(state.cpu.negateNextAttack).toBe(false); // 1回消費で解除される
  });

  it("誇りが0以下になった時点で勝者が確定する", () => {
    const state = newBattle();
    state.cpu.pride = 2;
    playCard(state, "player", ATTACK_1);
    expect(state.winner).toBe("player");
  });

  it("カード使用は履歴(history)とログ(log)、直前使用カード(lastPlayerCard/lastCpuCard)に記録される", () => {
    const state = newBattle();
    state.costBudget = 2;
    playCard(state, "player", ATTACK_1);
    expect(state.lastPlayerCard?.id).toBe(ATTACK_1.id);
    expect(state.history.at(-1)).toMatchObject({ actor: "player", card: { id: ATTACK_1.id } });
    expect(state.log.at(-1)).toContain("あなたが「テスト攻撃1」を使用");

    playCard(state, "cpu", ATTACK_1);
    expect(state.lastCpuCard?.id).toBe(ATTACK_1.id);
    expect(state.log.at(-1)).toContain("相手が「テスト攻撃1」を使用");
  });
});
