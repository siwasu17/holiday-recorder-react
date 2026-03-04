# Tailwind CSS v4 移行計画

## 1. 目的
プロジェクト内の個別の CSS ファイルを廃止し、Tailwind CSS v4 を導入してユーティリティクラスによるスタイリングに移行する。Vite プラグイン (`@tailwindcss/vite`) を活用し、設定ファイルを最小限に抑えたモダンでメンテナンス性の高い構成を実現する。

## 2. フェーズ 1: 導入と初期設定
1.  **パッケージのインストール**
    - `tailwindcss`
    - `@tailwindcss/vite`
2.  **Vite 設定の更新**
    - `vite.config.ts` に `@tailwindcss/vite` プラグインを追加。
3.  **メイン CSS の書き換え**
    - `src/index.css` の先頭で Tailwind をインポート。
    ```css
    @import "tailwindcss";
    ```

## 3. フェーズ 2: テーマと変数の定義
`src/index.css` の `@theme` ブロック内で、既存の CSS 変数を Tailwind のカスタムプロパティとして定義する。

- **カラーシステム**: `main`, `sub`, `border`, `accent-soft`, `bg` など。
- **レイアウト**: `header-height` (52px) など。

```css
@theme {
  --color-main: #4a4945;
  --color-sub: #8c8b85;
  --color-border: #e8e6df;
  --color-accent-soft: #f0f3f5;
  --color-bg: #fcfaf2;
  --spacing-header: 52px;
}
```

## 4. フェーズ 3: コンポーネントの移行順序
以下の順序で、個別の CSS を Tailwind クラスへ置き換える。

1.  **Global/Layout**: `App.tsx`, `index.css` (残りのグローバルスタイル)
2.  **Components**:
    - `TimeTrackerToolbar.tsx`
    - `TimeTrackerActionFooter.tsx`
    - `ActivityEditModal.tsx`
3.  **Views**:
    - `TimeTracker.tsx`
    - `ActivityStats.tsx`

## 5. フェーズ 4: クリーンアップ
1.  すべての個別の `.css` ファイルを削除。
2.  TSX ファイル内の CSS インポート文を削除。
3.  `package.json` から不要になった CSS 関連の設定（もしあれば）を確認。

## 6. 注意点
- **複雑なセレクタ**: `TimeTracker.css` のような Grid レイアウトや擬似クラス（`:hover`, `:last-child` 等）は、Tailwind のモディファイアを使用して慎重に移行する。
- **レスポンシブ**: 必要に応じて `sm:`, `md:` などのプレフィックスを活用する。
