import { create } from "zustand";
import type { Card, GameState } from "../core/engine/types";
import { beginBattle, endPlayerTurn } from "../core/engine/turn";
import { playCard } from "../core/engine/resolveCard";
import {
  DEFAULT_RUN_LENGTH,
  advanceRun,
  createRun,
  createStoryRun,
  createTournamentRun,
  getCpuDeck,
  getInitialDeck,
  pickRewardChoices,
  type RunState,
} from "../core/run/runProgress";
import { playCardDraw, playCardPlay, playSelect } from "../core/sound";
import { DEFAULT_PLAYER_CHARACTER_ID, getCharacter } from "../core/data/characters";
import { drawCards, startCpuTurn, startTurn } from "../core/engine/state";
import { DEFAULT_DIFFICULTY_ID, getDifficulty } from "../core/data/difficulties";
import { STAGES, pickRandomStage, type Stage } from "../core/data/stages";
import { clearSave, loadGame, recordMatch, saveGame } from "../core/persistence";
import { onlineClient, type OnlineSide, type ServerMessage } from "../online/onlineClient";
import { getStoryChapters } from "../core/data/stories";

export type Screen = "battle" | "reward" | "cleared" | "defeated" | "pvpResult" | "storyVictory";

export type PvpSide = "player" | "cpu"; // 2人対戦: player=プレイヤー1, cpu=プレイヤー2

interface GameStore {
  run: RunState;
  battle: GameState;
  screen: Screen;
  stage: Stage;
  rewardChoices: Card[];
  showTitle: boolean;
  hasSaveOnLoad: boolean;
  showTutorial: boolean;
  showCharacterSelect: boolean;
  showDifficultySelect: boolean;
  showPauseMenu: boolean;
  showGallery: boolean;
  showStoryMode: boolean;
  showStats: boolean;
  playerCharacterId: string;
  difficultyId: string;
  runLength: number;
  tournamentPending: boolean; // タイトルの「トーナメント」から選択フローに入っている間true
  isPvp: boolean; // 2人対戦モード中
  onlineMode: boolean;
  showOnlineLobby: boolean;
  onlineStatus: "idle" | "connecting" | "waiting" | "ready" | "error";
  onlineRoomCode: string;
  onlineLocalSide: OnlineSide | null;
  onlinePeerConnected: boolean;
  onlineReady: boolean;
  onlinePeerReady: boolean;
  onlineError: string | null;
  storyBattle: { protagonistId: string; chapter: number } | null;
  storyResume: { protagonistId: string; chapter: number } | null;
  pvpP2CharacterId: string; // プレイヤー2のキャラクター（P1はplayerCharacterIdを使う）
  pvpSetupStage: null | "p1" | "p2"; // 2人対戦のキャラクター選択がどちらの番か
  pvpCurrentSide: PvpSide;
  pvpHandoff: boolean; // 端末を相手に渡す交代画面の表示中
  playCardFromHand: (card: Card) => void;
  endTurn: () => void;
  chooseReward: (card: Card | null) => void;
  restart: () => void;
  closeTitle: () => void;
  startNewGameFromTitle: () => void;
  startTournamentSetup: () => void;
  startPvpSetup: () => void;
  openOnlineLobby: () => void;
  closeOnlineLobby: () => void;
  createOnlineRoom: () => void;
  joinOnlineRoom: (roomCode: string) => void;
  chooseOnlineCharacter: (id: string) => void;
  setOnlineReady: (ready: boolean) => void;
  pvpPlayCard: (card: Card) => void;
  pvpEndTurn: () => void;
  pvpConfirmHandoff: () => void;
  pvpRematch: () => void;
  exitPvp: () => void;
  openTutorial: () => void;
  closeTutorial: () => void;
  backToTitle: () => void;
  openCharacterSelect: () => void;
  closeCharacterSelect: () => void;
  chooseCharacter: (id: string) => void;
  openDifficultySelect: () => void;
  closeDifficultySelect: () => void;
  chooseDifficulty: (id: string) => void;
  setRunLength: (n: number) => void;
  openPauseMenu: () => void;
  closePauseMenu: () => void;
  openGallery: () => void;
  closeGallery: () => void;
  openStoryMode: () => void;
  closeStoryMode: () => void;
  openStats: () => void;
  closeStats: () => void;
  startStoryBattle: (protagonistId: string, rivalId: string, chapter: number) => void;
  continueStoryAfterVictory: () => void;
  returnToTitle: () => void;
  resetAllData: () => void;
}

