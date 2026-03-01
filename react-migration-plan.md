### **Vue.jsからReactへの移行計画**

この計画は、既存の機能を維持しつつ、段階的に安全に移行を進めることを目的としています。

#### **フェーズ1: 準備と環境構築**

1.  **React関連ライブラリのインストール:**
    *   Reactのコアライブラリ (`react`, `react-dom`) をプロジェクトに追加します。
    *   TypeScriptで開発するための型定義 (`@types/react`, `@types/react-dom`) も追加します。
    *   ViteがReactをコンパイルするためのプラグイン (`@vitejs/plugin-react`) を追加します。

2.  **不要なVue関連ライブラリの洗い出し:**
    *   `package.json` を確認し、`vue`, `@vitejs/plugin-vue` など、Vueにのみ依存するライブラリをリストアップします。これらは最終的に削除しますが、この段階ではまだ消しません。

#### **フェーズ2: 設定ファイルの更新**

1.  **`vite.config.ts` の変更:**
    *   `import vue from '@vitejs/plugin-vue'` を削除し、`import react from '@vitejs/plugin-react'` を追加します。
    *   `plugins` 配列内の `vue()` を `react()` に置き換えます。

2.  **`tsconfig.json` の変更:**
    *   `compilerOptions` に `jsx: "react-jsx"` を追加し、TypeScriptコンパイラがJSX構文を正しく解釈できるようにします。

3.  **`eslint.config.ts` の変更:**
    *   Vue用のESLint設定を削除し、React用の設定（`eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` など）を追加します。これにより、Reactのコーディング規約に沿ったチェックが行えるようになります。

#### **フェーズ3: アプリケーションのエントリーポイントの変更**

1.  **`index.html` の修正:**
    *   Vueアプリのマウントポイントである `<div id="app"></div>` を、Reactアプリの標準的なマウントポイントである `<div id="root"></div>` に変更します。

2.  **`src/main.ts` の書き換え:**
    *   現在のVueインスタンスを作成しているコード (`createApp(App).mount('#app')`) を、Reactのレンダリングコードに書き換えます。
    *   具体的には、`ReactDOM.createRoot` を使って `root` 要素を取得し、そこに `<App />` コンポーネントをレンダリングする処理を記述します。

#### **フェーズ4: コンポーネントの書き換え（主要な作業）**

このフェーズでは、`.vue` ファイルを1つずつ `.tsx` (または `.jsx`) ファイルに変換していきます。小規模なコンポーネントから始め、徐々に大きなコンポーネントへ進めるのが安全です。

**変換方針:**

*   **ファイル構造:**
    *   `<template>`, `<script>`, `<style>` が一体となった `.vue` ファイルを、ロジックを記述する `.tsx` ファイルと、必要に応じてスタイルを記述する `.css` ファイル（またはCSS-in-JS）に分離します。
*   **コンポーネント:** `src/components/` 内のコンポーネントから着手します。
    *   例: `TimeTrackerToolbar.vue` → `TimeTrackerToolbar.tsx`
*   **ビュー:** 次に `src/views/` 内のビューコンポーネントを変換します。
    *   例: `TimeTracker.vue` → `TimeTracker.tsx`
*   **ルート:** 最後に、エントリーポイントである `App.vue` を `App.tsx` に変換します。

**具体的な変換作業の例 (`.vue` → `.tsx`):**

*   **テンプレート:** Vueのテンプレート構文は、JSX構文に書き換えます。`v-if` は三項演算子や `&&` を使い、`v-for` は `map()` メソッドを使います。
*   **リアクティブな状態:** `ref()` や `reactive()` は、Reactの `useState()` フックに置き換えます。
*   **ライフサイクル:** `onMounted` などのライフサイクルフックは `useEffect()` フックに置き換えます。
*   **Props:** Vueの `defineProps` は、Reactコンポーネントの関数引数 `props` として受け取るように変更します。
*   **イベント:** `emit` で行っていた子から親への通知は、親から子へコールバック関数を `props` として渡すことで実現します。

#### **フェーズ5: クリーンアップ**

1.  **Vue関連ライブラリの削除:**
    *   すべてのコンポーネントの移行が完了し、アプリケーションが正常に動作することを確認したら、フェーズ1でリストアップしたVue関連の依存ライブラリを `pnpm remove` コマンドで削除します。

2.  **不要なファイルの削除:**
    *   変換元の `.vue` ファイルをプロジェクトから削除します。
