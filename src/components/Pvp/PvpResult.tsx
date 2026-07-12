import { useEffect } from "react";
import { useGameStore } from "../../store/useGameStore";
import { getCharacter } from "../../core/data/characters";
import { Portrait } from "../Portrait/Portrait";
import { playVictory } from "../../core/sound";

export function PvpResult() {
  const battle = useGameStore((s) => s.battle);
  const pvpRematch = useGameStore((s) => s.pvpRematch);
  const exitPvp = useGameStore((s) => s.exitPvp);
  const p1 = getCharacter(useGameStore((s) => s.playerCharacterId));
  const p2 = getCharacter(useGameStore((s) => s.pvpP2CharacterId));
  const onlineMode = useGameStore((s) => s.onlineMode);
  const onlineLocalSide = useGameStore((s) => s.onlineLocalSide);

  const winnerIsP1 = battle.winner === "player";
  const winner = winnerIsP1 ? { label: "プレイヤー1", char: p1 } : { label: "プレイヤー2", char: p2 };

  useEffect(() => {
    playVictory();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1a3a5f 0%, #10243d 55%, #0a1828 100%)",
        color: "#fff",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 16,
      }}
    >
      <div className="portrait-bob">
        <Portrait character={winner.char} size={110} />
      </div>
      <h1 className="victory-title" style={{ margin: 0, fontSize: 36, textAlign: "center" }}>
        🤝 {winner.label}（{winner.char.name}）の勝利！
      </h1>
      <p style={{ margin: 0, opacity: 0.8 }}>
        {p1.name}（P1） vs {p2.name}（P2） - ターン{battle.turn}で決着
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={pvpRematch}
          disabled={onlineMode && onlineLocalSide === "cpu"}
          style={{
            padding: "14px 28px",
            fontSize: 17,
            fontWeight: "bold",
            borderRadius: 8,
            border: "none",
            background: "#e0662b",
            color: "#fff",
            cursor: onlineMode && onlineLocalSide === "cpu" ? "not-allowed" : "pointer",
            opacity: onlineMode && onlineLocalSide === "cpu" ? 0.55 : 1,
          }}
        >
          {onlineMode && onlineLocalSide === "cpu" ? "ホストの再戦操作を待つ" : "同じメンバーで再戦"}
        </button>
        <button
          onClick={exitPvp}
          style={{
            padding: "14px 28px",
            fontSize: 15,
            borderRadius: 8,
            border: "1px solid #ffffff55",
            background: "#ffffff15",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          タイトルに戻る
        </button>
      </div>
    </div>
  );
}
