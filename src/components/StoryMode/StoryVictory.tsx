import { getCharacter } from "../../core/data/characters";
import { getStoryChapters } from "../../core/data/stories";
import { useGameStore } from "../../store/useGameStore";
import { Portrait } from "../Portrait/Portrait";

export function StoryVictory() {
  const storyBattle = useGameStore((s) => s.storyBattle);
  const continueStory = useGameStore((s) => s.continueStoryAfterVictory);
  const returnToTitle = useGameStore((s) => s.returnToTitle);
  if (!storyBattle) return null;

  const character = getCharacter(storyBattle.protagonistId);
  const chapters = getStoryChapters(storyBattle.protagonistId);
  const hasNext = storyBattle.chapter < chapters.length;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#33205f,#15152f)", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 20, textAlign: "center", fontFamily: "sans-serif" }}>
      <Portrait character={character} size={110} />
      <h1 style={{ margin: 0 }}>第{storyBattle.chapter}章クリア！</h1>
      <p style={{ margin: 0, opacity: 0.82 }}>{character.name}はライバルとの対決に勝利した。</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 12 }}>
        <button onClick={continueStory} style={{ padding: "14px 28px", border: 0, borderRadius: 8, background: "#e0662b", color: "#fff", fontSize: 16, fontWeight: "bold" }}>
          {hasNext ? `第${storyBattle.chapter + 1}章へ進む` : "ストーリー一覧へ"}
        </button>
        <button onClick={returnToTitle} style={{ padding: "14px 28px", border: "1px solid #ffffff66", borderRadius: 8, background: "#ffffff15", color: "#fff", fontSize: 15 }}>
          タイトルに戻る
        </button>
      </div>
    </div>
  );
}
