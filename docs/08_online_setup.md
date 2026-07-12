# オンライン対戦セットアップ手順（Netlify + Supabase）

## 構成の概要

- **フロントエンド**: Netlify（静的ホスティング。Nodeサーバーは使わない）
- **通信**: Supabase Realtime の broadcast（メッセージ中継）+ presence（在室検知）
- **アーキテクチャ**: ホスト権威型
  - ルーム作成者（P1）のブラウザがゲームエンジンを実行する唯一の「正」
  - 参加者（P2）は「このカードを出したい」という操作を送るだけで、
    HP・手札・ターンはP1側のエンジンが検証・更新した結果を受け取って表示する
  - P2の手札はP1から配信される状態に**含まれない**（枚数のみ共有）ため、
    通信を覗いても相手の手札は見えない

> 旧実装（NodeのWebSocket中継サーバー `server/onlineRelay.mjs`）は
> Netlifyで動かせないため撤去し、通信層（src/online/onlineClient.ts）だけを
> Supabase Realtimeに置き換えた。ゲーム進行ロジック（useGameStore）は無変更。

## 1. Supabaseプロジェクトの作成

1. https://supabase.com にサインアップし、「New project」でプロジェクトを作成する
   （リージョンは Tokyo (ap-northeast-1) 推奨）。
2. Project Settings → API を開き、以下の2つを控える:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

現行構成では**テーブル作成・認証設定は不要**（Realtimeのbroadcast/presenceは
デフォルトで利用可能）。anonキーは公開前提のキーであり、DBを使っていないため
これだけで安全に動作する。

## 2. ローカルでの動作確認

```bash
cp .env.example .env
# .env に手順1で控えた2つの値を記入する
npm run dev
```

1. ブラウザを2つ（例: 通常ウィンドウとシークレットウィンドウ）で開く
2. 両方でタイトル →「🌐 2人対戦（オンライン）」
3. 片方で「新しいルームを作る」→ 表示された6桁コードをもう片方で入力して「参加」
4. 両者がキャラクターを選んで「準備完了」→ 対戦が始まれば成功

## 3. Netlifyへのデプロイ

1. GitHub等にリポジトリをpushし、Netlifyで「Import from Git」
   （`netlify.toml` にビルドコマンド `npm run build` と公開ディレクトリ `dist` を設定済み）
2. Site settings → Environment variables に以下を追加:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy を実行。以後はpushのたびに自動デプロイされる。

環境変数を設定しない場合でも、CPU戦・同一端末の2人対戦・トーナメント等の
既存機能はすべてそのまま動作する（オンラインボタンだけが設定を促すエラーを出す）。

## 4. エラー・切断時の挙動

| 状況 | 挙動 |
|---|---|
| Supabase未設定 | ルーム作成/参加時に設定手順への案内を表示 |
| 存在しないコードで参加 | 「ルームが見つかりません」 |
| ルーム満員（3人目） | 「このルームは満員です」 |
| 相手の退室・切断 | 「相手との接続が切れました」を表示（presenceで検知） |
| Realtime接続断 | エラー表示。ロビーから同じコードで再参加すると復帰できる |

## 5. テスト方法

- ロジック: `npm run test`（招待コードの生成・正規化テストを含む57件）
- 通信を伴う結合確認: 手順2の2ブラウザ手順を実施
  - 追加観点: 対戦中に片方のタブを閉じる → もう片方に切断エラーが出ること
  - 追加観点: P2側のDevToolsでネットワークを見ても、P1の手札内容が届いていないこと

## 6.（任意）サーバー権威型への強化資材

現行のホスト権威型は「P2はチート不可能・P1（ホスト）は信頼する」というモデルで、
コミュニティ内対戦には十分だが、ホストの改ざんまで防ぐ完全なサーバー権威型に
強化するための資材を同梱してある（**現行構成では未使用**）:

- `supabase/migrations/20260711000000_online.sql`
  … rooms / room_players / matches（ゲーム状態の正）/ match_actions（監査ログ）と
  RLS（クライアントはmatchesに書き込み不可）の定義
- `supabase/functions/match-move/index.ts`
  … 全操作を検証してDBを更新するEdge Function（ゲームエンジンをサーバー側で実行）
- `npm run sync:edge` … src/core をEdge Function用にコピーするスクリプト

導入する場合は、SQLをSupabaseのSQL Editorで実行し、Anonymous Sign-insを有効化、
`supabase functions deploy match-move` でデプロイした上で、
通信層をbroadcastからmatchesテーブル購読へ切り替える改修を行う。
