import type { Card, GameState } from "./engine/types";
import type { RunState } from "./run/runProgress";

// ブラウザのlocalStorageへの自動セーブ。中断（ブラウザを閉じる/リロード）しても
// 続きから再開できるようにする。テスト環境(node)ではlocalStorageが無いため何もしない。

const KEY = "romacoCardGame.save.v1";

export interface SaveData {
  version: 1;
  run: RunState;
  battle: GameState;
  screen: string;
  stageId: string;
  rewardChoices: Card[];
  playerCharacterId: string;
  difficultyId: string;
  runLength: number;
}

function storageAvailable(): boolean {
  return typeof localStorage !== "undefined";
}

export function saveGame(data: SaveData): void {
  if (!storageAvailable()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // ストレージ満杯等は無視する（ゲーム進行を妨げない）
  }
}

export function loadGame(): SaveData | null {
  if (!storageAvailable()) return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    // 最低限の形チェック。壊れたセーブは無視して新規開始する。
    if (data.version !== 1 || !data.battle?.player || !data.run?.opponents?.length) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  if (!storageAvailable()) return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 無視
  }
}

// 対戦履歴（統計・可視化用）。セーブデータ(KEY)とは別に、完了した対戦を追記保存する。
const HISTORY_KEY = "romacoCardGame.history.v1";
const HISTORY_MAX_LENGTH = 1000; // 際限なく増え続けないよう上限を設ける

export interface MatchRecord {
  timestamp: number;
  playerCharacterId: string;
  opponentCharacterId: string;
  won: boolean;
  playerCardIds: string[]; // その対戦でプレイヤーが使用したカードID（重複含む）
}

export function recordMatch(record: MatchRecord): void {
  if (!storageAvailable()) return;
  try {
    const history = loadMatchHistory();
    history.push(record);
    const trimmed = history.length > HISTORY_MAX_LENGTH ? history.slice(-HISTORY_MAX_LENGTH) : history;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // 無視（統計は補助機能であり、ゲーム進行を妨げない）
  }
}

export function loadMatchHistory(): MatchRecord[] {
  if (!storageAvailable()) return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as MatchRecord[]) : [];
  } catch {
    return [];
  }
}

export function clearMatchHistory(): void {
  if (!storageAvailable()) return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // 無視
  }
}
