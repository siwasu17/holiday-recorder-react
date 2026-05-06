## 1. インフラストラクチャのセットアップ

- [x] 1.1 `index.html` の `head` にテーマ初期化スクリプトを追加（FOUC対策）
- [x] 1.2 `src/hooks/useTheme.ts` を作成し、テーマ管理ロジック（LocalStorage同期、システム設定検知）を実装
- [x] 1.3 `src/components/ThemeProvider.tsx` を作成し、アプリケーション全体をコンテキストで包む

## 2. スタイルの定義

- [x] 2.1 `src/index.css` にて `@variant dark` の定義を追加
- [x] 2.2 `src/index.css` にダークモード用のカラー変数を追加
- [x] 2.3 グローバルな背景色とテキスト色がテーマに応じて切り替わることを確認

## 3. UIコンポーネントの対応

- [x] 3.1 `src/App.tsx` のヘッダーにテーマ切り替えトグルボタンを追加
- [x] 3.2 `src/components/ActivityEditModal.tsx` のダークモード対応
- [x] 3.3 `src/components/CategoryGrid.tsx` のダークモード対応
- [x] 3.4 `src/components/TimeTrackerActionFooter.tsx` のダークモード対応
- [x] 3.5 `src/components/TimeTrackerToolbar.tsx` のダークモード対応
- [x] 3.6 `src/views/TimeTracker.tsx` と `src/views/ActivityStats.tsx` の全体のレイアウト調整

## 4. サードパーティライブラリの調整

- [x] 4.1 `src/views/ActivityStats.tsx` 内の Chart.js の配色をテーマに応じて動的に変更するよう修正

## 5. 検証

- [x] 5.1 手動による切り替えが正しく動作し、LocalStorageに保存されることを確認
- [x] 5.2 OSのテーマ設定変更にアプリが追従することを確認
- [x] 5.3 リロード時に選択したテーマが維持されていることを確認
