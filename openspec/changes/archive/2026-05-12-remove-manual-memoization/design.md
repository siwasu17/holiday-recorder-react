## Context

React 19 と React Compiler が導入済みの環境において、既存のコードには過去の最適化の名残である `useMemo` と `useCallback` が散在しています。これらは現在の環境では冗長であり、開発コストを増大させています。

## Goals / Non-Goals

**Goals:**
- 全ての `useMemo`, `useCallback` を安全に削除する。
- ESLint (react-compiler/react-compiler) で警告が出ない状態を維持する。

**Non-Goals:**
- `useEffect` の削除（これはコンパイラの対象外であるため維持します）。
- コンポーネントの構造自体の大きな変更。

## Decisions

### 1. ラッパーの機械的な削除
`useCallback(() => { ... }, [])` は `() => { ... }` に、`useMemo(() => value, [])` は `value` に書き換えます。
- **理由**: コンパイラが関数の同一性と値のキャッシュを自動で管理するため。

### 2. インポートのクリーンアップ
使用されなくなったフックのインポートを削除し、Linterエラーを防ぎます。

## Risks / Trade-offs

- **[Risk] 参照の同一性による副作用**: 外部ライブラリが `useCallback` で保護された参照に依存している場合、再描画が頻発する可能性がある。
  - **Mitigation**: Chart.js などの主要なコンポーネントにおいて、リファクタリング後に開発サーバーでチラつきやパフォーマンス低下がないか目視で確認する。
