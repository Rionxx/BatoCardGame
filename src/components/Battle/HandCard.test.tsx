import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CARDS } from "../../core/data/cards";
import { CardArt } from "../CardArt/CardArt";
import { HandCard } from "./Battle";
import { FieldZone } from "./Battle";
import { getCharacter } from "../../core/data/characters";
import { createActor } from "../../core/engine/state";

function card(id: string) {
  const found = CARDS.find((item) => item.id === id);
  if (!found) throw new Error(`test card not found: ${id}`);
  return found;
}

describe("手札カード表示", () => {
  it("カードの全効果を手札内に表示する", () => {
    const html = renderToStaticMarkup(
      <HandCard card={card("A02")} disabled={false} isWeaknessMatch={false} onPlay={() => undefined} />,
    );
    expect(html).toContain("効果");
    expect(html).toContain("誇りを3減らす");
    expect(html).toContain("コストを1軽減する");
  });

  it("追加カードはカード名に応じて異なるSVGデザインになる", () => {
    const designs = ["A16", "A17", "A18"].map((id) => renderToStaticMarkup(<CardArt card={card(id)} />));
    expect(new Set(designs).size).toBe(designs.length);
  });

  it("フィールドに手札枚数と現在の軽減状態を表示する", () => {
    const actor = createActor([card("A01"), card("A02")]);
    actor.hand = [card("A01"), card("A02")];
    actor.blockNext = 3;
    const html = renderToStaticMarkup(
      <FieldZone
        label="相手"
        character={getCharacter("romako")}
        pride={40}
        anger={0}
        fieldCard={null}
        align="flex-end"
        borderColor="#fff"
        actor={actor}
      />,
    );
    expect(html).toContain("手札:");
    expect(html).toContain("2枚");
    expect(html).toContain("被ダメージ -3");
  });
});
