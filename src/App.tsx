import { useEffect, type ReactNode } from "react";
import { useGameStore } from "./store/useGameStore";
import { playClick } from "./core/sound";
import { Battle } from "./components/Battle/Battle";
import { CardReward } from "./components/CardReward/CardReward";
import { Cleared, Defeated } from "./components/Result/Result";
import { Tutorial } from "./components/Tutorial/Tutorial";
import { CharacterSelect } from "./components/CharacterSelect/CharacterSelect";
import { DifficultySelect } from "./components/DifficultySelect/DifficultySelect";
import { PauseMenu } from "./components/PauseMenu/PauseMenu";
import { TitleScreen } from "./components/Title/TitleScreen";
import { CardGallery } from "./components/CardGallery/CardGallery";
import { StoryMode } from "./components/StoryMode/StoryMode";
import { StatsScreen } from "./components/Stats/StatsScreen";
import { PvpBattle } from "./components/Pvp/PvpBattle";
import { PvpResult } from "./components/Pvp/PvpResult";
import { OnlineLobby } from "./components/Pvp/OnlineLobby";
import { StoryVictory } from "./components/StoryMode/StoryVictory";

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const showTutorial = useGameStore((s) => s.showTutorial);
  const showCharacterSelect = useGameStore((s) => s.showCharacterSelect);
  const showDifficultySelect = useGameStore((s) => s.showDifficultySelect);
  const showPauseMenu = useGameStore((s) => s.showPauseMenu);
  const showTitle = useGameStore((s) => s.showTitle);
  const showGallery = useGameStore((s) => s.showGallery);
  const showStoryMode = useGameStore((s) => s.showStoryMode);
  const showStats = useGameStore((s) => s.showStats);
  const isPvp = useGameStore((s) => s.isPvp);
  const showOnlineLobby = useGameStore((s) => s.showOnlineLobby);

  // すべてのボタン押下で共通のクリック音を鳴らす（個別の効果音はこの上に重なる）
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("button")) playClick();
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  let body: ReactNode;
  switch (screen) {
    case "battle":
      body = isPvp ? <PvpBattle /> : <Battle />;
      break;
    case "pvpResult":
      body = <PvpResult />;
      break;
    case "storyVictory":
      body = <StoryVictory />;
      break;
    case "reward":
      body = <CardReward />;
      break;
    case "cleared":
      body = <Cleared />;
      break;
    case "defeated":
      body = <Defeated />;
      break;
  }

  return (
    <>
      {body}
      {/* タイトル表示中は下位のチュートリアル等をマウントしない（隠れたDOMとして残さないため） */}
      {!showTitle && showTutorial && <Tutorial />}
      {!showTitle && !showTutorial && showCharacterSelect && <CharacterSelect />}
      {!showTitle && !showTutorial && !showCharacterSelect && showDifficultySelect && <DifficultySelect />}
      {!showTitle && !showTutorial && !showCharacterSelect && !showDifficultySelect && showPauseMenu && <PauseMenu />}
      {/* ギャラリー/ストーリー/データはタイトルからも対戦中からも開けるため、さらに前面に表示する */}
      {showTitle && <TitleScreen />}
      {showGallery && <CardGallery />}
      {showStoryMode && <StoryMode />}
      {showStats && <StatsScreen />}
      {showOnlineLobby && <OnlineLobby />}
    </>
  );
}
