## Why

現在、PWAのスプラッシュ画面（ホーム画面からアプリを起動する際に表示される画面）がダークモードに対応していません。そのため、システムがダークモード設定であっても、起動時に一瞬明るい背景が表示されてしまい、ユーザー体験を損なっています。

## What Changes

- PWAの manifest において、ダークモードを考慮した `background_color` と `theme_color` の設定、または関連する最新の仕様への対応を行います。
- `pwa-assets-generator` の設定を更新し、iOS向けにダークモード対応のスプラッシュ画像（Apple touch startup images）を生成・適用します。
- `index.html` に、ダークモード時に適切なスプラッシュ画面を表示するための meta タグを追加します。

## Capabilities

### New Capabilities
- `pwa-splash-dark-mode`: ライトモードとダークモードの両方で、システムのテーマ設定に合わせた適切な背景色とアイコンを持つスプラッシュ画面を表示する機能。

### Modified Capabilities
- `dark-mode-ui`: スプラッシュ画面もダークモードUIの一環として定義に含める。

## Impact

- `vite.config.ts`: マニフェスト設定の変更。
- `pwa-assets.config.ts`: アセット生成設定の変更。
- `index.html`: スプラッシュ画面用 meta タグの追加。
- `public/`: 生成される画像アセットの更新。
