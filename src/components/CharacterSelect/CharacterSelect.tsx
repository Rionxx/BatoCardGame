import { CHARACTERS } from "../../core/data/characters";
import { getSignatureCard } from "../../core/data/cards";
import { Portrait } from "../Portrait/Portrait";
import { useGameStore } from "../../store/useGameStore";

export function CharacterSelect() {
  const playerCharacterId = useGameStore((s) => s.playerCharacterId);
  const chooseCharacter = useGameStore((s) => s.chooseCharacter);
  const pvpSetupStage = useGameStore((s) => s.pvpSetupStage);
  const closeCharacterSelect = useGameStore((s) => s.closeCharacterSelect);

  const heading =
    pvpSetupStage === "p1"
      ? "プレイヤー1のキャラクターを選ぼう"
      : pvpSetupStage === "p2"
        ? "プレイヤー2のキャラクターを選ぼう"
        : "あなたのキャラクターを選ぼう";
  const subText =
    pvpSetupStage !== null
      ? "キャラクターごとに固有の必殺カードがデッキに1枚入ります。2人分選ぶとすぐに対戦が始まります。"
      : "キャラクターごとに固有の必殺カードがデッキに1枚入ります。選んだ後、相手のレベルを選びます。";

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
          maxWidth: 720,
          maxHeight: "85vh",
          overflowY: "auto",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0 }}>{heading}</h2>
          <button onClick={closeCharacterSelect} style={{ padding: "7px 14px" }}>閉じる</button>
        </div>
        <p style={{ fontSize: 13, color: "#555" }}>{subText}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {CHARACTERS.map((c) => {
            const signature = getSignatureCard(c.signatureCardId);
            return (
              <button
                key={c.id}
                onClick={() => chooseCharacter(c.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: 12,
                  borderRadius: 8,
                  border: playerCharacterId === c.id ? "3px solid #ffb300" : "1px solid #ccc",
                  background: playerCharacterId === c.id ? "#fff8e1" : "#fafafa",
                  cursor: "pointer",
                }}
              >
                <Portrait character={c} size={72} />
                <span style={{ fontSize: 14, fontWeight: "bold", textAlign: "center" }}>{c.name}</span>
                <span style={{ fontSize: 11, color: "#a05a00", textAlign: "center" }}>
                  必殺: {signature.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
