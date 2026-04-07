/**
 * JWT トークンの有効性を検証する。
 * ペイロードの `exp` クレームをデコードし、現在時刻と比較する。
 * トークンのフォーマットが不正・期限切れ・`exp` 欠損のいずれかで false を返す。
 */
export function isTokenValid(token: string): boolean {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
