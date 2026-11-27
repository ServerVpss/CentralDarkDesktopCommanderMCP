// Optional preference only: never store passwords or authentication tokens.
const KEY = "centraldark.mcp.remembered-email";
type EmailStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export function readRememberedEmail(storage?: EmailStorage): string {
  try { return (storage ?? localStorage).getItem(KEY) ?? ""; } catch { return ""; }
}
export function rememberEmail(value: string, storage?: EmailStorage): void {
  try {
    const target = storage ?? localStorage;
    const email = value.trim();
    if (email) target.setItem(KEY, email);
    else target.removeItem(KEY);
  } catch { /* Storage can be unavailable; login must still work. */ }
}
