## 1. 依存関係のインストール

- [x] 1.1 `babel-plugin-react-compiler` を開発依存関係としてインストールする
- [x] 1.2 `eslint-plugin-react-compiler` を開発依存関係としてインストールする

## 2. 設定の変更

- [x] 2.1 `vite.config.ts` の `react()` プラグイン設定に Babel オプション（React Compiler）を追加する
- [x] 2.2 `eslint.config.ts` に `eslint-plugin-react-compiler` のルール設定を追加する

## 3. 検証

- [x] 3.1 開発サーバーを起動（`npm run dev`）し、アプリケーションが正常に動作することを確認する
- [x] 3.2 プロジェクトのビルド（`npm run build`）を実行し、エラーなく完了することを確認する
- [x] 3.3 ESLint（`npm run lint`）を実行し、React Compiler のルールに基づいたチェックが行われることを確認する
