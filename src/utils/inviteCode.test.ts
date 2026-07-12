import { describe, expect, it } from "vitest";
import { generateInviteCode, isValidInviteCode, normalizeInviteCode } from "./inviteCode";

describe("inviteCode", () => {
  it("生成されたコードは常に有効", () => {
    for (let i = 0; i < 100; i++) {
      expect(isValidInviteCode(generateInviteCode())).toBe(true);
    }
  });

  it("小文字・空白入りの入力を正規化できる", () => {
    expect(normalizeInviteCode(" ab c9 22 ")).toBe("ABC922");
  });

  it("長さ不足や不正文字は無効と判定される", () => {
    expect(isValidInviteCode("ABC")).toBe(false);
    expect(isValidInviteCode("ABC10O")).toBe(false); // 0/O/1は未使用
  });
});
