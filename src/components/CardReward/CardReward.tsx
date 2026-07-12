import { useGameStore } from "../../store/useGameStore";
import { TOURNAMENT_ROUND_LABELS } from "../../core/run/runProgress";
import { CardArt } from "../CardArt/CardArt";

export function CardReward() {
  const rewardChoices = useGameStore((s) => s.rewardChoices);
  const chooseReward = useGameStore((s) => s.chooseReward);
  const run = useGameStore((s) => s.run);

  // トーナメントなら「1回戦突破！」のように直前に勝ったラウンド名を出す
  const heading = run.isTournament
    ? `🏆 ${TOURNAMENT_ROUND_LABELS[run.round] ?? "1回戦"}突破！`
    : `${run.round + 1}戦目に勝利！`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1c4a2e 0%, #14331f 55%, #0a2416 100%)",
        color: "#fff",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 8,
      }}
    >
      <h2 className="victory-title" style={{ margin: 0, textShadow: "0 2px 12px #00000066" }}>
        {heading}
      </h2>
      <p style={{ margin: "0 0 16px", opacity: 0.85 }}>
        カードを1枚選んでデッキに加えよう{run.isTournament ? "（次の相手はさらに手強い）" : ""}
      </p>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        {rewardChoices.map((card) => (
          <button
            key={card.id}
            className="hand-card"
            onClick={() => chooseReward(card)}
            style={{
              width: 230,
              padding: 12,
              textAlign: "left",
              background: "#fff",
              color: "#111",
              border: "1px solid #333",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <CardArt card={card} width={206} height={120} />
            <div style={{ fontWeight: "bold", marginTop: 8, fontSize: 17 }}>{card.name}</div>
            <div style={{ fontSize: 14 }}>
              コスト{card.cost}
              {card.attribute && ` / ${card.attribute}`}
            </div>
            <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{card.flavor}</div>
          </button>
        ))}
      </div>
      <button
        onClick={() => chooseReward(null)}
        style={{
          marginTop: 20,
          padding: "10px 24px",
          borderRadius: 8,
          border: "1px solid #ffffff55",
          background: "#ffffff15",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        何も選ばずに進む
      </button>
    </div>
  );
}
