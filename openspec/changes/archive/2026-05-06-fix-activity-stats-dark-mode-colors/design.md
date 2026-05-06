## Context

現在の `ActivityStats` は、DBから取得したデータを元にチャート用のデータセットを生成し、それを `useState` で保持している。この生成ロジックが `useEffect` の中にあるため、テーマが変更されても配色が更新されない。また、サービス層の `getChartDatasets` がライトモード固定の色（`category.color`）を参照している。

## Goals / Non-Goals

**Goals:**
- テーマ切り替えに即座に反応するグラフ配色。
- 統計データ計算ロジックと、チャート用データ生成ロジックの分離。
- `statsService.getChartDatasets` の汎用化。

**Non-Goals:**
- グラフライブラリ（Chart.js）自体のアップグレードや変更。
- 新しいグラフタイプの追加。

## Decisions

### 1. サービス層のインターフェース変更
`statsService.getChartDatasets` に `isDark` 引数を追加し、配色を選択できるようにする。

### 2. コンポーネントの状態管理の変更
- 変更前: `useEffect` 内でチャートデータを生成し `useState` に保存。
- 変更後:
  - `stats` (計算済みの統計データ) のみを `useState` で管理。
  - `chartData` は `useMemo` で `stats` と `theme` に依存させて動的に生成する。

### 3. ロジックの分離
データ取得と統計計算は非同期（`useEffect`）で行い、その結果得られた静的な数値データを元に、同期的な `useMemo` で「見た目（配色）」を適用する。これにより、テーマ変更時に不要なDBアクセスが発生しなくなる。

## Risks / Trade-offs

- **[Risk]** メモリ使用量の増加（統計データとチャートデータの両方を保持するため）。
  - **Mitigation**: 統計データ自体は軽量なオブジェクトであり、チャートデータも `useMemo` によって適切に破棄・再生成されるため、現代のブラウザ環境では問題にならない。
- **[Risk]** Chart.js のアニメーションがテーマ切り替えのたびに発生する。
  - **Mitigation**: `options` でアニメーションを微調整するか、ユーザー体験として「色の変化」を許容する。
