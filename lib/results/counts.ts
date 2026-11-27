import type { Reading } from "../types";

export type Counts = {
  read: number;
  valid: number;
  invalid: number;
  llp: number;
};

export function countReadings(readings: Reading[]): Counts {
  let valid = 0;
  let llp = 0;

  for (const reading of readings) {
    if (reading.valid) {
      valid += 1;
    }
    if (reading.kind === "llpin") {
      llp += 1;
    }
  }

  return {
    read: readings.length,
    valid,
    invalid: readings.length - valid,
    llp,
  };
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function totalsSentence(counts: Counts): string {
  const read = plural(counts.read, "identifier read", "identifiers read");
  const valid = plural(counts.valid, "valid", "valid");
  const invalid = plural(counts.invalid, "not valid", "not valid");
  const llp = plural(counts.llp, "is an LLP", "are LLPs");

  return `${read}. ${valid}, ${invalid}. ${llp}.`;
}
