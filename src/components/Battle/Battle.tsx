import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import { CardArt } from "../CardArt/CardArt";
import { Portrait } from "../Portrait/Portrait";
import { getCharacter, type CharacterDef } from "../../core/data/characters";
import { getDifficulty } from "../../core/data/difficulties";
import { TOURNAMENT_ROUND_LABELS } from "../../core/run/runProgress";
import {
  isMuted,
  playLegendActivate,
  setBgmMode,
  startBgm,
  stopBgm,
  toggleMuted,
} from "../../core/sound";
import type { Actor, Attribute, Card, GameState } from "../../core/engine/types";
import { describeEffect } from "../../core/effectDescriptions";

/** 対戦中のBGM管理（レジェンド覚醒中は曲調が切り替わる。リセットはしない）。
 *  ソロ戦(Battle)と2人対戦(PvpBattle)の両方から使う。 */
export function useBattleBgm(battle: GameState): void {
  const anyLegend = battle.player.legendTurns > 0 || battle.cpu.legendTurns > 0;
  const prevAnyLegend = useRef(false);
  useEffect(() => {
    startBgm();
    return () => {
      stopBgm();
      setBgmMode("normal");
    };
  }, []);
  useEffect(() => {
    setBgmMode(anyLegend ? "legend" : "normal");
    // どちらかが新たに覚醒した瞬間だけスティングを鳴らす。
    // すでに覚醒中に追加で発動してもBGMは切り替わらない（リセットなし）。
    if (anyLegend && !prevAnyLegend.current) playLegendActivate();
    prevAnyLegend.current = anyLegend;
  }, [anyLegend]);
}

/** ミュートトグルボタン（共用） */
export function MuteButton() {
  const [mutedState, setMutedState] = useState(isMuted());
  return (
    <button
      onClick={() => setMutedState(toggleMuted())}
      title={mutedState ? "音を出す" : "ミュートする"}
      style={{ padding: "6px 12px" }}
    >
      {mutedState ? "🔇" : "🔊"}
    </button>
  );
}

export function Battle() {
  const battle = useGameStore((s) => s.battle);
  const run = useGameStore((s) => s.run);
  const stage = useGameStore((s) => s.stage);
  const playCardFromHand = useGameStore((s) => s.playCardFromHand);
  const endTurn = useGameStore((s) => s.endTurn);
  const openTutorial = useGameStore((s) => s.openTutorial);
  const openCharacterSelect = useGameStore((s) => s.openCharacterSelect);
  const openDifficultySelect = useGameStore((s) => s.openDifficultySelect);
  const openPauseMenu = useGameStore((s) => s.openPauseMenu);
  const backToTitle = useGameStore((s) => s.backToTitle);
  const playerCharacterId = useGameStore((s) => s.playerCharacterId);
  const difficultyId = useGameStore((s) => s.difficultyId);

  const opponent = run.opponents[run.round];
  const playerCharacter = getCharacter(playerCharacterId);
  const difficulty = getDifficulty(difficultyId);

  useBattleBgm(battle);

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
        <h2 style={{ margin: 0 }}>
          {run.isTournament
            ? `🏆 ${TOURNAMENT_ROUND_LABELS[run.round] ?? "決勝"} - ターン${battle.turn}`
            : `対戦ステージ - ターン${battle.turn}（${run.round + 1}戦目 / ${run.opponents.length}）`}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>残りコスト: {battle.costBudget}</div>
          <div style={{ background: "#ffffff22", padding: "4px 10px", borderRadius: 6, fontSize: 13 }}>
            ステージ: {stage.name}
          </div>
          <div style={{ background: "#ffffff22", padding: "4px 10px", borderRadius: 6, fontSize: 13 }}>
            難易度: {difficulty.name}
          </div>
          <MuteButton />
          <button
            onClick={() => {
              if (window.confirm("対戦を中断してタイトル画面に戻りますか？進行状況は保存されます。")) backToTitle();
            }}
            style={{ padding: "6px 12px" }}
          >
            タイトルに戻る
          </button>
          <button
            onClick={openPauseMenu}
            style={{ padding: "6px 12px", background: "#ffb300", border: "none", borderRadius: 4, fontWeight: "bold" }}
          >
            中断
          </button>
          <button onClick={openDifficultySelect} style={{ padding: "6px 12px" }}>
            レベル変更
          </button>
          <button onClick={openCharacterSelect} style={{ padding: "6px 12px" }}>
            アバターを変更
          </button>
          <button onClick={openTutorial} style={{ padding: "6px 12px" }}>
            ルールを見る
          </button>
        </div>
      </header>

      {/* 相手側フィールド */}
      <FieldZone
        label={`相手（性格: ${opponent.personality}）`}
        character={opponent}
        pride={battle.cpu.pride}
        anger={battle.cpu.anger}
        legendTurns={battle.cpu.legendTurns}
        fieldCard={battle.lastCpuCard}
        align="flex-end"
        weakness={opponent.weakness}
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

      {/* 自分側フィールド */}
      <FieldZone
        label="あなた"
        character={playerCharacter}
        pride={battle.player.pride}
        anger={battle.player.anger}
        legendTurns={battle.player.legendTurns}
        fieldCard={battle.lastPlayerCard}
        align="flex-start"
        borderColor={stage.border}
        actor={battle.player}
      />

      {/* 手札 */}
      <div>
        <h3 style={{ marginBottom: 8 }}>
          手札（{battle.player.hand.length}枚）{" "}
          <span style={{ fontSize: 12, fontWeight: "normal", opacity: 0.8 }}>
            （黄色い枠＝相手の弱点「{opponent.weakness}」を突けるカード）
          </span>
        </h3>
        <div className="hand-grid" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {battle.player.hand.map((card, i) => (
            <HandCard
              key={card.id + "-" + i}
              card={card}
              disabled={card.cost > battle.costBudget || !!battle.winner}
              isWeaknessMatch={card.attribute === opponent.weakness}
              onPlay={() => playCardFromHand(card)}
            />
          ))}
        </div>
        <button
          className="end-turn-btn"
          onClick={endTurn}
          disabled={!!battle.winner}
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
      </div>

      {/* 対戦ログ: 相手が何を使ったかを含む行動履歴 */}
      <BattleLog log={battle.log} borderColor={stage.border} panelColor={stage.panel} />
    </div>
  );
}

