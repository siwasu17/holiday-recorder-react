## Why

現状、`ActivityEditModal` における「削除」ボタンや「保存」ボタンの背景色がハードコードされており、ダークモード時でも明るい色がそのまま表示されています。これにより、ダークモードの落ち着いた配色の中でボタンが視覚的に「浮いて」しまい、UXを損なっています。テーマに合わせた適切な配色を導入することで、一貫性のあるデザインを実現します。

## What Changes

- テーマ（ライト/ダーク）に応じたボタン配色の定義を `index.css` に追加します。
- `ActivityEditModal` 内のハードコードされたボタン色を、テーマ変数を参照するように変更します。
- セカンダリボタン（キャンセル等）の配色も見直し、ダークモードでの視認性を向上させます。

## Capabilities

### New Capabilities
- `theme-aware-buttons`: ダークモードとライトモードの両方で最適な視認性とコントラストを提供する、テーマ対応ボタンコンポーネントのスタイリング定義。

### Modified Capabilities
- `dark-mode-ui`: 既存のダークモードUI定義に、アクションボタン（削除、保存等）の配色仕様を追加します。

## Impact

- `src/index.css`: 新しいカラー変数の追加。
- `src/components/ActivityEditModal.tsx`: ハードコードされた色の置換。
- `src/components/TimeTrackerToolbar.tsx`: 必要に応じてボタンのホバー色等の調整。
- `src/components/TimeTrackerActionFooter.tsx`: 必要に応じてボタンのホバー色等の調整。
