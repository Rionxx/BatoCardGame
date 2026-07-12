import { describe, expect, it } from "vitest";
import { CARDS } from "./cards";
import { EXPANDED_CARDS } from "./expandedCards";

describe("追加カードセット", () => {
  it("重複IDなしで70種類を追加する", () => {
    expect(EXPANDED_CARDS).toHaveLength(70);
    expect(new Set(CARDS.map((card) => card.id)).size).toBe(CARDS.length);
  });

  it("指定されたドロー・手札破棄・コスト妨害の段階をすべて含む", () => {
    const values = (type: string) => CARDS.flatMap((card) => card.effects.filter((effect) => effect.type === type).map((effect) => effect.value));
    expect(values("drawCards")).toEqual(expect.arrayContaining([1, 2, 3, 5]));
    expect(values("discardOpponentHand")).toEqual(expect.arrayContaining([1, 2, 3]));
    expect(CARDS.some((card) => card.effects.some((effect) => effect.type === "discardOpponentAll"))).toBe(true);
    expect(values("costIncreaseNextTurn")).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
  });

  it("攻撃カードの基礎ダメージと弱点ボーナスが新しい上限内に収まる", () => {
    for (const card of CARDS.filter((item) => item.type === "attack")) {
      const base = card.effects.find((effect) => effect.type === "damage")?.value ?? 0;
      const weakness = card.effects.find((effect) => effect.type === "damageIfWeakness")?.value ?? 0;
      expect(base, card.name).toBeLessThanOrEqual(Math.ceil(card.cost * 1.5));
      expect(weakness, card.name).toBeLessThanOrEqual(Math.max(1, Math.ceil(card.cost * 0.4)));
    }
  });
});
