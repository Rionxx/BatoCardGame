import { useState } from "react";
import { CHARACTERS, getCharacter, type CharacterDef } from "../../core/data/characters";
import { getChapterEncounter, getStoryChapters } from "../../core/data/stories";
import { Portrait } from "../Portrait/Portrait";
import { useGameStore } from "../../store/useGameStore";

type View = { kind: "characterList" } | { kind: "chapterList"; character: CharacterDef } | { kind: "reader"; character: CharacterDef; chapter: number };

export function StoryMode() {
  const closeStoryMode = useGameStore((s) => s.closeStoryMode);
  const resume = useGameStore((s) => s.storyResume);
  const [view, setView] = useState<View>(() => resume
    ? { kind: "reader", character: getCharacter(resume.protagonistId), chapter: resume.chapter }
    : { kind: "characterList" });

  return (
    <div
      className="overlay-bg"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 250,
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
          maxWidth: 700,
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>ストーリーモード</h2>
          <button onClick={closeStoryMode} style={{ padding: "6px 14px" }}>
            閉じる
          </button>
        </div>

        {view.kind === "characterList" && (
          <CharacterList onSelect={(character) => setView({ kind: "chapterList", character })} />
        )}
        {view.kind === "chapterList" && (
          <ChapterList
            character={view.character}
            onBack={() => setView({ kind: "characterList" })}
            onSelectChapter={(chapter) => setView({ kind: "reader", character: view.character, chapter })}
          />
        )}
        {view.kind === "reader" && (
          <Reader
            character={view.character}
            chapter={view.chapter}
            onBack={() => setView({ kind: "chapterList", character: view.character })}
            onChangeChapter={(chapter) => setView({ kind: "reader", character: view.character, chapter })}
          />
        )}
      </div>
    </div>
  );
}

function CharacterList({ onSelect }: { onSelect: (c: CharacterDef) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
      {CHARACTERS.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#fafafa",
            cursor: "pointer",
          }}
        >
          <Portrait character={c} size={64} />
          <span style={{ fontSize: 13, fontWeight: "bold" }}>{c.name}</span>
        </button>
      ))}
    </div>
  );
}

function ChapterList({
  character,
  onBack,
  onSelectChapter,
}: {
  character: CharacterDef;
  onBack: () => void;
  onSelectChapter: (chapter: number) => void;
}) {
  const chapters = getStoryChapters(character.id);
  return (
    <div>
      <BackAndTitle onBack={onBack} character={character} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {chapters.map((ch) => (
          <button
            key={ch.chapter}
            onClick={() => onSelectChapter(ch.chapter)}
            style={{
              textAlign: "left",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "#fafafa",
              cursor: "pointer",
            }}
          >
            <span style={{ fontWeight: "bold" }}>
              第{ch.chapter}章　{ch.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Reader({
  character,
  chapter,
  onBack,
  onChangeChapter,
}: {
  character: CharacterDef;
  chapter: number;
  onBack: () => void;
  onChangeChapter: (chapter: number) => void;
}) {
  const startStoryBattle = useGameStore((s) => s.startStoryBattle);
  const chapters = getStoryChapters(character.id);
  const current = chapters.find((c) => c.chapter === chapter);
  const encounter = getChapterEncounter(character.id, chapter);
  if (!current) return null;

  return (
    <div>
      <BackAndTitle onBack={onBack} character={character} />
      <h3 style={{ marginTop: 0 }}>
        第{current.chapter}章　{current.title}
      </h3>
      <div style={{ fontSize: 15, lineHeight: 1.9 }}>
        {current.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {encounter && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 10,
            background: "#f4f2ee",
            border: "1px solid #e0ddd5",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: "bold", color: "#8a5a2e", marginBottom: 10 }}>
            ― この章の遭遇 ―
          </div>
          {encounter.lines.map((l, i) => {
            const speaker = getCharacter(l.speakerId);
            return (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <Portrait character={speaker} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: "bold", color: "#555" }}>{speaker.name}</div>
                  <div
                    style={{
                      background: l.speakerId === character.id ? "#fff8e1" : "#ffffff",
                      border: "1px solid #e5e2da",
                      borderRadius: 8,
                      padding: "8px 12px",
                      fontSize: 14,
                      marginTop: 2,
                    }}
                  >
                    {l.line}
                  </div>
                </div>
              </div>
            );
          })}
          <button
            onClick={() => startStoryBattle(character.id, encounter.rivalId, chapter)}
            style={{
              marginTop: 6,
              width: "100%",
              padding: "12px 0",
              fontSize: 15,
              fontWeight: "bold",
              borderRadius: 8,
              border: "none",
              background: "#e0662b",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {character.name}を操作して {getCharacter(encounter.rivalId).name} とストーリー対戦する
          </button>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <button
          onClick={() => onChangeChapter(chapter - 1)}
          disabled={chapter <= 1}
          style={{ padding: "8px 16px", visibility: chapter <= 1 ? "hidden" : "visible" }}
        >
          ← 前の章
        </button>
        <button
          onClick={() => onChangeChapter(chapter + 1)}
          disabled={chapter >= chapters.length}
          style={{ padding: "8px 16px", visibility: chapter >= chapters.length ? "hidden" : "visible" }}
        >
          次の章 →
        </button>
      </div>
    </div>
  );
}

function BackAndTitle({ onBack, character }: { onBack: () => void; character: CharacterDef }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <button onClick={onBack} style={{ padding: "6px 12px" }}>
        戻る
      </button>
      <Portrait character={character} size={36} />
      <span style={{ fontWeight: "bold" }}>{character.name}</span>
    </div>
  );
}
