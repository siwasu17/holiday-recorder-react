## 1. 設定の更新

- [x] 1.1 `pwa-assets.config.ts` を更新し、`dark` オプション（背景色: #171717）を追加する
- [x] 1.2 `vite.config.ts` の `VitePWA` 設定を更新し、`manifest` に `background_color: '#fcfaf2'` を明示的に追加する（ライトモード用）

## 2. アセットの生成

- [x] 2.1 `pnpm generate-pwa-assets` コマンドを実行し、ダークモード対応のスプラッシュ画像を生成する

## 3. HTMLテンプレートの更新

- [x] 3.1 `index.html` に、生成されたダークモード対応のスプラッシュ画像用の `link` タグ（`apple-touch-startup-image`）が適切に反映されているか確認し、必要に応じて追加・修正する

## 4. 動作確認と検証

- [x] 4.1 生成された `manifest.webmanifest` に適切な色が設定されているか確認する
- [x] 4.2 `public/` ディレクトリにダークモード用の画像アセットが生成されているか確認する
