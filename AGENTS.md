# Project Overview

- **スタック**: TypeScript + React 19 (Vite)
- **コンパイラ**: React Compiler を導入済み。手動の `memo`, `useMemo`, `useCallback` は原則不要。
- **スタイリング**: Tailwind CSS 4
- **ストレージ**: Dexie (IndexedDB) によるブラウザ側データ管理
- **機能**: `vite-plugin-pwa` による PWA (Progressive Web App) 対応

# Commands

- 依存関係のインストール: `pnpm install`
- 開発サーバーの起動: `pnpm dev`
- ビルド: `pnpm build`
- Lint: `pnpm lint`
- 型チェック: `pnpm type-check`
- フォーマット: `pnpm format`

# Code Style

- **ファイル命名**: コンポーネントは PascalCase (`ActivityEditModal.tsx`)、ユーティリティなどは kebab-case (`my-util.ts`)。ただし、React のフックは `useMyHook.ts` のように camelCase とします。
- **コンポーネント**: フックを使用した関数コンポーネント。
- **最適化**: React Compiler により自動最適化されるため、パフォーマンス最適化のための依存関係配列の管理や手動メモ化は最小限にする。
- **状態管理**: React Context API とフック（例: `useActivityManager`）を優先。
- **ロジック**: `src/services/` や `src/hooks/` に集約。

# Git

- **コミットメッセージ**: Conventional Commits 準拠 (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
- **ブランチ名**: `feature/xxx`, `fix/xxx`
- **PRの要件**: 作成前に必ず Lint と型チェックを通すこと。

# Boundaries

- **セキュリティ**: `.env*` ファイルを変更・コミットしない。
- **環境**: ベンダー固有のファイルや自動生成ファイル（例: `pnpm-lock.yaml`）を直接編集しない。`pnpm-lock.yaml` は `pnpm install` などで更新し、リポジトリにコミットすること。
- **データベース**: 確認なしに破壊的なスキーマ変更を行わない。
- **本番環境**: 本番環境に関連する設定（例: `vite.config.ts`, `.github/workflows/`）を変更する場合は必ず確認を求める。
