import { describe, expect, it } from "vitest";
import {
  TOURNAMENT_ROUND_LABELS,
  advanceRun,
  createRun,
  createStoryRun,
  createTournamentRun,
  getCpuDeck,
  getInitialDeck,
  pickRewardChoices,
} from "./runProgress";
import { getCharacter } from "../data/characters";
import { CHAPTER_ENCOUNTERS } from "../data/stories";
import { CHARACTERS } from "../data/characters";

const PLAYER_ID = "rion";

describe("runProgress", () => {
  it("初期ランは1体目の相手から始まり、対戦相手は3体選ばれる", () => {
    const run = createRun(PLAYER_ID);
    expect(run.round).toBe(0);
    expect(run.cleared).toBe(false);
    expect(run.opponents.length).toBe(3);
  });

  it("対戦相手にプレイヤー自身のキャラクターは含まれない", () => {
    const run = createRun(PLAYER_ID);
    expect(run.opponents.every((o) => o.id !== PLAYER_ID)).toBe(true);
  });

  it("対戦人数を指定するとその人数の相手が選ばれる（5/7/9）", () => {
    for (const n of [5, 7, 9]) {
      const run = createRun(PLAYER_ID, n);
      expect(run.opponents.length).toBe(n);
      // 重複なし
      expect(new Set(run.opponents.map((o) => o.id)).size).toBe(n);
    }
  });

  it("9人ランでも全対戦相手に勝てばclearedになる", () => {
    let run = createRun(PLAYER_ID, 9);
    for (let i = 0; i < 9; i++) {
      expect(run.cleared).toBe(false);
      run = advanceRun(run, null);
    }
    expect(run.cleared).toBe(true);
  });

  it("初期デッキにはプレイヤーキャラクターの必殺カードが1枚含まれる", () => {
    const run = createRun(PLAYER_ID);
    const signatureId = getCharacter(PLAYER_ID).signatureCardId;
    expect(run.deck.filter((c) => c.id === signatureId).length).toBe(1);
  });

  it("CPUデッキには対戦相手キャラクターの必殺カードが含まれる", () => {
    const run = createRun(PLAYER_ID);
    const opponent = run.opponents[0];
    const cpuDeck = getCpuDeck(opponent.id);
    expect(cpuDeck.some((c) => c.id === opponent.signatureCardId)).toBe(true);
    expect(cpuDeck).toHaveLength(getInitialDeck(opponent.id).length);
  });

  it("報酬を選ばずに進んでもデッキ枚数は変わらない", () => {
    const run = createRun(PLAYER_ID);
    const next = advanceRun(run, null);
    expect(next.deck.length).toBe(run.deck.length);
    expect(next.round).toBe(1);
  });

  it("報酬カードを選ぶとデッキに1枚追加される", () => {
    const run = createRun(PLAYER_ID);
    const [reward] = pickRewardChoices(1);
    const next = advanceRun(run, reward);
    expect(next.deck.length).toBe(run.deck.length + 1);
  });

  it("全対戦相手に勝つとclearedになる", () => {
    let run = createRun(PLAYER_ID);
    const total = run.opponents.length;
    for (let i = 0; i < total; i++) {
      run = advanceRun(run, null);
    }
    expect(run.cleared).toBe(true);
  });

  it("pickRewardChoicesは要求した枚数のカードを返す（全カード種が候補）", () => {
    const choices = pickRewardChoices(3);
    expect(choices.length).toBe(3);
    expect(choices.every((c) => ["attack", "defense", "buff"].includes(c.type))).toBe(true);
  });

  it("トーナメントランは4連戦（1回戦〜決勝）でisTournamentが引き継がれる", () => {
    let run = createTournamentRun("rion");
    expect(run.isTournament).toBe(true);
    expect(run.opponents.length).toBe(TOURNAMENT_ROUND_LABELS.length);
    expect(run.opponents.every((o) => o.id !== "rion")).toBe(true);
    for (let i = 0; i < TOURNAMENT_ROUND_LABELS.length; i++) {
      expect(run.cleared).toBe(false);
      run = advanceRun(run, null);
      expect(run.isTournament).toBe(true); // 進行してもトーナメントフラグは保持
    }
    expect(run.cleared).toBe(true);
  });

  it("createStoryRunは指定したライバル1人だけを相手にする", () => {
    const run = createStoryRun("romako", "uemu");
    expect(run.opponents.length).toBe(1);
    expect(run.opponents[0].id).toBe("uemu");
    // 主人公の必殺カードがデッキに入る
    const signatureId = getCharacter("romako").signatureCardId;
    expect(run.deck.some((c) => c.id === signatureId)).toBe(true);
    // 1戦勝てばクリア
    expect(advanceRun(run, null).cleared).toBe(true);
  });

  it("遭遇データは全キャラクター×全5章にあり、ライバルは実在IDかつ本人ではない", () => {
    for (const c of CHARACTERS) {
      const byChapter = CHAPTER_ENCOUNTERS[c.id];
      expect(byChapter, `missing encounters for ${c.id}`).toBeDefined();
      for (const chapter of [1, 2, 3, 4, 5]) {
        const enc = byChapter[chapter];
        expect(enc, `missing encounter for ${c.id} chapter ${chapter}`).toBeDefined();
        expect(enc.rivalId).not.toBe(c.id);
        expect(() => getCharacter(enc.rivalId)).not.toThrow();
        expect(enc.lines.length).toBeGreaterThanOrEqual(3);
        // 会話の話者もすべて実在キャラクター
        for (const line of enc.lines) {
          expect(() => getCharacter(line.speakerId)).not.toThrow();
        }
      }
    }
  });
});
