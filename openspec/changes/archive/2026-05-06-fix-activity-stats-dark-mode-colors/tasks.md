## 1. サービス層の修正

- [x] 1.1 `src/services/statsService.ts` の `getChartDatasets` に `isDark: boolean` 引数を追加
- [x] 1.2 `getChartDatasets` 内でテーマに応じた `backgroundColor` (color vs darkColor) を選択するよう修正

## 2. コンポーネントの修正 (ActivityStats.tsx)

- [x] 2.1 `StatsResult` を保持するための `useState` を追加
- [x] 2.2 `useEffect` を修正し、計算済みの `stats` のみを保存するように変更
- [x] 2.3 `createChartData` を `useMemo` または `useCallback` で `isDark` に依存するよう修正
- [x] 2.4 グラフ描画用のデータを `useMemo` で `stats` と `isDark` に依存させて生成するよう実装
- [x] 2.5 `Bar` コンポーネントに渡すデータを新しい `useMemo` の結果に置き換え

## 3. 検証

- [x] 3.1 ダークモード切り替え時にグラフの色が即座に `darkColor` に切り替わることを確認
- [x] 3.2 ライトモード切り替え時にグラフの色が `color` に切り替わることを確認
- [x] 3.3 テーマ切り替え時にネットワークリクエストやDBアクセスが発生していないことを確認
