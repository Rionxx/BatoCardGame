import type { CSSProperties } from "react";
import { useGameStore } from "../../store/useGameStore";

export function PauseMenu() {
  const closePauseMenu = useGameStore((s) => s.closePauseMenu);
  const restart = useGameStore((s) => s.restart);
  const resetAllData = useGameStore((s) => s.resetAllData);
  const openGallery = useGameStore((s) => s.openGallery);
  const openStoryMode = useGameStore((s) => s.openStoryMode);
  const openStats = useGameStore((s) => s.openStats);
  const backToTitle = useGameStore((s) => s.backToTitle);

  return (
    <div
      className="overlay-bg"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
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
          maxWidth: 420,
          width: "100%",
          fontFamily: "sans-serif",
        }}
      >
        <h2 style={{ marginTop: 0 }}>ゲームを中断中</h2>
        <p style={{ fontSize: 13, color: "#555" }}>
          進行状況は自動でこのブラウザに保存されています。
          タブを閉じても、次に開いたときに続きから再開できます。
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={closePauseMenu} style={menuButtonStyle("#e0662b", "#fff")}>
            対戦に戻る
          </button>
          <button onClick={backToTitle} style={menuButtonStyle("#fafafa", "#111")}>
            タイトル画面に戻る
          </button>
          <button onClick={openGallery} style={menuButtonStyle("#fafafa", "#111")}>
            カードギャラリー
          </button>
          <button onClick={openStoryMode} style={menuButtonStyle("#fafafa", "#111")}>
            ストーリーモード
          </button>
          <button onClick={openStats} style={menuButtonStyle("#fafafa", "#111")}>
            対戦データ
          </button>
          <button
            onClick={() => {
              restart();
              closePauseMenu();
            }}
            style={menuButtonStyle("#fafafa", "#111")}
          >
            ランを最初からやり直す（キャラ・難易度はそのまま）
          </button>
          <button
            onClick={() => {
              if (window.confirm("セーブデータを削除して完全に最初からにします。よろしいですか？")) {
                resetAllData();
              }
            }}
            style={menuButtonStyle("#fafafa", "#b3261e")}
          >
            セーブデータを削除して最初から
          </button>
        </div>
      </div>
    </div>
  );
}

function menuButtonStyle(bg: string, color: string): CSSProperties {
  return {
    padding: "14px 16px",
    fontSize: 15,
    fontWeight: "bold",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: bg,
    color,
    cursor: "pointer",
    textAlign: "left",
  };
}
