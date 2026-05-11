## Why

React Compilerを導入することで、手動でのメモ化（useMemoやuseCallback）を不要にし、コンポーネントの再レンダリングを自動的に最適化します。これにより、開発者がパフォーマンスを気にすることなく、より簡潔でメンテナンス性の高いコードを書けるようになります。

## What Changes

- `babel-plugin-react-compiler` のインストールと Vite への統合。
- `eslint-plugin-react-compiler` の導入によるコンパイラに準拠したコードの保証。
- 既存のコンポーネントに対する React Compiler の適用（デフォルトで全ファイル適用を想定）。

## Capabilities

### New Capabilities
- `react-compiler-optimization`: React Compiler による自動的なレンダリングの最適化。これにより、明示的な `useMemo` や `useCallback` なしで効率的な UI 更新が可能になります。

### Modified Capabilities
なし

## Impact

- **依存関係**: `babel-plugin-react-compiler` および `eslint-plugin-react-compiler` が `devDependencies` に追加されます。
- **ビルド設定**: `vite.config.ts` で React プラグインの設定が変更されます。
- **静的解析**: `eslint.config.ts` に React Compiler 用のルールが追加され、互換性のないコードが検出されるようになります。
