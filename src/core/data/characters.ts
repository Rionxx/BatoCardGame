import type { Attribute, PersonalityType } from "../engine/types";
import { WEAKNESS_BY_PERSONALITY } from "../engine/types";

export type Glyph = "pig" | "flame" | "moon";
export type Accessory = "none" | "bow" | "crown" | "glasses" | "brow" | "tophat";

export interface CharacterDef {
  id: string;
  name: string;
  colors: [string, string]; // 体色グラデーション（明→暗）
  glyph: Glyph;
  accessory: Accessory;
  personality: PersonalityType;
  weakness: Attribute;
  signatureCardId: string; // このキャラクターの必殺カード（cards.ts の SIGNATURE_CARDS）
  eyeColors?: [string, string]; // ハート目の色（左, 右）。省略時は共通色。オッドアイ表現用
}

function withWeakness(
  c: Omit<CharacterDef, "weakness">
): CharacterDef {
  return { ...c, weakness: WEAKNESS_BY_PERSONALITY[c.personality] };
}

// キャラクター名はユーザー指定（コミュニティ向けファン企画）。
// ビジュアルは既存作品の画像を流用せず、丸い豚のオリジナルマスコットとして
// 色・アクセサリー違いで描き分ける。
export const CHARACTERS: CharacterDef[] = [
  // ロマ子: 青系の体色＋黒のミニハット（赤いバラ付き）＋赤/青のオッドアイ。
  // 参考画像の「雰囲気」（青・ミニハット・バラ・オッドアイという一般的モチーフ）のみを
  // 取り入れたオリジナルマスコットで、既存イラストの複製はしない。
  withWeakness({ id: "romako", name: "罵尻ロマ子", colors: ["#9db8ff", "#4a63c9"], glyph: "pig", accessory: "tophat", personality: "プライド過剰", signatureCardId: "S01", eyeColors: ["#e04a4a", "#4a6fe0"] }),
  withWeakness({ id: "bg", name: "BG", colors: ["#b8c4d0", "#5a6b7d"], glyph: "pig", accessory: "glasses", personality: "鈍感", signatureCardId: "S02" }),
  withWeakness({ id: "shingo", name: "しんご", colors: ["#b8e6a3", "#4e9440"], glyph: "pig", accessory: "none", personality: "短気", signatureCardId: "S03" }),
  withWeakness({ id: "hisa", name: "Hisa", colors: ["#a8d8ff", "#3d7fc4"], glyph: "pig", accessory: "none", personality: "繊細", signatureCardId: "S04" }),
  withWeakness({ id: "take", name: "たけちゃん", colors: ["#ffcc8a", "#d97c1e"], glyph: "pig", accessory: "brow", personality: "短気", signatureCardId: "S05" }),
  withWeakness({ id: "teruzo", name: "てるぞー", colors: ["#a3e6d8", "#2f8f7a"], glyph: "pig", accessory: "none", personality: "繊細", signatureCardId: "S06" }),
  // りおんは男性のためリボンなし
  withWeakness({ id: "rion", name: "りおん", colors: ["#c4e0ff", "#5a8fd4"], glyph: "pig", accessory: "none", personality: "繊細", signatureCardId: "S07" }),
  withWeakness({ id: "baku", name: "バク", colors: ["#d9b3ff", "#7a3fb8"], glyph: "pig", accessory: "none", personality: "鈍感", signatureCardId: "S08" }),
  withWeakness({ id: "sachiyo", name: "さちよ", colors: ["#ffd6e8", "#d46a9e"], glyph: "pig", accessory: "bow", personality: "繊細", signatureCardId: "S09" }),
  withWeakness({ id: "uemu", name: "うえむ", colors: ["#e0d0a8", "#9c7f3d"], glyph: "pig", accessory: "glasses", personality: "プライド過剰", signatureCardId: "S10" }),
  // みとは女性のためリボン付き
  withWeakness({ id: "mito", name: "みと", colors: ["#c8f0c0", "#5aa04e"], glyph: "pig", accessory: "bow", personality: "鈍感", signatureCardId: "S11" }),
  withWeakness({ id: "picco", name: "ピッコー", colors: ["#fff2a8", "#d4b31e"], glyph: "pig", accessory: "none", personality: "短気", signatureCardId: "S12" }),
  withWeakness({ id: "garyu", name: "臥龍", colors: ["#9aa8c4", "#2f3f5f"], glyph: "pig", accessory: "brow", personality: "プライド過剰", signatureCardId: "S13" }),
];

export function getCharacter(id: string): CharacterDef {
  const found = CHARACTERS.find((c) => c.id === id);
  if (!found) throw new Error(`unknown character id: ${id}`);
  return found;
}

export const DEFAULT_PLAYER_CHARACTER_ID = "rion";
