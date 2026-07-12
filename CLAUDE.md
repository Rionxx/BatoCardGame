# プロジェクト概要
罵倒デッキ構築カードゲーム（オリジナルIP、実在人物の模倣なし）
- 技術スタック: React + TypeScript + Vite + Zustand + Vitest

# 開発フェーズと成果物
- docs/01_planning.md          : 企画
- docs/02_requirements.md      : 要件定義
- docs/03_prototype_*.md       : プロトタイプ検証
- docs/04_design.md            : 設計（状態遷移・ディレクトリ構成）
- docs/04_balance_rules.md     : バランス数値の基準値（実装から分離）
- docs/06_balance_report.md    : 自動バランスシミュレーション結果
- docs/07_release_checklist.md : リリースチェックリスト
- docs/backlog.md              : 次バージョンのバックログ
- data/cards_schema.json       : カードのJSON Schema定義

# 設計原則
- ロジック(src/core/)とUI(src/components/)を分離する
- カードデータ(src/core/data/)とバランス数値(docs/04_balance_rules.md)を分離する
- 新機能追加時は必ずPlan Modeで方針提示→承認後に実装
- ビジュアル素材は完全オリジナル（既存作品の画像・絵柄の複製は取り込まない）
- キャラクター名（罵尻ロマ子ほか）はユーザー指定によるコミュニティ向け
  ファン企画としての使用（2026-07-06決定）。名前の権利・本人許諾はユーザー管理とし、
  一般公開・配布の前に権利者/本人の許諾確認を必須とする（docs/backlog.md参照）
- 各フェーズの成果物ができた時点で、作成者からレビュアーに役割を
  切り替えたレビューゲートを実施し、Go/No-Goを明言してから次のフェーズに進む

# 既知の未検証事項
- 実際の人間によるプレイテストは未実施（docs/backlog.md 最優先項目を参照）。
  公開前に必ず実施すること。

# コマンド
npm run dev / npm run test / npm run build / npm run simulate