function startBattleForRound(run: RunState, difficultyId: string): GameState {
  const opponent = run.opponents[run.round];
  const difficulty = getDifficulty(difficultyId);
  return beginBattle(run.deck, getCpuDeck(opponent.id), opponent.weakness, {
    playerPride: difficulty.playerPride,
    cpuPride: difficulty.cpuPride,
    cpuBudgetBonus: difficulty.cpuBudgetBonus,
  });
}

export const useGameStore = create<GameStore>((set, get) => {
  // 中断からの再開: セーブデータがあればそこから復元し、無ければ新規開始する。
  const saved = loadGame();

  const initialRun = saved ? saved.run : createRun(DEFAULT_PLAYER_CHARACTER_ID, DEFAULT_RUN_LENGTH);
  const initialBattle = saved ? saved.battle : startBattleForRound(initialRun, DEFAULT_DIFFICULTY_ID);
  const initialStage = saved
    ? STAGES.find((st) => st.id === saved.stageId) ?? pickRandomStage()
    : pickRandomStage();

  // 対戦終了時、勝敗を対戦履歴（統計用）に記録してから画面遷移する。
  const finishBattleIfNeeded = (battle: GameState) => {
    if (battle.winner === "player" || battle.winner === "cpu") {
      const { run, playerCharacterId } = get();
      const opponent = run.opponents[run.round];
      recordMatch({
        timestamp: Date.now(),
        playerCharacterId,
        opponentCharacterId: opponent.id,
        won: battle.winner === "player",
        playerCardIds: battle.history.filter((h) => h.actor === "player").map((h) => h.card.id),
      });
    }
    if (battle.winner === "player") {
      const { run, storyBattle } = get();
      if (storyBattle) {
        set({ screen: "storyVictory" });
        return;
      }
      // 最終戦の勝利ではカード報酬を挟まず、そのままクリア画面へ進む
      // （次の対戦が無いため報酬カードを選ぶ意味がない）
      if (run.round + 1 >= run.opponents.length) {
        set({ run: advanceRun(run, null), screen: "cleared" });
      } else {
        set({ rewardChoices: pickRewardChoices(3), screen: "reward" });
      }
    } else if (battle.winner === "cpu") {
      set({ screen: "defeated" });
    }
  };

  const guestView = (battle: GameState): GameState => {
    const copy = JSON.parse(JSON.stringify(battle)) as GameState;
    // P2へ送る状態からP1の非公開情報だけを除く。ゲーム進行の正本はP1側に保持する。
    copy.player.hiddenHandCount = copy.player.hand.length;
    copy.player.hand = [];
    copy.player.deck = [];
    return copy;
  };

  const syncOnlineBattle = () => {
    const { battle, pvpCurrentSide, screen } = get();
    onlineClient.relay({ kind: "state", battle: guestView(battle), currentSide: pvpCurrentSide, screen });
  };

  const startOnlineBattle = () => {
    const s = get();
    if (s.onlineLocalSide !== "player" || !s.onlineReady || !s.onlinePeerReady || !s.showOnlineLobby) return;
    const p1 = getCharacter(s.playerCharacterId);
    const p2 = getCharacter(s.pvpP2CharacterId);
    const battle = beginBattle(getInitialDeck(p1.id), getInitialDeck(p2.id), p2.weakness, {
      playerWeakness: p1.weakness,
      labels: { player: `P1(${p1.name})`, cpu: `P2(${p2.name})` },
    });
    set({
      battle, screen: "battle", isPvp: true, onlineMode: true, showOnlineLobby: false,
      showTitle: false, stage: pickRandomStage(), pvpCurrentSide: "player", pvpHandoff: false,
    });
    onlineClient.relay({
      kind: "start", battle: guestView(battle), p1Id: p1.id, p2Id: p2.id, currentSide: "player",
    });
  };

  const hostEndOnlineTurn = (side: PvpSide) => {
    const { battle, pvpCurrentSide } = get();
    if (pvpCurrentSide !== side || battle.winner) return;
    if (side === "player") {
      startCpuTurn(battle);
      set({ battle: { ...battle }, pvpCurrentSide: "cpu", pvpHandoff: false });
    } else {
      startTurn(battle);
      drawCards(battle.player, 1);
      drawCards(battle.cpu, 1);
      playCardDraw();
      set({ battle: { ...battle }, pvpCurrentSide: "player", pvpHandoff: false });
    }
    syncOnlineBattle();
  };

  const onOnlineMessage = (message: ServerMessage) => {
    if (message.type === "joined") {
      set({
        onlineRoomCode: message.roomCode, onlineLocalSide: message.side, onlineStatus: "waiting",
        onlinePeerConnected: false, onlineReady: false, onlinePeerReady: false, onlineError: null,
      });
      return;
    }
    if (message.type === "peerJoined") {
      const s = get();
      set({ onlinePeerConnected: true, onlineStatus: "ready", onlineError: null });
      const id = s.onlineLocalSide === "player" ? s.playerCharacterId : s.pvpP2CharacterId;
      onlineClient.relay({ kind: "character", side: s.onlineLocalSide, id });
      return;
    }
    if (message.type === "peerLeft") {
      set({ onlinePeerConnected: false, onlinePeerReady: false, onlineStatus: "waiting", onlineError: "相手との接続が切れました" });
      return;
    }
    if (message.type === "error") {
      set({ onlineStatus: "error", onlineError: message.message });
      return;
    }
    const payload = message.payload as Record<string, unknown> | null;
    if (!payload || typeof payload.kind !== "string") return;
    if (payload.kind === "character" && typeof payload.id === "string") {
      if (payload.side === "player") set({ playerCharacterId: payload.id });
      if (payload.side === "cpu") set({ pvpP2CharacterId: payload.id });
      return;
    }
    if (payload.kind === "ready" && typeof payload.ready === "boolean") {
      set({ onlinePeerReady: payload.ready });
      startOnlineBattle();
      return;
    }
    if (payload.kind === "start" && get().onlineLocalSide === "cpu") {
      set({
        battle: payload.battle as GameState, playerCharacterId: String(payload.p1Id),
        pvpP2CharacterId: String(payload.p2Id), pvpCurrentSide: "player", screen: "battle",
        isPvp: true, onlineMode: true, showOnlineLobby: false, showTitle: false, pvpHandoff: false,
        stage: pickRandomStage(),
      });
      return;
    }
    if (payload.kind === "action" && get().onlineLocalSide === "player") {
      const side = payload.side as PvpSide;
      if (side !== "cpu" || get().pvpCurrentSide !== "cpu") return;
      if (payload.action === "play" && typeof payload.cardId === "string") {
        const battle = get().battle;
        const card = battle.cpu.hand.find((c) => c.id === payload.cardId);
        if (!card || !playCard(battle, "cpu", card).ok) return;
        playCardPlay();
        set({ battle: { ...battle }, screen: battle.winner ? "pvpResult" : "battle" });
        syncOnlineBattle();
      } else if (payload.action === "endTurn") {
        hostEndOnlineTurn("cpu");
      }
      return;
    }
    if (payload.kind === "state" && get().onlineLocalSide === "cpu") {
      set({
        battle: payload.battle as GameState,
        pvpCurrentSide: payload.currentSide as PvpSide,
        screen: payload.screen as Screen,
      });
    }
  };

  onlineClient.setHandler(onOnlineMessage);

  return {
    run: initialRun,
    battle: initialBattle,
    screen: saved ? (saved.screen as Screen) : "battle",
    stage: initialStage,
    rewardChoices: saved ? saved.rewardChoices : [],
    showTitle: true, // 常にタイトル画面から起動する
    hasSaveOnLoad: saved !== null,
    showTutorial: !saved, // 続きから再開する場合はチュートリアルを出さない
    showCharacterSelect: false,
    showDifficultySelect: false,
    showPauseMenu: false,
    showGallery: false,
    showStoryMode: false,
    showStats: false,
    playerCharacterId: saved ? saved.playerCharacterId : DEFAULT_PLAYER_CHARACTER_ID,
    difficultyId: saved ? saved.difficultyId : DEFAULT_DIFFICULTY_ID,
    runLength: saved ? saved.runLength : DEFAULT_RUN_LENGTH,
    tournamentPending: false,
    isPvp: false,
    onlineMode: false,
    showOnlineLobby: false,
    onlineStatus: "idle",
    onlineRoomCode: "",
    onlineLocalSide: null,
    onlinePeerConnected: false,
    onlineReady: false,
    onlinePeerReady: false,
    onlineError: null,
    storyBattle: null,
    storyResume: null,
    pvpP2CharacterId: "romako",
    pvpSetupStage: null,
    pvpCurrentSide: "player",
    pvpHandoff: false,

    closeTitle: () => set({ showTitle: false }),

    // タイトルから「はじめから」: セーブを破棄して完全に新規開始する
    startNewGameFromTitle: () => {
      get().resetAllData();
      set({ showTitle: false });
    },

    // タイトルの「トーナメント」: キャラクター選択→難易度選択を経て4連戦を開始する
    startTournamentSetup: () => {
      set({
        tournamentPending: true,
        showTitle: false,
        showTutorial: false,
        showCharacterSelect: true,
      });
    },

    // タイトルの「2人対戦」: P1→P2の順にキャラクターを選んでホットシート対戦を開始する
    startPvpSetup: () => {
      set({
        pvpSetupStage: "p1",
        tournamentPending: false,
        showTitle: false,
        showTutorial: false,
        showCharacterSelect: true,
      });
    },

    openOnlineLobby: () => set({
      showOnlineLobby: true, showTitle: false, showTutorial: false, onlineStatus: "idle",
      onlineRoomCode: "", onlineLocalSide: null, onlinePeerConnected: false,
      onlineReady: false, onlinePeerReady: false, onlineError: null,
    }),

    closeOnlineLobby: () => {
      onlineClient.close();
      set({ showOnlineLobby: false, showTitle: true, onlineStatus: "idle", onlineLocalSide: null });
    },

    createOnlineRoom: () => {
      set({ onlineStatus: "connecting", onlineError: null });
      onlineClient.create();
    },

    joinOnlineRoom: (roomCode: string) => {
      if (!roomCode.trim()) {
        set({ onlineStatus: "error", onlineError: "ルームコードを入力してください" });
        return;
      }
      set({ onlineStatus: "connecting", onlineError: null });
      onlineClient.join(roomCode);
    },

    chooseOnlineCharacter: (id: string) => {
      const side = get().onlineLocalSide;
      if (side === "player") set({ playerCharacterId: id, onlineReady: false });
      if (side === "cpu") set({ pvpP2CharacterId: id, onlineReady: false });
      onlineClient.relay({ kind: "character", side, id });
      onlineClient.relay({ kind: "ready", side, ready: false });
    },

    setOnlineReady: (ready: boolean) => {
      const side = get().onlineLocalSide;
      set({ onlineReady: ready });
      onlineClient.relay({ kind: "ready", side, ready });
      startOnlineBattle();
    },

    // 2人対戦: 現在の手番側がカードをプレイする
    pvpPlayCard: (card: Card) => {
      const { battle, pvpCurrentSide, onlineMode, onlineLocalSide } = get();
      if (onlineMode) {
        if (onlineLocalSide !== pvpCurrentSide) return;
        if (onlineLocalSide === "cpu") {
          onlineClient.relay({ kind: "action", side: "cpu", action: "play", cardId: card.id });
          return;
        }
      }
      const result = playCard(battle, pvpCurrentSide, card);
      if (!result.ok) return;
      playCardPlay();
      set({ battle: { ...battle } });
      if (battle.winner) set({ screen: "pvpResult" });
      if (onlineMode) syncOnlineBattle();
    },

    // 2人対戦: 手番を交代する（P1終了→P2開始、P2終了→次ターンのP1開始）
    pvpEndTurn: () => {
      const { battle, pvpCurrentSide, onlineMode, onlineLocalSide } = get();
      if (battle.winner) return;
      if (onlineMode) {
        if (onlineLocalSide !== pvpCurrentSide) return;
        if (onlineLocalSide === "cpu") {
          onlineClient.relay({ kind: "action", side: "cpu", action: "endTurn" });
        } else {
          hostEndOnlineTurn("player");
        }
        return;
      }
      if (pvpCurrentSide === "player") {
        startCpuTurn(battle); // P2のコスト予算を用意
        set({ battle: { ...battle }, pvpCurrentSide: "cpu", pvpHandoff: true });
      } else {
        startTurn(battle); // 次ターン開始（ターン数+1、P1の予算）
        drawCards(battle.player, 1);
        drawCards(battle.cpu, 1);
        playCardDraw();
        set({ battle: { ...battle }, pvpCurrentSide: "player", pvpHandoff: true });
      }
    },

    pvpConfirmHandoff: () => set({ pvpHandoff: false }),

    // 2人対戦: 同じキャラクター同士でもう一戦
    pvpRematch: () => {
      const { playerCharacterId, pvpP2CharacterId, onlineMode, onlineLocalSide } = get();
      if (onlineMode && onlineLocalSide === "cpu") return;
      const p1 = getCharacter(playerCharacterId);
      const p2 = getCharacter(pvpP2CharacterId);
      const battle = beginBattle(getInitialDeck(p1.id), getInitialDeck(p2.id), p2.weakness, {
        playerWeakness: p1.weakness,
        labels: { player: `P1(${p1.name})`, cpu: `P2(${p2.name})` },
      });
      set({
        battle,
        screen: "battle",
        stage: pickRandomStage(),
        pvpCurrentSide: "player",
        pvpHandoff: false,
      });
      if (onlineMode) {
        const next = get().battle;
        onlineClient.relay({
          kind: "start", battle: guestView(next), p1Id: playerCharacterId,
          p2Id: pvpP2CharacterId, currentSide: "player",
        });
      }
    },

    // 2人対戦を終了してタイトルへ（ソロのランを復元して戻す）
    exitPvp: () => {
      onlineClient.close();
      const { playerCharacterId, difficultyId, runLength } = get();
      const freshRun = createRun(playerCharacterId, runLength);
      set({
        isPvp: false,
        onlineMode: false,
        onlineLocalSide: null,
        pvpSetupStage: null,
        pvpHandoff: false,
        run: freshRun,
        battle: startBattleForRound(freshRun, difficultyId),
        screen: "battle",
        stage: pickRandomStage(),
        rewardChoices: [],
        showTitle: true,
        hasSaveOnLoad: true,
      });
    },

    openTutorial: () => set({ showTutorial: true }),
    // 初回導入の流れ: チュートリアル → キャラクター選択 → 難易度選択 → 対戦開始
    closeTutorial: () => set({ showTutorial: false, showCharacterSelect: true }),
    backToTitle: () => set({
      showTitle: true, hasSaveOnLoad: true, showTutorial: false, showCharacterSelect: false,
      showDifficultySelect: false, showPauseMenu: false, tournamentPending: false, pvpSetupStage: null,
      storyBattle: null, storyResume: null,
    }),
    openCharacterSelect: () => set({ showCharacterSelect: true }),
    closeCharacterSelect: () => {
      const { tournamentPending, pvpSetupStage } = get();
      set({
        showCharacterSelect: false,
        tournamentPending: false,
        pvpSetupStage: null,
        showTitle: tournamentPending || pvpSetupStage !== null ? true : get().showTitle,
      });
    },

    chooseCharacter: (id: string) => {
      playSelect();
      const { pvpSetupStage } = get();
      // 2人対戦のセットアップ中: P1→P2の順に選び、P2確定で即対戦開始（難易度選択なし）
      if (pvpSetupStage === "p1") {
        set({ playerCharacterId: id, pvpSetupStage: "p2" });
        return;
      }
      if (pvpSetupStage === "p2") {
        const p1 = getCharacter(get().playerCharacterId);
        const p2 = getCharacter(id);
        const battle = beginBattle(getInitialDeck(p1.id), getInitialDeck(p2.id), p2.weakness, {
          playerWeakness: p1.weakness,
          labels: { player: `P1(${p1.name})`, cpu: `P2(${p2.name})` },
        });
        set({
          pvpP2CharacterId: id,
          pvpSetupStage: null,
          showCharacterSelect: false,
          isPvp: true,
          battle,
          screen: "battle",
          stage: pickRandomStage(),
          pvpCurrentSide: "player",
          pvpHandoff: false,
        });
        return;
      }
      set({ playerCharacterId: id, showCharacterSelect: false, showDifficultySelect: true });
    },

    openDifficultySelect: () => set({ showDifficultySelect: true }),
    closeDifficultySelect: () => set({ showDifficultySelect: false, tournamentPending: false }),
    setRunLength: (n: number) => set({ runLength: n }),

    // 難易度確定でランを最初から開始する（キャラ・難易度・対戦人数変更はラン再開扱い）。
    // トーナメント設定中なら4連戦（1回戦→決勝）のランを組む。
    chooseDifficulty: (id: string) => {
      playSelect();
      const { playerCharacterId, runLength, tournamentPending } = get();
      const freshRun = tournamentPending
        ? createTournamentRun(playerCharacterId)
        : createRun(playerCharacterId, runLength);
      set({
        difficultyId: id,
        showDifficultySelect: false,
        tournamentPending: false,
        run: freshRun,
        battle: startBattleForRound(freshRun, id),
        screen: "battle",
        stage: pickRandomStage(),
        rewardChoices: [],
      });
    },

    openPauseMenu: () => set({ showPauseMenu: true }),
    closePauseMenu: () => set({ showPauseMenu: false }),
    openGallery: () => set({ showGallery: true }),
    closeGallery: () => set({ showGallery: false }),
    openStoryMode: () => set({ showStoryMode: true }),
    closeStoryMode: () => set({ showStoryMode: false, storyResume: null }),
    openStats: () => set({ showStats: true }),
    closeStats: () => set({ showStats: false }),

    // ストーリーモードから: 章の主人公を操作して、章に登場するライバル1人と単発対戦する
    startStoryBattle: (protagonistId: string, rivalId: string, chapter: number) => {
      playSelect();
      const storyRun = createStoryRun(protagonistId, rivalId);
      set({
        playerCharacterId: protagonistId,
        difficultyId: "normal",
        run: storyRun,
        battle: startBattleForRound(storyRun, "normal"),
        screen: "battle",
        stage: pickRandomStage(),
        rewardChoices: [],
        showStoryMode: false,
        showTitle: false,
        showTutorial: false,
        showCharacterSelect: false,
        showDifficultySelect: false,
        showPauseMenu: false,
        storyBattle: { protagonistId, chapter },
        storyResume: null,
      });
    },

    continueStoryAfterVictory: () => {
      const { storyBattle, runLength } = get();
      if (!storyBattle) return;
      const chapters = getStoryChapters(storyBattle.protagonistId);
      const nextChapter = storyBattle.chapter + 1;
      const freshRun = createRun(storyBattle.protagonistId, runLength);
      set({
        run: freshRun,
        battle: startBattleForRound(freshRun, DEFAULT_DIFFICULTY_ID),
        screen: "battle",
        showTitle: true,
        showStoryMode: true,
        storyResume: nextChapter <= chapters.length
          ? { protagonistId: storyBattle.protagonistId, chapter: nextChapter }
          : null,
        storyBattle: null,
      });
    },

    // リザルト画面からタイトルへ戻る（次のランを裏で用意しておく）
    returnToTitle: () => {
      const { playerCharacterId, difficultyId, runLength } = get();
      const freshRun = createRun(playerCharacterId, runLength);
      set({
        run: freshRun,
        battle: startBattleForRound(freshRun, difficultyId),
        screen: "battle",
        stage: pickRandomStage(),
        rewardChoices: [],
        showTitle: true,
        hasSaveOnLoad: true,
        storyBattle: null,
        storyResume: null,
      });
    },

    // セーブデータを削除して完全に最初から（チュートリアルから再スタート）
    resetAllData: () => {
      clearSave();
      const freshRun = createRun(DEFAULT_PLAYER_CHARACTER_ID, DEFAULT_RUN_LENGTH);
      set({
        run: freshRun,
        battle: startBattleForRound(freshRun, DEFAULT_DIFFICULTY_ID),
        screen: "battle",
        stage: pickRandomStage(),
        rewardChoices: [],
        showTutorial: true,
        showCharacterSelect: false,
        showDifficultySelect: false,
        showPauseMenu: false,
        playerCharacterId: DEFAULT_PLAYER_CHARACTER_ID,
        difficultyId: DEFAULT_DIFFICULTY_ID,
        runLength: DEFAULT_RUN_LENGTH,
        tournamentPending: false,
      });
    },

    playCardFromHand: (card: Card) => {
      const { battle } = get();
      const result = playCard(battle, "player", card);
      if (!result.ok) return;
      playCardPlay();
      set({ battle: { ...battle } });
      finishBattleIfNeeded(battle);
    },

    endTurn: () => {
      const { battle } = get();
      endPlayerTurn(battle);
      if (!battle.winner) playCardDraw(); // 新しい手札を引く音
      set({ battle: { ...battle } });
      finishBattleIfNeeded(battle);
    },

    chooseReward: (card: Card | null) => {
      const { run, difficultyId } = get();
      const nextRun = advanceRun(run, card);
      if (nextRun.cleared) {
        set({ run: nextRun, screen: "cleared" });
        return;
      }
      set({
        run: nextRun,
        battle: startBattleForRound(nextRun, difficultyId),
        screen: "battle",
        stage: pickRandomStage(),
        rewardChoices: [],
      });
    },

    restart: () => {
      const { playerCharacterId, difficultyId, runLength, run, storyBattle } = get();
      // トーナメント中のやり直しはトーナメントとして組み直す
      const freshRun = storyBattle
        ? createStoryRun(playerCharacterId, run.opponents[0].id)
        : run.isTournament
          ? createTournamentRun(playerCharacterId)
          : createRun(playerCharacterId, runLength);
      set({
        run: freshRun,
        battle: startBattleForRound(freshRun, difficultyId),
        screen: "battle",
        stage: pickRandomStage(),
        rewardChoices: [],
      });
    },
  };
});

// 開発時のみ: E2Eテスト（Playwright）から状態を操作できるようにストアを公開する。
// 本番ビルドには含まれない。
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as unknown as { __gameStore?: typeof useGameStore }).__gameStore = useGameStore;
}

// 状態が変わるたびに自動セーブする（中断してもブラウザを開き直せば続きから遊べる）。
// 2人対戦はその場限りのモードなので保存しない（直前のソロのセーブを保護する）。
useGameStore.subscribe((s) => {
  if (s.isPvp || s.pvpSetupStage !== null || s.screen === "pvpResult" || s.storyBattle || s.screen === "storyVictory") return;
  saveGame({
    version: 1,
    run: s.run,
    battle: s.battle,
    screen: s.screen,
    stageId: s.stage.id,
    rewardChoices: s.rewardChoices,
    playerCharacterId: s.playerCharacterId,
    difficultyId: s.difficultyId,
    runLength: s.runLength,
  });
});
