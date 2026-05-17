## 1. テーマ変数の定義と設定

- [x] 1.1 `src/index.css` にアクションボタン用のテーマ変数（`--color-primary`, `--color-error` 等）を追加する
- [x] 1.2 ダークモード用の配色（`.dark` クラス内）を定義する

## 2. コンポーネントの修正

- [x] 2.1 `src/components/ActivityEditModal.tsx` の削除ボタンのハードコードされた色を `bg-error` に置換する
- [x] 2.2 `src/components/ActivityEditModal.tsx` の保存ボタンのハードコードされた色を `bg-primary` に置換する
- [x] 2.3 `src/components/ActivityEditModal.tsx` のキャンセルボタンの配色（`bg-accent-soft`）がダークモードで適切か確認し、必要なら調整する

## 3. 全体的な調整と確認

- [x] 3.1 他のコンポーネント（`TimeTrackerToolbar`, `TimeTrackerActionFooter`等）でハードコードされた色が残っていないか再確認し、あれば置換する
- [x] 3.2 ライトモードとダークモードの両方で、ボタンの視認性とホバー時の挙動が正しいことを確認する
