import { DIFFICULTIES } from "../../core/data/difficulties";
import { RUN_LENGTH_OPTIONS } from "../../core/run/runProgress";
import { useGameStore } from "../../store/useGameStore";

export function DifficultySelect() {
  const difficultyId = useGameStore((s) => s.difficultyId);
  const chooseDifficulty = useGameStore((s) => s.chooseDifficulty);
  const runLength = useGameStore((s) => s.runLength);
  const setRunLength = useGameStore((s) => s.setRunLength);
  const tournamentPending = useGameStore((s) => s.tournamentPending);
  const closeDifficultySelect = useGameStore((s) => s.closeDifficultySelect);

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
          maxWidth: 560,
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0 }}>{tournamentPending ? "🏆 トーナメント設定" : "対戦設定を選ぼう"}</h2>
          <button onClick={closeDifficultySelect} style={{ padding: "7px 14px" }}>閉じる</button>
        </div>
        <p style={{ fontSize: 13, color: "#555" }}>
          {tournamentPending
            ? "トーナメントは 1回戦 → 2回戦 → 準決勝 → 決勝 の4連戦です。レベルを選ぶと開幕します。"
            : "レベルを選ぶとランが最初から始まります。途中で変更した場合もランはやり直しになります。"}
        </p>

        {!tournamentPending && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: "bold", marginBottom: 6 }}>対戦人数（勝ち抜き数）</div>
            <div style={{ display: "flex", gap: 8 }}>
              {RUN_LENGTH_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setRunLength(n)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    fontSize: 15,
                    fontWeight: "bold",
                    borderRadius: 8,
                    border: runLength === n ? "3px solid #ffb300" : "1px solid #ccc",
                    background: runLength === n ? "#fff8e1" : "#fafafa",
                    cursor: "pointer",
                  }}
                >
                  {n}人
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ fontWeight: "bold", marginBottom: 6 }}>相手のレベル</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              onClick={() => chooseDifficulty(d.id)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 8,
                border: difficultyId === d.id ? "3px solid #ffb300" : "1px solid #ccc",
                background: difficultyId === d.id ? "#fff8e1" : "#fafafa",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold", fontSize: 16 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{d.description}</div>
              </div>
              <div style={{ fontSize: 12, color: "#888", whiteSpace: "nowrap" }}>
                自分の誇り{d.playerPride} / 相手の誇り{d.cpuPride}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
