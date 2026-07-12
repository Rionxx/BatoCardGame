import type { MatchRecord } from "./persistence";
import { CARDS, LEGEND_CARD, SIGNATURE_CARDS } from "./data/cards";
import { CHARACTERS, getCharacter } from "./data/characters";

export interface CharacterStat {
  id: string;
  name: string;
  gamesPlayed: number; // そのキャラクターをプレイヤーが使用した対戦数
  wins: number;
  winRatePct: number; // gamesPlayed=0の場合は0
  usageRatePct: number; // 全対戦数に対するそのキャラクターの使用割合
}

export interface CardStat {
  id: string;
  name: string;
  timesPlayed: number;
  usageSharePct: number; // プレイされた全カードに対する割合
}

const ALL_CARDS = [...CARDS, ...SIGNATURE_CARDS, LEGEND_CARD];

export function computeCharacterStats(history: MatchRecord[]): CharacterStat[] {
  const totalGames = history.length;
  const byCharacter = new Map<string, { games: number; wins: number }>();
  for (const c of CHARACTERS) byCharacter.set(c.id, { games: 0, wins: 0 });

  for (const record of history) {
    const entry = byCharacter.get(record.playerCharacterId);
    if (!entry) continue; // 未知のキャラID（データ移行漏れ等）は無視
    entry.games += 1;
    if (record.won) entry.wins += 1;
  }

  return CHARACTERS.map((c) => {
    const entry = byCharacter.get(c.id) ?? { games: 0, wins: 0 };
    return {
      id: c.id,
      name: c.name,
      gamesPlayed: entry.games,
      wins: entry.wins,
      winRatePct: entry.games > 0 ? (entry.wins / entry.games) * 100 : 0,
      usageRatePct: totalGames > 0 ? (entry.games / totalGames) * 100 : 0,
    };
  });
}

export function computeCardStats(history: MatchRecord[]): CardStat[] {
  const counts = new Map<string, number>();
  let totalPlays = 0;
  for (const record of history) {
    for (const cardId of record.playerCardIds) {
      counts.set(cardId, (counts.get(cardId) ?? 0) + 1);
      totalPlays += 1;
    }
  }

  return ALL_CARDS.map((card) => {
    const timesPlayed = counts.get(card.id) ?? 0;
    return {
      id: card.id,
      name: card.name,
      timesPlayed,
      usageSharePct: totalPlays > 0 ? (timesPlayed / totalPlays) * 100 : 0,
    };
  }).filter((s) => s.timesPlayed > 0 || ALL_CARDS.length <= 50); // カードが少ないうちは0件も表示
}

export function getMostPlayedCharacter(history: MatchRecord[]): string | null {
  const stats = computeCharacterStats(history);
  const played = stats.filter((s) => s.gamesPlayed > 0);
  if (played.length === 0) return null;
  const top = played.reduce((best, s) => (s.gamesPlayed > best.gamesPlayed ? s : best));
  return getCharacter(top.id).name;
}
