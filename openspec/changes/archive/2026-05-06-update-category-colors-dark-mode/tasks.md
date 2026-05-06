## 1. データモデルと定数の更新

- [x] 1.1 `src/types/index.ts` の `Category` 型に `darkColor: string` を追加
- [x] 1.2 `src/constants/index.ts` の `CATEGORIES` 配列に各カテゴリの `darkColor` 定義を追加

## 2. UIコンポーネントの修正

- [x] 2.1 `src/components/CategoryGrid.tsx` でテーマに応じた背景色とテキスト色の切り替えを実装
- [x] 2.2 `src/views/TimeTracker.tsx` でタイムスロット内のアクティビティ表示色をテーマに応じて切り替えるよう修正
- [x] 2.3 `src/components/ActivityEditModal.tsx` で選択中のカテゴリ表示色をテーマに応じて切り替えるよう修正

## 3. 検証

- [x] 3.1 ダークモード時にカテゴリボタンの色が落ち着いた深みのある色に変わることを確認
- [x] 3.2 ダークモード時にカテゴリ内のテキストが読みやすくなっていることを確認
- [x] 3.3 ライトモード時の色が以前と変わらずパステルカラーであることを確認
