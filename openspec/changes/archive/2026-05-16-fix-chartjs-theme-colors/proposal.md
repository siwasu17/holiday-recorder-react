## Why

ライトモードとダークモードを切り替えた際に、活動記録グラフ（Chart.js）のテキスト（軸ラベル、タイトル、凡例）やグリッド線の色が正しく更新されない。これは、レンダリング時に `getCssVariableValue` を使用してCSS変数から値を取得しているが、テーマ切り替え時にDOMのクラス変更が完了する前に値を取得してしまっている、あるいはChart.jsへの反映が同期できていないことが原因と考えられる。

## What Changes

- `ActivityStats.tsx` において、Chart.js の `options` に渡す色がテーマ変更に追随するように修正する。
- テーマ変更後に最新のCSS変数を取得して再描画を促す仕組み、または `isDark` フラグに基づいて明示的に色を選択するロジックを導入する。
- React Compiler による自動的な最適化を活用し、手動の `useMemo` を使わずに効率的な再描画を実現する。

## Capabilities

### New Capabilities
- `chartjs-theme-sync`: Chart.js のテキストおよびグリッド線の色がテーマ切り替えに即座に追随する機能。

### Modified Capabilities
- `theme-aware-stats-chart`: 既存のグラフ配色機能において、テキストやグリッド線の同期漏れを解消する。

## Impact

- `src/views/ActivityStats.tsx`: Chart.js のオプション生成ロジックと色取得方法の改善。
