## Context

現在、PWAのアセット生成には `@vite-pwa/assets-generator` を使用しており、`pwa-assets.config.ts` で `minimal2023Preset` が適用されています。しかし、この設定にはダークモード用の背景色が含まれていないため、iOS等のデバイスでダークモード時に適切なスプラッシュ画面が表示されません。また、`vite.config.ts` のマニフェスト設定もライトモード固定の `theme_color` になっています。

## Goals / Non-Goals

**Goals:**
- iOSおよびAndroidにおいて、システムのダークモード設定に応じたスプラッシュ画面が表示されるようにする。
- `pwa-assets-generator` を利用して、ダークモード用の Apple touch startup images を自動生成する。
- 起動時の背景色のフラッシュ（白飛び）を解消する。

**Non-Goals:**
- PWAアセット以外のアイコン（favicon等）のダークモード対応（既に meta タグ等で対応済みの場合は対象外）。
- アプリ起動後の動的なテーマ切り替えロジックの変更。

## Decisions

### 1. `pwa-assets.config.ts` の拡張
`minimal2023Preset` をベースにしつつ、`dark` オプションを追加してダークモード用の背景色を定義します。
- **選択**: `dark: { backgroundColor: '#171717' }` を追加。
- **理由**: iOSは `apple-touch-startup-image` の media query をサポートしており、これによりテーマに応じた画像を出し分けられるため。

### 2. `vite.config.ts` のマニフェスト更新
マニフェストの `theme_color` と `background_color` を調整します。
- **選択**: `theme_color` はライトモードのデフォルト（`#fcfaf2`）を維持しつつ、`index.html` 側の meta タグ（`media="(prefers-color-scheme: ...)"`）で補完する。
- **注意**: マニフェストファイル自体は現在 media query をサポートしていないため、iOS/Androidの挙動を考慮して最適なデフォルト値を選択します。

### 3. アセットの再生成
設定変更後、`pnpm generate-pwa-assets` を実行して最新のアセットを `public/` に生成します。

## Risks / Trade-offs

- **[Risk]** デバイスやブラウザのバージョンによっては、マニフェストの `background_color` が優先され、ダークモード設定が無視される可能性がある。
  - **Mitigation**: `index.html` に media query 対応の `theme-color` meta タグを既に配置しているため、これを確実に機能させる。
- **[Risk]** アセット生成により、`public/` 配下のファイルが多数更新される。
  - **Mitigation**: 必要なファイルのみが生成・更新されることを確認する。
