import { useGameStore } from "../../store/useGameStore";
import { CHARACTERS } from "../../core/data/characters";
import { Portrait } from "../Portrait/Portrait";

export function TitleScreen() {
  const hasSaveOnLoad = useGameStore((s) => s.hasSaveOnLoad);
  const closeTitle = useGameStore((s) => s.closeTitle);
  const startNewGameFromTitle = useGameStore((s) => s.startNewGameFromTitle);
  const startTournamentSetup = useGameStore((s) => s.startTournamentSetup);
  const openOnlineLobby = useGameStore((s) => s.openOnlineLobby);
  const openGallery = useGameStore((s) => s.openGallery);
  const openStoryMode = useGameStore((s) => s.openStoryMode);
  const openStats = useGameStore((s) => s.openStats);

  return (
    <div
      className="overlay-bg"
      style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(180deg, #1a1a3d 0%, #12122e 55%, #0d0d24 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 16,
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", justifyContent: "center" }}>
        {CHARACTERS.slice(0, 7).map((c) => (
          <div key={c.id} className="portrait-bob" style={{ animationDelay: `${Math.random() * 2}s` }}>
            <Portrait character={c} size={56} />
          </div>
        ))}
      </div>

      <h1 style={{ fontSize: 36, margin: 0, textAlign: "center", textShadow: "0 2px 12px #00000088" }}>
        罵倒デュエルカードバトル
      </h1>
      <p style={{ opacity: 0.8, marginTop: 4, marginBottom: 40 }}>〜言葉で挑む、カードバトル〜</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 280 }}>
        {hasSaveOnLoad && (
          <button onClick={closeTitle} style={primaryButtonStyle()}>
            つづきから
          </button>
        )}
        <button onClick={startNewGameFromTitle} style={hasSaveOnLoad ? secondaryButtonStyle() : primaryButtonStyle()}>
          {hasSaveOnLoad ? "はじめから（セーブ削除）" : "はじめる"}
        </button>
        <button
          onClick={startTournamentSetup}
          style={{ ...secondaryButtonStyle(), border: "1px solid #ffd54f88", color: "#ffd54f" }}
        >
          🏆 トーナメント（1回戦〜決勝）
        </button>
        <button
          onClick={openOnlineLobby}
          style={{ ...secondaryButtonStyle(), border: "1px solid #8ad4ff88", color: "#8ad4ff" }}
        >
          🌐 2人対戦（オンライン）
        </button>
        <button onClick={openGallery} style={secondaryButtonStyle()}>
          カードギャラリー
        </button>
        <button onClick={openStoryMode} style={secondaryButtonStyle()}>
          ストーリーモード
        </button>
        <button onClick={openStats} style={secondaryButtonStyle()}>
          対戦データ
        </button>
      </div>
    </div>
  );
}

function primaryButtonStyle() {
  return {
    padding: "14px 0",
    fontSize: 17,
    fontWeight: "bold" as const,
    borderRadius: 8,
    border: "none",
    background: "#e0662b",
    color: "#fff",
    cursor: "pointer",
  };
}

function secondaryButtonStyle() {
  return {
    padding: "12px 0",
    fontSize: 15,
    borderRadius: 8,
    border: "1px solid #ffffff55",
    background: "#ffffff15",
    color: "#fff",
    cursor: "pointer",
  };
}
