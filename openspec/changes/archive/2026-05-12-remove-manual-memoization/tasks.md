## 1. カスタムフックのリファクタリング

- [x] 1.1 `src/hooks/useActivityManager.ts` から `useMemo`, `useCallback` を削除する

## 2. ビュー・コンポーネントのリファクタリング

- [x] 2.1 `src/views/ActivityStats.tsx` から `useMemo`, `useCallback` を削除する
- [x] 2.2 `src/views/TimeTracker.tsx` から `useMemo` を削除する
- [x] 2.3 `src/components/ActivityEditModal.tsx` から `useMemo` を削除する

## 3. 検証とクリーンアップ

- [x] 3.1 `npm run lint` を実行し、未使用のインポートやコード規約違反がないか確認する
- [x] 3.2 `npm run build` を実行し、ビルドが正常に完了することを確認する
- [x] 3.3 開発サーバー（`npm run dev`）でアプリケーションの動作（特にグラフの表示）を確認する
