// ルーム招待コードの生成と正規化。紛らわしい文字（0/O, 1/I/L）は使わない。
const CODE_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const INVITE_CODE_LENGTH = 6;

export function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

/** 入力された招待コードを正規化する（小文字→大文字、空白除去、紛らわしい文字の読み替え）。 */
export function normalizeInviteCode(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/\s/g, "")
    .replace(/O/g, "0") // Oは使わないので0の打ち間違いとみなす→ただし0も未使用なので下で弾かれる
    .replace(/[^23456789ABCDEFGHJKMNPQRSTUVWXYZ]/g, "");
}

export function isValidInviteCode(code: string): boolean {
  return code.length === INVITE_CODE_LENGTH && [...code].every((ch) => CODE_CHARS.includes(ch));
}
