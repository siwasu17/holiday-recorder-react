## Why

ダークモード導入後も、活動記録グラフ（Chart.js）で使用されているカテゴリの色がライトモード用のまま固定されており、背景に対して明るすぎて視認性が低下している。これを修正し、テーマに合わせて適切な色が適用されるようにする。

## What Changes

- `statsService.getChartDatasets` を拡張し、テーマ（ライト/ダーク）に応じた背景色を選択できるようにする。
- `ActivityStats` コンポーネントのデータフローを改善し、テーマの切り替えに即座に反応してグラフの色が更新されるようにする。

## Capabilities

### New Capabilities
- `theme-aware-stats-chart`: 統計グラフにおいて、テーマ（ライト/ダーク）に応じた配色（カテゴリ色、テキスト、グリッド）を動的に適用する機能。

### Modified Capabilities
- なし

## Impact

- `src/services/statsService.ts`: `getChartDatasets` メソッドの引数と戻り値の生成ロジック。
- `src/views/ActivityStats.tsx`: コンポーネント内のデータ管理ロジック（`useState`/`useEffect` から `useMemo` への移行を含む）。
