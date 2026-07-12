import { describe, expect, it } from "vitest";
import { computeCardStats, computeCharacterStats, getMostPlayedCharacter } from "./stats";
import type { MatchRecord } from "./persistence";

function match(overrides: Partial<MatchRecord>): MatchRecord {
  return {
    timestamp: Date.now(),
    playerCharacterId: "rion",
    opponentCharacterId: "romako",
    won: true,
    playerCardIds: ["A01", "A01", "D01"],
    ...overrides,
  };
}

describe("computeCharacterStats", () => {
  it("履歴が空の場合、全キャラクターが0件で返る", () => {
    const stats = computeCharacterStats([]);
    expect(stats.length).toBeGreaterThan(0);
    expect(stats.every((s) => s.gamesPlayed === 0 && s.winRatePct === 0 && s.usageRatePct === 0)).toBe(true);
  });

  it("勝率と使用率を正しく計算する", () => {
    const history = [
      match({ playerCharacterId: "rion", won: true }),
      match({ playerCharacterId: "rion", won: false }),
      match({ playerCharacterId: "romako", won: true }),
    ];
    const stats = computeCharacterStats(history);
    const rion = stats.find((s) => s.id === "rion")!;
    const romako = stats.find((s) => s.id === "romako")!;

    expect(rion.gamesPlayed).toBe(2);
    expect(rion.wins).toBe(1);
    expect(rion.winRatePct).toBeCloseTo(50);
    expect(rion.usageRatePct).toBeCloseTo((2 / 3) * 100);

    expect(romako.gamesPlayed).toBe(1);
    expect(romako.winRatePct).toBeCloseTo(100);
  });

  it("未知のキャラクターIDの記録は無視される（クラッシュしない）", () => {
    const history = [match({ playerCharacterId: "unknown-id" })];
    expect(() => computeCharacterStats(history)).not.toThrow();
  });
});

describe("computeCardStats", () => {
  it("カードの使用回数と使用シェアを正しく集計する", () => {
    const history = [
      match({ playerCardIds: ["A01", "A01", "D01"] }),
      match({ playerCardIds: ["A01"] }),
    ];
    const stats = computeCardStats(history);
    const a01 = stats.find((s) => s.id === "A01")!;
    const d01 = stats.find((s) => s.id === "D01")!;

    expect(a01.timesPlayed).toBe(3);
    expect(d01.timesPlayed).toBe(1);
    expect(a01.usageSharePct).toBeCloseTo((3 / 4) * 100);
  });
});

describe("getMostPlayedCharacter", () => {
  it("履歴が空ならnullを返す", () => {
    expect(getMostPlayedCharacter([])).toBeNull();
  });

  it("最も使用回数が多いキャラクターの名前を返す", () => {
    const history = [
      match({ playerCharacterId: "rion" }),
      match({ playerCharacterId: "rion" }),
      match({ playerCharacterId: "romako" }),
    ];
    expect(getMostPlayedCharacter(history)).toBe("りおん");
  });
});
