## Context

現在のプロジェクトは React 19 と Vite を使用しており、手動でのメモ化によってパフォーマンスを最適化しています。React Compiler を導入することで、これらの最適化を自動化し、コードの複雑性を軽減します。

## Goals / Non-Goals

**Goals:**
- `babel-plugin-react-compiler` を Vite に統合し、自動最適化を有効にする。
- `eslint-plugin-react-compiler` を導入し、静的解析によって安全なコード記述を保証する。
- 開発者がパフォーマンスを気にすることなく、標準的な React コードを書ける環境を構築する。

**Non-Goals:**
- 既存の `useMemo` や `useCallback` の完全な削除（Compiler が導入されてもこれらは動作し続けますが、将来的に段階的に削除することを検討します）。
- 大規模なリファクタリング（コンパイラの導入に必要な最小限の変更に留めます）。

## Decisions

### 1. Vite への統合
Vite プラグイン `@vitejs/plugin-react` の `babel` オプションに `babel-plugin-react-compiler` を追加します。
- **理由**: Vite 環境において、Babel を介してコンパイラを適用するのが最も一般的で確実な方法であるため。
- **代替案**: `@vitejs/plugin-react-swc` への移行も考えられますが、既存の設定を維持するために Babel を選択します。

### 2. ESLint 設定
`eslint-plugin-react-compiler` を導入し、`eslint.config.ts` に設定を追加します。
- **理由**: コンパイラが期待する規約（Hooks のルールなど）に違反しているコードを早期に発見するため。

## Risks / Trade-offs

- **[Risk] コンパイラによる副作用**: コンパイラの自動変換により、予期せぬ再レンダリングや動作の変化が発生する可能性があります。
  - **Mitigation**: 開発サーバーでの動作確認を徹底し、必要に応じて `use no memo` ディレクティブを使用して特定のコンポーネントをオプトアウトします。
- **[Trade-off] ビルド時間の増加**: Babel プラグインを追加するため、ビルド時間がわずかに増加する可能性があります。
  - **Mitigation**: プロジェクトの規模がそれほど大きくないため、現時点では許容範囲内と判断します。
