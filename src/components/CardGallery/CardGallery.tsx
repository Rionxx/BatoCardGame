import { useMemo, useState } from "react";
import { CARDS, LEGEND_CARD, SIGNATURE_CARDS } from "../../core/data/cards";
import { describeEffect } from "../../core/effectDescriptions";
import { CardArt } from "../CardArt/CardArt";
import { useGameStore } from "../../store/useGameStore";
import type { Card, CardType } from "../../core/engine/types";

const ALL_CARDS: Card[] = [...CARDS, ...SIGNATURE_CARDS, LEGEND_CARD];

const TYPE_LABEL: Record<CardType, string> = {
  attack: "攻撃（罵倒）",
  defense: "防御（受け流し）",
  buff: "強化（バフ）",
};

const FILTERS: Array<{ id: "all" | CardType; label: string }> = [
  { id: "all", label: "すべて" },
  { id: "attack", label: "攻撃" },
  { id: "defense", label: "防御" },
  { id: "buff", label: "強化" },
];

export function CardGallery() {
  const closeGallery = useGameStore((s) => s.closeGallery);
  const [filter, setFilter] = useState<"all" | CardType>("all");

  const cards = useMemo(
    () => (filter === "all" ? ALL_CARDS : ALL_CARDS.filter((c) => c.type === filter)),
    [filter]
  );

  return (
    <div
      className="overlay-bg"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 250,
        padding: 16,
      }}
    >
      <div
        className="overlay-panel"
        style={{
          background: "#fff",
          color: "#111",
          borderRadius: 10,
          padding: 24,
          maxWidth: 900,
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>カードギャラリー（全{ALL_CARDS.length}種）</h2>
          <button onClick={closeGallery} style={{ padding: "6px 14px" }}>
            閉じる
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: filter === f.id ? "2px solid #ffb300" : "1px solid #ccc",
                background: filter === f.id ? "#fff8e1" : "#fafafa",
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {cards.map((card) => (
            <div
              key={card.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 10,
                background: "#fafafa",
              }}
            >
              <CardArt card={card} width={196} height={110} />
              <div style={{ fontWeight: "bold", marginTop: 6, fontSize: 15 }}>{card.name}</div>
              <div style={{ fontSize: 12, color: "#555" }}>
                {TYPE_LABEL[card.type]} / コスト{card.cost}
                {card.attribute && ` / 属性:${card.attribute}`}
              </div>
              <ul style={{ fontSize: 12, margin: "6px 0", paddingLeft: 18 }}>
                {card.effects.map((e, i) => (
                  <li key={i}>{describeEffect(e)}</li>
                ))}
              </ul>
              <div style={{ fontSize: 11, color: "#888", fontStyle: "italic" }}>{card.flavor}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
