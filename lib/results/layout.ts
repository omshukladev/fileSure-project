export type Layout = "cards" | "rows";

export const CARD_LIMIT = 5;

export const DEBOUNCE_MS = 250;

export function layoutFor(rowCount: number): Layout {
  return rowCount <= CARD_LIMIT ? "cards" : "rows";
}
