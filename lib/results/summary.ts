import type { Reading } from "../types";
import { blockByLabel } from "./blocks";

function lowerFirst(text: string): string {
  return text.length === 0 ? text : text.charAt(0).toLowerCase() + text.slice(1);
}

export function plainSentence(reading: Reading): string {
  if (reading.kind === "llpin") {
    return reading.valid
      ? "An LLP registration number. It identifies the LLP and nothing more."
      : "This one is not a valid LLP registration number.";
  }

  if (!reading.valid) {
    return "This one needs a fix before it can be read.";
  }

  const listing = blockByLabel(reading, "Listing")?.value === "U" ? "unlisted" : "listed";
  const type = lowerFirst(blockByLabel(reading, "Type")?.meaning ?? "company");
  const state = blockByLabel(reading, "State")?.meaning ?? "an unknown state";
  const year = blockByLabel(reading, "Year")?.value ?? "an unknown year";
  const article = listing === "unlisted" ? "An" : "A";

  return `${article} ${listing} ${type}, registered in ${state} in ${year}.`;
}
