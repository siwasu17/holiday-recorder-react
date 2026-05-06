## Context

現在のアプリケーションはライトモードのみをサポートしており、Tailwind CSS v4を使用してスタイルが定義されている。`index.css` にてカスタムテーマ変数が定義されているが、ダークモード用の定義は存在しない。

## Goals / Non-Goals

**Goals:**
- ダークモードのサポート（CSS変数による切り替え）。
- OSの設定（prefers-color-scheme）への自動追従。
- ユーザーによる手動切り替え機能の提供。
- 設定のLocalStorageへの保存と復元。

**Non-Goals:**
- 複数のカラーテーマ（Red, Blueなど）のサポート。
- ランタイムでの動的な色変更（管理者画面などからの変更）。

## Decisions

### 1. テーマ切り替えの仕組み
- **選択**: `html` 要素に `.dark` クラスを付与するクラスベースのアプローチ。
- **理由**: Tailwind CSS v4の標準的な方法であり、コンポーネントレベルでの `dark:` プレフィックスによる柔軟な制御が可能になるため。

### 2. テーマ管理の状態
- **選択**: `ThemeContext` を作成し、アプリケーション全体でテーマ状態を共有する。
- **理由**: コンポーネントツリーのどこからでも現在のテーマを参照し、切り替えボタンを配置できるようにするため。

### 3. 色の定義 (Tailwind v4)
- **選択**: `index.css` の `@theme` ブロック内で、ダークモード用の変数を定義する。
- **実装イメージ**:
  ```css
  @theme {
    --color-bg-main: #fcfaf2;
    /* ... */
    @variant dark (&:where(.dark, .dark *))
  }
  
  .dark {
    --color-bg-main: #1a1a1a;
    /* ... ダークモード用の色定義 */
  }
  ```

### 4. 永続化
- **選択**: `localStorage` を使用してユーザーの選択を保存する。
- **キー**: `theme` (値: `light` | `dark` | `system`)

## Risks / Trade-offs

- **[Risk]** テーマ切り替え時のフラッシュ (FOUC: Flash of Unstyled Content)。
  - **Mitigation**: `index.html` の `head` 内でインラインスクリプトを実行し、レンダリング前に適切なクラスを付与する。
- **[Risk]** Chart.js などのサードパーティライブラリの対応。
  - **Mitigation**: テーマ変更を検知してグラフの色設定を動的に更新するロジックを追加する。
