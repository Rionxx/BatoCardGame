import { writeFile } from "node:fs/promises";
import { CARDS, LEGEND_CARD, SIGNATURE_CARDS } from "../src/core/data/cards";
import { describeEffect } from "../src/core/effectDescriptions";
import type { CardType } from "../src/core/engine/types";

const TYPE_LABEL: Record<CardType, string> = {
  attack: "攻撃",
  defense: "防御",
  buff: "強化",
};

const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
const cards = [...CARDS, ...SIGNATURE_CARDS, LEGEND_CARD];
const rows = cards.map((card) => [
  card.name,
  card.effects.map(describeEffect).join("。"),
  card.attribute ?? "なし",
  TYPE_LABEL[card.type],
]);

const csv = [
  ["カード名", "効果", "属性", "タイプ"],
  ...rows,
].map((row) => row.map(quote).join(",")).join("\n") + "\n";

await writeFile(new URL("../data/cards_draft.csv", import.meta.url), csv, "utf8");
console.log(`${cards.length}種類のカードを data/cards_draft.csv に出力しました。`);
