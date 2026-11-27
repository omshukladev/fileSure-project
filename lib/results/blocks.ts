import type { Reading } from "../types";

export function blockByLabel(
  reading: Reading,
  label: string,
): { value: string; meaning: string } | undefined {
  if (!("blocks" in reading)) {
    return undefined;
  }
  return reading.blocks.find((block) => block.label === label);
}
