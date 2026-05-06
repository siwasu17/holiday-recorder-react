## Why

ダークモード時に現在のカテゴリボタンの色（パステルカラー）が明るすぎて背景に対して浮いてしまい、視認性やデザインの整合性が低下しているため。ダークモードに適した落ち着いた色を導入し、ユーザー体験を向上させる。

## What Changes

- `Category` 型に `darkColor` プロパティを追加。
- `CATEGORIES` 定数に各カテゴリのダークモード用カラーを追加。
- UIコンポーネント（`CategoryGrid`, `TimeTracker` 等）において、現在のテーマに応じて適切な色（`color` または `darkColor`）を選択して表示するロジックを実装。

## Capabilities

### New Capabilities
- `theme-aware-category-colors`: テーマ（ライト/ダーク）に応じてカテゴリの色を動的に切り替える機能。

### Modified Capabilities
- なし

## Impact

- `src/types/index.ts`: `Category` インターフェースの変更。
- `src/constants/index.ts`: `CATEGORIES` 配列のデータ構造変更。
- `src/components/CategoryGrid.tsx`: テーマに基づいた色の適用。
- `src/views/TimeTracker.tsx`: タイムスロット表示における色の適用。
- `src/components/ActivityEditModal.tsx`: モーダル内でのカテゴリ表示色の適用。
