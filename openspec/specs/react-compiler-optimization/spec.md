## ADDED Requirements

### Requirement: React Compiler によるビルドの最適化
システムは、ビルドプロセスにおいて React Compiler を使用してコンポーネントを自動的に最適化しなければならない。

#### Scenario: ビルド時の最適化の適用
- **WHEN** `npm run build` を実行したとき
- **THEN** React Compiler が適用され、手動の `useMemo` や `useCallback` なしで最適化されたアーティファクトが生成される

### Requirement: ESLint による React Compiler 規約の検証
開発環境において、ESLint が React Compiler のルール（規約）に準拠していることを検証しなければならない。

#### Scenario: 非準拠コードの検出
- **WHEN** React Compiler の規約に違反するコード（フックの不正な使用など）を記述したとき
- **THEN** ESLint がエラーまたは警告として検出し、開発者に通知する
