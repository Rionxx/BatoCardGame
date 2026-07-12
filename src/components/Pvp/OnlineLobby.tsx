import { useState } from "react";
import { CHARACTERS } from "../../core/data/characters";
import { useGameStore } from "../../store/useGameStore";
import { Portrait } from "../Portrait/Portrait";

export function OnlineLobby() {
  const [joinCode, setJoinCode] = useState("");
  const status = useGameStore((s) => s.onlineStatus);
  const roomCode = useGameStore((s) => s.onlineRoomCode);
  const side = useGameStore((s) => s.onlineLocalSide);
  const peerConnected = useGameStore((s) => s.onlinePeerConnected);
  const ready = useGameStore((s) => s.onlineReady);
  const peerReady = useGameStore((s) => s.onlinePeerReady);
  const error = useGameStore((s) => s.onlineError);
  const ownCharacterId = useGameStore((s) => side === "cpu" ? s.pvpP2CharacterId : s.playerCharacterId);
  const createRoom = useGameStore((s) => s.createOnlineRoom);
  const joinRoom = useGameStore((s) => s.joinOnlineRoom);
  const chooseCharacter = useGameStore((s) => s.chooseOnlineCharacter);
  const setReady = useGameStore((s) => s.setOnlineReady);
  const close = useGameStore((s) => s.closeOnlineLobby);

  return (
    <div className="overlay-bg" style={{ position: "fixed", inset: 0, zIndex: 220, background: "#10132d", color: "#fff", overflowY: "auto", padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>🌐 オンライン2人対戦</h1>
          <button onClick={close} style={{ padding: "8px 14px" }}>タイトルへ戻る</button>
        </div>

        {!side && (
          <div style={panelStyle}>
            <h2 style={{ marginTop: 0 }}>ルームに接続</h2>
            <button onClick={createRoom} disabled={status === "connecting"} style={primaryStyle}>
              新しいルームを作る
            </button>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                placeholder="6桁のルームコード"
                maxLength={6}
                style={{ flex: 1, padding: 12, fontSize: 18, letterSpacing: 3, textTransform: "uppercase" }}
              />
              <button onClick={() => joinRoom(joinCode)} disabled={status === "connecting"} style={primaryStyle}>参加</button>
            </div>
            {status === "connecting" && <p>対戦サーバーへ接続中...</p>}
          </div>
        )}

        {side && (
          <>
            <div style={panelStyle}>
              <div style={{ fontSize: 13, opacity: 0.75 }}>ルームコード</div>
              <div style={{ fontSize: 36, fontWeight: "bold", letterSpacing: 8, color: "#8ad4ff" }}>{roomCode}</div>
              <p style={{ marginBottom: 0 }}>
                {peerConnected ? "相手が参加しました。キャラクターを選んで準備完了を押してください。" : "このコードを相手に伝えて、参加を待っています…"}
              </p>
            </div>

            <div style={panelStyle}>
              <h2 style={{ marginTop: 0 }}>{side === "player" ? "プレイヤー1" : "プレイヤー2"}のキャラクター</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                {CHARACTERS.map((character) => (
                  <button key={character.id} onClick={() => chooseCharacter(character.id)} style={{ padding: 10, borderRadius: 8, border: ownCharacterId === character.id ? "3px solid #ffb300" : "1px solid #ffffff44", background: ownCharacterId === character.id ? "#fff8e122" : "#ffffff0d", color: "#fff" }}>
                    <Portrait character={character} size={58} />
                    <div style={{ fontSize: 12, marginTop: 4 }}>{character.name}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => setReady(!ready)} disabled={!peerConnected} style={{ ...primaryStyle, width: "100%", marginTop: 16, background: ready ? "#4b5563" : "#e0662b" }}>
                {ready ? "準備完了を取り消す" : "準備完了"}
              </button>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 10 }}>
                <span>あなた: {ready ? "✅ 準備完了" : "選択中"}</span>
                <span>相手: {peerReady ? "✅ 準備完了" : "選択中"}</span>
              </div>
            </div>
          </>
        )}
        {error && <div style={{ ...panelStyle, borderColor: "#ff6b6b", color: "#ffb3b3" }}>{error}</div>}
      </div>
    </div>
  );
}

const panelStyle = { background: "#ffffff12", border: "1px solid #ffffff33", borderRadius: 12, padding: 20 };
const primaryStyle = { padding: "11px 18px", borderRadius: 8, border: "none", background: "#e0662b", color: "#fff", fontWeight: "bold" as const, cursor: "pointer" };
