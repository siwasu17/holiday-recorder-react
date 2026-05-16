## Context

`ActivityStats` コンポーネントでは、Chart.js のテキスト色やグリッド線の色を `getCssVariableValue` を通じてCSS変数から取得している。しかし、`useTheme` フックによるテーマの切り替え（`.dark` クラスの付与）は `useEffect` 内で行われるため、テーマ変更直後のレンダリングではまだDOMに新しいクラスが適用されておらず、古い色の値が取得されてしまう。その結果、グラフの軸ラベルやグリッド線が古いテーマのまま残ってしまう問題が発生している。

## Goals / Non-Goals

**Goals:**
- テーマ切り替え時に、Chart.js のテキスト色とグリッド線の色が即座かつ確実に更新されるようにする。
- CSS変数を色の定義元（Source of Truth）として維持しつつ、Reactのステート管理と同期させる。

**Non-Goals:**
- Chart.js 以外のライブラリのテーマ対応。
- パフォーマンスへの過度な影響を与えるような、頻繁な再レンダリング。

## Decisions

1. **React Compiler による自動最適化の活用**:
   手動の `useMemo` は使用せず、React Compiler の自動最適化に任せる。`chartOptions` はコンポーネント内で定義し、依存するステート（`isDark` や `chartColors`）が変更された際に自動的に再計算・再レンダリングされるようにする。

2. **テーマ適用後の色再取得ロジックの導入**:
   `isDark` の変更を検知する `useEffect` を導入し、`requestAnimationFrame` を使用してDOMへのクラス適用（`.dark` の付与/削除）が完了した後に `getCssVariableValue` を再度呼び出し、チャート用の色ステート（`chartColors`）を更新する。

3. **Chart.js の `options` への色ステート適用**:
   ハードコードされた色やレンダリング時の直接取得ではなく、上記 `chartColors` ステートから取得した値を `chartOptions` に適用する。これにより、テーマ変更に伴うDOMの更新が確実にチャートに反映される。

## Risks / Trade-offs

- **[Risk]** テーマ切り替え時に一瞬古い色が表示される可能性がある（フラッシュ）。
  - **Mitigation**: `requestAnimationFrame` を使用することで、次の描画フレームで即座に修正されるようにする。また、可能であれば `isDark` から直接色を判定するフォールバックも検討する。

- **[Trade-off]** CSS変数とJSロジックの両方で色を管理することによる複雑性。
  - **Decision**: CSS変数を正解としつつ、Chart.js のようなJS側での指定が必要なものに対しては、変更検知ベースで同期する手法を採用する。