export function FieldZone({
  label,
  character,
  pride,
  anger,
  legendTurns = 0,
  fieldCard,
  align,
  weakness,
  borderColor,
  actor,
}: {
  label: string;
  character: CharacterDef;
  pride: number;
  anger: number;
  legendTurns?: number;
  fieldCard: Card | null;
  align: "flex-start" | "flex-end";
  weakness?: Attribute;
  borderColor: string;
  actor: Actor;
}) {
  return (
    <div
      className="field-zone"
      style={{
        border: legendTurns > 0 ? "2px solid #ffd54f" : `2px solid ${borderColor}`,
        boxShadow: legendTurns > 0 ? "0 0 14px #ffd54f66" : "none",
        borderRadius: 10,
        padding: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        background: "#00000022",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div className="portrait-bob">
          <Portrait character={character} size={64} />
        </div>
        <div>
          <div style={{ fontWeight: "bold" }}>{label}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{character.name}</div>
          <div style={{ fontSize: 12, marginTop: 2 }}>
            🃏 手札: <strong>{actor.hiddenHandCount ?? actor.hand.length}枚</strong>
          </div>
          {/* keyに値を含めることで、変化した瞬間にstatPopアニメーションが再生される */}
          <div>
            誇り: <span key={`pride-${pride}`} className="stat-pop">{pride}</span>
          </div>
          <div>
            怒り: <span key={`anger-${anger}`} className="stat-pop">{anger}</span>
          </div>
          {weakness && (
            <div
              style={{
                marginTop: 4,
                display: "inline-block",
                background: "#ffd54f",
                color: "#5c3d00",
                fontWeight: "bold",
                fontSize: 12,
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              弱点属性: {weakness}
            </div>
          )}
          {legendTurns > 0 && (
            <div
              className="weakness-pulse"
              style={{
                marginTop: 4,
                marginLeft: 4,
                display: "inline-block",
                background: "linear-gradient(90deg, #ffd54f, #ff8a65)",
                color: "#3d1a00",
                fontWeight: "bold",
                fontSize: 12,
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              ⚡ レジェンド覚醒 残り{legendTurns}ターン
            </div>
          )}
          <StatusBadges actor={actor} />
        </div>
      </div>
      <div className="field-played" style={{ display: "flex", flexDirection: "column", alignItems: align, gap: 4 }}>
        <span style={{ fontSize: 11, opacity: 0.7 }}>
          {fieldCard ? "直前に場に出したカード" : "まだカードを場に出していません"}
        </span>
        {fieldCard ? (
          <div key={fieldCard.id} className="field-card-pop" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <CardArt card={fieldCard} width={120} height={80} />
            <span style={{ fontSize: 14 }}>{fieldCard.name}</span>
          </div>
        ) : (
          <div
            className="field-placeholder"
            style={{
              width: 120,
              height: 80,
              border: "1px dashed #ffffff55",
              borderRadius: 6,
            }}
          />
        )}
      </div>
    </div>
  );
}

function StatusBadges({ actor }: { actor: Actor }) {
  const badges: Array<{ label: string; tone: "good" | "bad" }> = [];
  if (actor.blockNext > 0) badges.push({ label: `🛡 被ダメージ -${actor.blockNext}`, tone: "good" });
  if (actor.negateNextAttack) badges.push({ label: "🛡 次の攻撃を1回無効", tone: "good" });
  if (actor.costReductionNextAttack > 0) badges.push({ label: `⚡ 次の攻撃コスト -${actor.costReductionNextAttack}`, tone: "good" });
  if (actor.costRecoveryPenaltyNextTurn < 0) badges.push({ label: `⏳ 次ターンのコスト ${actor.costRecoveryPenaltyNextTurn}`, tone: "bad" });
  if (actor.defenseDisabledNextTurn) badges.push({ label: "⚠ 次の防御カードが不発", tone: "bad" });
  if (actor.angerGainReduction > 0) badges.push({ label: `😶 次の怒り獲得 -${actor.angerGainReduction}`, tone: "bad" });

  return (
    <div className="status-badges" style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
      {badges.length === 0 ? (
        <span style={{ fontSize: 11, opacity: 0.55 }}>状態効果なし</span>
      ) : badges.map((badge, index) => (
        <span key={`${badge.label}-${index}`} style={{
          fontSize: 11,
          fontWeight: "bold",
          padding: "3px 7px",
          borderRadius: 10,
          background: badge.tone === "good" ? "#d7f6df" : "#ffe0dc",
          color: badge.tone === "good" ? "#185c2b" : "#8a241d",
          border: `1px solid ${badge.tone === "good" ? "#6fc184" : "#ee8c82"}`,
        }}>{badge.label}</span>
      ))}
    </div>
  );
}

export function HandCard({
  card,
  disabled,
  isWeaknessMatch,
  onPlay,
}: {
  card: Card;
  disabled: boolean;
  isWeaknessMatch: boolean;
  onPlay: () => void;
}) {
  const isLegend = card.effects.some((e) => e.type === "legendAwaken");
  return (
    <button
      className={`hand-card${isWeaknessMatch || isLegend ? " weakness-pulse" : ""}`}
      onClick={onPlay}
      disabled={disabled}
      style={{
        width: 230,
        textAlign: "left",
        padding: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        background: isLegend ? "linear-gradient(180deg, #fff8e1, #ffffff)" : "#fff",
        color: "#111",
        border: isLegend ? "4px solid #ff8a3d" : isWeaknessMatch ? "4px solid #ffb300" : "1px solid #333",
        borderRadius: 8,
        position: "relative",
      }}
    >
      {(isWeaknessMatch || isLegend) && (
        <span
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            background: isLegend ? "#ff8a3d" : "#ffb300",
            color: "#111",
            fontSize: 13,
            fontWeight: "bold",
            padding: "3px 9px",
            borderRadius: 12,
          }}
        >
          {isLegend ? "⚡ LEGEND" : "弱点！"}
        </span>
      )}
      <CardArt card={card} width={206} height={120} />
      <div style={{ fontWeight: "bold", marginTop: 8, fontSize: 17 }}>
        {card.name}（コスト{card.cost}）
      </div>
      {card.attribute && <div style={{ fontSize: 14 }}>属性: {card.attribute}</div>}
      <div
        className="hand-card-effects"
        style={{
          marginTop: 7,
          padding: "7px 8px",
          borderRadius: 6,
          background: "#eef3f8",
          borderLeft: "4px solid #365f85",
          fontSize: 12,
          lineHeight: 1.45,
          color: "#17212b",
        }}
      >
        <div style={{ fontWeight: "bold", color: "#365f85", marginBottom: 2 }}>効果</div>
        {card.effects.map((effect, index) => (
          <div key={`${effect.type}-${index}`}>・{describeEffect(effect)}</div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "#666", fontStyle: "italic", marginTop: 5 }}>{card.flavor}</div>
    </button>
  );
}

export function BattleLog({
  log,
  borderColor,
  panelColor,
}: {
  log: string[];
  borderColor: string;
  panelColor: string;
}) {
  return (
    <div
      className="battle-log"
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        padding: 8,
        maxHeight: 140,
        overflowY: "auto",
        fontSize: 12,
        background: panelColor,
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 4 }}>対戦ログ（相手の使用カードも表示）</div>
      {log.length === 0 && <div style={{ opacity: 0.6 }}>まだログはありません。</div>}
      {[...log].reverse().map((entry, i) => (
        // keyを元配列のインデックスに固定し、新しい行だけがアニメーションするようにする
        <div key={log.length - 1 - i} className="log-entry">
          {entry}
        </div>
      ))}
    </div>
  );
}
