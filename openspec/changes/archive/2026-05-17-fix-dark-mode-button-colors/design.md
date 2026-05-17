## Context

現在、`ActivityEditModal.tsx` において、保存ボタン（Primary）と削除ボタン（Error）の背景色が Tailwind の任意のカラー値（`bg-[#007bff]`, `bg-[#ff4d4f]`）としてハードコードされています。
これらはライトモード向けの色味であり、ダークモードでは彩度が高すぎて周囲の暗いUI要素から浮いて見えます。
プロジェクトは既に Tailwind CSS と CSS 変数を用いたテーマ管理を導入しているため、これを利用してテーマ対応を行います。

## Goals / Non-Goals

**Goals:**
- 保存・削除・キャンセルなどのアクションボタンの色をテーマ（ライト/ダーク）に応じて切り替わるようにする。
- ダークモードにおいて、ボタンの視認性を確保しつつ、目に優しく馴染む配色を採用する。
- ボタンのホバー状態などもテーマに合わせて適切に定義する。

**Non-Goals:**
- ボタンの形状やレイアウトの大幅な変更。
- アクションボタン以外の（カテゴリグリッド内の）ボタンの配色変更（これらは既にカテゴリ色として管理されている）。

## Decisions

### 1. 新しいテーマ変数の定義
`src/index.css` の `@theme` ブロックに、アクションボタン用の変数を追加します。

```css
@theme {
  /* ...既存の定義... */
  --color-primary: #007bff;
  --color-primary-hover: #0056b3;
  --color-error: #ff4d4f;
  --color-error-hover: #d9363e;
}

.dark {
  /* ...既存の定義... */
  --color-primary: #3791ff;
  --color-primary-hover: #5da5ff;
  --color-error: #ff6b6b;
  --color-error-hover: #ff8585;
}
```

### 2. ActivityEditModal での変数利用
`ActivityEditModal.tsx` 内の `className` を以下のように修正します。

- 削除ボタン: `bg-[#ff4d4f]` -> `bg-error hover:bg-error-hover`
- 保存ボタン: `bg-[#007bff] hover:bg-[#0056b3]` -> `bg-primary hover:bg-primary-hover`

### 3. セカンダリボタン（キャンセル等）の調整
既存の `bg-accent-soft` を使用しているボタンについても、ダークモードでのコントラストを確認し、必要に応じて微調整します。

## Risks / Trade-offs

- **[Risk]** ダークモードでの配色が、ユーザーの期待する「警告色（赤）」や「決定色（青）」のイメージから離れすぎる。
  - **Mitigation** 彩度は落としつつも、色の系統は維持し、アクセシビリティ（コントラスト比）を確認しながら調整します。
- **[Risk]** 他のコンポーネントで同様のボタンを使用している箇所を見落とす。
  - **Mitigation** プロジェクト全体を検索し、ハードコードされたボタン色をすべて置換します。
