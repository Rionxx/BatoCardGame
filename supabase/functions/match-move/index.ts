// Edge Function: match-move
// ゲーム進行の唯一の書き込み口。クライアントは操作(op)を送るだけで、
// 検証と状態更新はすべてここ（サーバー側）で行う。
//
// デプロイ前に `npm run sync:edge` を実行して src/core を _shared/core にコピーすること。
// （ゲームエンジンをフロントと共有し、ロジックの二重実装を避ける）
//
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { beginBattle } from "../_shared/core/engine/turn.ts";
import { playCard } from "../_shared/core/engine/resolveCard.ts";
import { drawCards, startCpuTurn, startTurn } from "../_shared/core/engine/state.ts";
import { getInitialDeck } from "../_shared/core/run/runProgress.ts";
import { getCharacter } from "../_shared/core/data/characters.ts";

const TIMEOUT_SECONDS = 90; // 相手の応答がこの秒数途絶えたらタイムアウト勝ちを申請できる

type Side = "player" | "cpu";

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const respond = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    // 呼び出しユーザーの特定（JWT検証）
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
    );
    const { data: userData, error: userError } = await authClient.auth.getUser();
    if (userError || !userData.user) return respond({ error: "unauthorized" }, 401);
    const userId = userData.user.id;

    // 状態の読み書きはservice_role（RLSバイパス）で行う
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const body = await req.json();

    if (body.op === "start") {
      const { data: players } = await admin
        .from("room_players")
        .select("player_id, seat, character_id")
        .eq("room_id", body.roomId)
        .order("seat");
      if (!players || players.length !== 2) return respond({ error: "room-not-ready" }, 400);
      const p1 = getCharacter(players[0].character_id);
      const p2 = getCharacter(players[1].character_id);
      const state = beginBattle(getInitialDeck(p1.id), getInitialDeck(p2.id), p2.weakness, {
        playerWeakness: p1.weakness,
        labels: { player: `P1(${p1.name})`, cpu: `P2(${p2.name})` },
      });
      const { data: match, error } = await admin
        .from("matches")
        .insert({ room_id: body.roomId, game_state: state, current_side: "player" })
        .select()
        .single();
      if (error) return respond({ error: error.message }, 500);
      await admin.from("rooms").update({ status: "playing" }).eq("id", body.roomId);
      return respond({ match });
    }

    // 以降のopはmatchIdが必要
    const { data: match } = await admin.from("matches").select("*").eq("id", body.matchId).single();
    if (!match) return respond({ error: "match-not-found" }, 404);
    if (match.status !== "playing") return respond({ error: "match-finished" }, 400);

    // 呼び出しユーザーがどちらの席かを特定する
    const { data: seatRow } = await admin
      .from("room_players")
      .select("seat")
      .eq("room_id", match.room_id)
      .eq("player_id", userId)
      .single();
    if (!seatRow) return respond({ error: "not-a-participant" }, 403);
    const mySide: Side = seatRow.seat === 1 ? "player" : "cpu";
    const state = match.game_state;

    if (body.op === "play_card" || body.op === "end_turn") {
      if (match.current_side !== mySide) return respond({ error: "not-your-turn" }, 400);
    }

    let currentSide: Side = match.current_side;
    if (body.op === "play_card") {
      const actor = mySide === "player" ? state.player : state.cpu;
      const card = actor.hand.find((c: any) => c.id === body.cardId);
      if (!card) return respond({ error: "card-not-in-hand" }, 400);
      const result = playCard(state, mySide, card);
      if (!result.ok) return respond({ error: result.reason ?? "invalid-move" }, 400);
    } else if (body.op === "end_turn") {
      if (mySide === "player") {
        startCpuTurn(state);
        currentSide = "cpu";
      } else {
        startTurn(state);
        drawCards(state.player, 1);
        drawCards(state.cpu, 1);
        currentSide = "player";
      }
    } else if (body.op === "resign") {
      state.winner = mySide === "player" ? "cpu" : "player";
    } else if (body.op === "claim_timeout") {
      // 相手の最終アクセスがTIMEOUT_SECONDS以上前なら自動敗北にできる
      const opponentSeat = seatRow.seat === 1 ? 2 : 1;
      const { data: opp } = await admin
        .from("room_players")
        .select("last_seen")
        .eq("room_id", match.room_id)
        .eq("seat", opponentSeat)
        .single();
      const lastSeen = opp ? new Date(opp.last_seen).getTime() : 0;
      if (Date.now() - lastSeen < TIMEOUT_SECONDS * 1000) return respond({ error: "opponent-still-connected" }, 400);
      state.winner = mySide;
    } else {
      return respond({ error: "unknown-op" }, 400);
    }

    const finished = state.winner !== null;
    const { data: updated, error: updateError } = await admin
      .from("matches")
      .update({
        game_state: state,
        current_side: currentSide,
        status: finished ? "finished" : "playing",
        winner: finished ? state.winner : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", match.id)
      .select()
      .single();
    if (updateError) return respond({ error: updateError.message }, 500);

    await admin.from("match_actions").insert({ match_id: match.id, player_id: userId, action: body });
    if (finished) await admin.from("rooms").update({ status: "finished" }).eq("id", match.room_id);
    return respond({ match: updated });
  } catch (e) {
    return respond({ error: e instanceof Error ? e.message : "internal-error" }, 500);
  }
});
