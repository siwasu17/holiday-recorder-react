/**
 * CSS変数から値を取得するユーティリティ
 * @param variableName CSS変数の名前（例: '--color-text-main'）
 * @returns 変数の値
 */
export const getCssVariableValue = (variableName: string): string => {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
}
