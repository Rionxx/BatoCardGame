import { useEffect, useMemo } from "react";
import { useGameStore } from "../../store/useGameStore";
import { getCharacter } from "../../core/data/characters";
import { Portrait } from "../Portrait/Portrait";
import { playDefeat, playVictory } from "../../core/sound";

const CONFETTI_COLORS = ["#ffd54f", "#ff8a65", "#64b5f6", "#5fd07a", "#b980f0", "#ff7096"];

export function Cleared() {
  const restart = useGameStore((s) => s.restart);
  const returnToTitle = useGameStore((s) => s.returnToTitle);
  const total = useGameStore((s) => s.run.opponents.length);
  const isTournament = useGameStore((s) => s.run.isTournament ?? false);
  const playerCharacter = getCharacter(useGameStore((s) => s.playerCharacterId));

  useEffect(() => {
    playVictory();
  }, []);

  // 紙吹雪: 位置・色・速度をマウント時に一度だけ決める
  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        key: i,
        left: Math.random() * 100,
        delay: Math.random() * 2.5,
        duration: 2.5 + Math.random() * 2,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    []
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #4a2a7a 0%, #2a1a4d 55%, #1a1033 100%)",
        color: "#fff",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {confetti.map((c) => (
        <div
          key={c.key}
          className="confetti-piece"
          style={{
            left: `${c.left}%`,
            background: c.color,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
          }}
        />
      ))}

      <div className="portrait-bob">
        <Portrait character={playerCharacter} size={110} />
      </div>
      <h1 className="victory-title" style={{ margin: 0, fontSize: 40, textShadow: "0 2px 16px #ffd54f66" }}>
        {isTournament ? "🏆 トーナメント優勝！" : `🏆 ${total}戦勝ち抜き達成！`}
      </h1>
      <p style={{ margin: 0, opacity: 0.85, fontSize: 16 }}>
        {isTournament
          ? `${playerCharacter.name}、決勝を制して頂点に立った！`
          : `${playerCharacter.name}、完全勝利。お疲れさまでした！`}
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button
          onClick={restart}
          style={{
            padding: "14px 28px",
            fontSize: 17,
            fontWeight: "bold",
            borderRadius: 8,
            border: "none",
            background: "#e0662b",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          もう一度挑戦する
        </button>
        <button
          onClick={returnToTitle}
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

export function Defeated() {
  const restart = useGameStore((s) => s.restart);
  const returnToTitle = useGameStore((s) => s.returnToTitle);
  const playerCharacter = getCharacter(useGameStore((s) => s.playerCharacterId));

  useEffect(() => {
    playDefeat();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #3d1a1a 0%, #241010 60%, #150a0a 100%)",
        color: "#fff",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <div style={{ filter: "grayscale(0.6)", opacity: 0.85 }}>
        <Portrait character={playerCharacter} size={100} />
      </div>
      <h1 style={{ margin: 0, fontSize: 32 }}>敗北……誇りが尽きてしまった。</h1>
      <p style={{ margin: 0, opacity: 0.75, fontSize: 15 }}>次はきっと言い返せる。</p>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button
          onClick={restart}
          style={{
            padding: "14px 28px",
            fontSize: 17,
            fontWeight: "bold",
            borderRadius: 8,
            border: "none",
            background: "#e0662b",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          最初からやり直す
        </button>
        <button
          onClick={returnToTitle}
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
