import { useGameStore } from "../../store/useGameStore";
import { getCharacter } from "../../core/data/characters";
import { BattleLog, FieldZone, HandCard, MuteButton, useBattleBgm } from "../Battle/Battle";
import { Portrait } from "../Portrait/Portrait";

// 2人対戦（ホットシート）: 1台の端末を交互に使って対戦する。
// engine上は player=プレイヤー1 / cpu=プレイヤー2 として扱う。
export function PvpBattle() {
  const battle = useGameStore((s) => s.battle);
  const stage = useGameStore((s) => s.stage);
  const pvpCurrentSide = useGameStore((s) => s.pvpCurrentSide);
  const pvpHandoff = useGameStore((s) => s.pvpHandoff);
  const onlineMode = useGameStore((s) => s.onlineMode);
  const onlineLocalSide = useGameStore((s) => s.onlineLocalSide);
  const pvpPlayCard = useGameStore((s) => s.pvpPlayCard);
  const pvpEndTurn = useGameStore((s) => s.pvpEndTurn);
  const pvpConfirmHandoff = useGameStore((s) => s.pvpConfirmHandoff);
  const exitPvp = useGameStore((s) => s.exitPvp);
  const p1 = getCharacter(useGameStore((s) => s.playerCharacterId));
  const p2 = getCharacter(useGameStore((s) => s.pvpP2CharacterId));

  useBattleBgm(battle);

  const current = pvpCurrentSide === "player" ? { actor: battle.player, char: p1, label: "プレイヤー1" } : { actor: battle.cpu, char: p2, label: "プレイヤー2" };
  const opposingChar = pvpCurrentSide === "player" ? p2 : p1;
  const isMyTurn = !onlineMode || onlineLocalSide === pvpCurrentSide;

  return (
    <div
      className="battle-root"
      style={{
        fontFamily: "sans-serif",
        background: stage.background,
        color: "#fff",
        minHeight: "100vh",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <header
        className="battle-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}
      >
        <h2 style={{ margin: 0 }}>{onlineMode ? "🌐 オンライン対戦" : "🤝 2人対戦"} - ターン{battle.turn}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ background: "#ffb300", color: "#111", padding: "4px 10px", borderRadius: 6, fontWeight: "bold", fontSize: 13 }}>
            {isMyTurn ? "あなたの番" : "相手の番"}（{current.char.name}）
          </div>
          <div>残りコスト: {battle.costBudget}</div>
          <MuteButton />
          <button
            onClick={() => {
              if (window.confirm("2人対戦を終了してタイトルに戻りますか？")) exitPvp();
            }}
            style={{ padding: "6px 12px" }}
          >
            対戦をやめる
          </button>
        </div>
      </header>

      {/* プレイヤー2（上段） */}
      <FieldZone
        label="プレイヤー2"
        character={p2}
        pride={battle.cpu.pride}
        anger={battle.cpu.anger}
        legendTurns={battle.cpu.legendTurns}
        fieldCard={battle.lastCpuCard}
        align="flex-end"
        weakness={p2.weakness}
        borderColor={stage.border}
        actor={battle.cpu}
      />

      <div
        className="vs-wiggle"
        style={{
          alignSelf: "center",
          border: `2px dashed ${stage.border}`,
          borderRadius: 8,
          padding: "4px 16px",
          fontSize: 12,
          opacity: 0.8,
        }}
      >
        VS
      </div>

      {/* プレイヤー1（下段） */}
      <FieldZone
        label="プレイヤー1"
        character={p1}
        pride={battle.player.pride}
        anger={battle.player.anger}
        legendTurns={battle.player.legendTurns}
        fieldCard={battle.lastPlayerCard}
        align="flex-start"
        weakness={p1.weakness}
        borderColor={stage.border}
        actor={battle.player}
      />

      {/* オンラインでは自分の手番だけ手札を表示し、相手側の非公開情報は描画しない。 */}
      {isMyTurn ? <div>
        <h3 style={{ marginBottom: 8 }}>
          {current.label}の手札（{current.actor.hand.length}枚）{" "}
          <span style={{ fontSize: 12, fontWeight: "normal", opacity: 0.8 }}>
            （黄色い枠＝相手（{opposingChar.name}）の弱点「{opposingChar.weakness}」を突けるカード）
          </span>
        </h3>
        <div className="hand-grid" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {current.actor.hand.map((card, i) => (
            <HandCard
              key={card.id + "-" + i}
              card={card}
              disabled={card.cost > battle.costBudget || !!battle.winner || pvpHandoff || !isMyTurn}
              isWeaknessMatch={card.attribute === opposingChar.weakness}
              onPlay={() => pvpPlayCard(card)}
            />
          ))}
        </div>
        <button
          className="end-turn-btn"
          onClick={pvpEndTurn}
          disabled={!!battle.winner || pvpHandoff || !isMyTurn}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "18px 0",
            fontSize: 20,
            fontWeight: "bold",
            background: battle.winner ? "#555" : "#e0662b",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: battle.winner ? "not-allowed" : "pointer",
          }}
        >
          ターン終了
        </button>
      </div> : (
        <div style={{ padding: 28, textAlign: "center", background: "rgba(0,0,0,0.45)", borderRadius: 10 }}>
          <div style={{ fontSize: 22, fontWeight: "bold" }}>相手の操作を待っています…</div>
          <div style={{ marginTop: 6, opacity: 0.75 }}>手札は相手に公開されません</div>
        </div>
      )}

      <BattleLog log={battle.log} borderColor={stage.border} panelColor={stage.panel} />

      {/* 交代画面: 相手に手札を見られないようにするための目隠し */}
      {!onlineMode && pvpHandoff && !battle.winner && (
        <div
          className="overlay-bg"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            zIndex: 120,
          }}
        >
          <Portrait character={current.char} size={90} />
          <h2 style={{ margin: 0 }}>{current.label}（{current.char.name}）の番です</h2>
          <p style={{ margin: 0, opacity: 0.75, fontSize: 14 }}>端末を{current.label}に渡してください。</p>
          <button
            onClick={pvpConfirmHandoff}
            style={{
              padding: "14px 36px",
              fontSize: 17,
              fontWeight: "bold",
              borderRadius: 8,
              border: "none",
              background: "#e0662b",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            ターンを開始する
          </button>
        </div>
      )}
    </div>
  );
}
