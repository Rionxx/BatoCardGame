import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase, isOnlineConfigured } from "../services/supabase";
import { generateInviteCode, isValidInviteCode, normalizeInviteCode } from "../utils/inviteCode";

// オンライン対戦の通信層。以前はNodeのWebSocket中継サーバー（server/onlineRelay.mjs）を
// 使っていたが、Netlify（静的ホスティング）ではNodeサーバーを常駐できないため、
// Supabase Realtime のbroadcast（メッセージ中継）とpresence（在室検知）に置き換えた。
// 公開APIは以前と同一のため、store側（useGameStore）の対戦ロジックは変更不要。
//
// アーキテクチャはホスト権威型:
//  - ルーム作成者（P1）がゲームエンジンを実行する唯一の「正」
//  - 参加者（P2）は操作を送るだけで、状態はP1から配信されたものを表示する
//  - そのためP2はHP・手札・ターンを改ざんできない（P1が全操作をエンジンで検証する）

export type OnlineSide = "player" | "cpu";
export type ServerMessage =
  | { type: "joined"; roomCode: string; side: OnlineSide }
  | { type: "peerJoined" }
  | { type: "peerLeft" }
  | { type: "relay"; payload: unknown }
  | { type: "error"; message: string };

let channel: RealtimeChannel | null = null;
let handler: (message: ServerMessage) => void = () => undefined;
let peerPresent = false;

const NOT_CONFIGURED_MESSAGE =
  "オンライン対戦が未設定です。Supabaseの環境変数（VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY）を設定してください（docs/08_online_setup.md参照）";

function channelName(roomCode: string): string {
  return `romaco-room-${roomCode}`;
}

/** presence状態から在室しているside一覧を数える */
function countSides(ch: RealtimeChannel): { host: number; guest: number } {
  const state = ch.presenceState<{ side: OnlineSide }>();
  let host = 0;
  let guest = 0;
  for (const key of Object.keys(state)) {
    for (const meta of state[key]) {
      if (meta.side === "player") host += 1;
      if (meta.side === "cpu") guest += 1;
    }
  }
  return { host, guest };
}

function teardown(): void {
  const sb = getSupabase();
  if (channel && sb) void sb.removeChannel(channel);
  channel = null;
  peerPresent = false;
}

/** ルームのRealtimeチャンネルに接続する。sideが確定したらjoinedを、以降の相手の入退室を通知する。 */
function connect(roomCode: string, mySide: OnlineSide): void {
  const sb = getSupabase();
  if (!sb) {
    handler({ type: "error", message: NOT_CONFIGURED_MESSAGE });
    return;
  }
  teardown();
  let announced = false;

  const ch = sb.channel(channelName(roomCode), {
    config: {
      broadcast: { self: false },
      presence: { key: `${mySide}-${Math.random().toString(36).slice(2, 8)}` },
    },
  });
  channel = ch;

  const evaluatePresence = () => {
    if (channel !== ch) return;
    const sides = countSides(ch);

    if (!announced) {
      // 参加時の検証（ゲスト側）: ホスト不在→ルームなし、ゲスト既在→満員
      if (mySide === "cpu") {
        if (sides.host === 0) {
          handler({ type: "error", message: "そのコードのルームが見つかりません（ホストが退室した可能性があります）" });
          teardown();
          return;
        }
        if (sides.guest > 0) {
          handler({ type: "error", message: "このルームは満員です" });
          teardown();
          return;
        }
      }
      announced = true;
      void ch.track({ side: mySide });
      handler({ type: "joined", roomCode, side: mySide });
      return;
    }

    const nowPresent = mySide === "player" ? sides.guest > 0 : sides.host > 0;
    if (nowPresent && !peerPresent) {
      peerPresent = true;
      handler({ type: "peerJoined" });
    } else if (!nowPresent && peerPresent) {
      peerPresent = false;
      handler({ type: "peerLeft" });
    }
  };

  ch.on("presence", { event: "sync" }, evaluatePresence)
    .on("broadcast", { event: "relay" }, (message) => {
      // supabase-jsのbroadcastイベントは { type, event, payload } 形式で届く
      const envelope = message as { payload?: unknown };
      handler({ type: "relay", payload: envelope.payload ?? null });
    })
    .subscribe((status) => {
      if (channel !== ch) return;
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        handler({ type: "error", message: "対戦サーバー（Supabase Realtime）に接続できません。ネットワークとSupabase設定を確認してください" });
      } else if (status === "CLOSED" && announced) {
        handler({ type: "error", message: "対戦サーバーとの接続が切れました。ロビーから同じコードで再参加すると復帰できます" });
      }
      // SUBSCRIBED後の在室確定はpresenceのsyncイベント（evaluatePresence）が行う
    });
}

export const onlineClient = {
  setHandler(next: (message: ServerMessage) => void) {
    handler = next;
  },
  create() {
    if (!isOnlineConfigured()) {
      handler({ type: "error", message: NOT_CONFIGURED_MESSAGE });
      return;
    }
    connect(generateInviteCode(), "player");
  },
  join(roomCode: string) {
    if (!isOnlineConfigured()) {
      handler({ type: "error", message: NOT_CONFIGURED_MESSAGE });
      return;
    }
    const code = normalizeInviteCode(roomCode);
    if (!isValidInviteCode(code)) {
      handler({ type: "error", message: "ルームコードの形式が正しくありません（英数字6桁）" });
      return;
    }
    connect(code, "cpu");
  },
  relay(payload: unknown) {
    void channel?.send({ type: "broadcast", event: "relay", payload });
  },
  close() {
    teardown();
  },
};
