import { describe, expect, it } from "vitest";
import { decodeLine } from "../decode";
import { markSpans } from "./spans";

const PIN = { now: new Date("2026-11-26") };

function marked(cleaned: string, faults: Parameters<typeof markSpans>[1]) {
  return markSpans(cleaned, faults)
    .filter((segment) => segment.fault)
    .map((segment) => segment.text);
}

describe("markSpans", () => {
  it("returns the whole string unmarked when there are no faults", () => {
    const segments = markSpans("L17110MH1973PLC019786", []);
    expect(segments).toEqual([{ text: "L17110MH1973PLC019786", fault: false }]);
  });

  it("marks exactly the failing characters of a whole string fault", () => {
    const reading = decodeLine("nonsense", PIN);
    if (reading.valid) throw new Error("expected invalid");
    expect(marked(reading.cleaned, reading.faults)).toEqual([reading.cleaned]);
  });

  it("marks only the bad state block, not the year or serial", () => {
    const reading = decodeLine("L17110ZZ1973PLC019786", PIN);
    if (reading.valid) throw new Error("expected invalid");
    expect(marked(reading.cleaned, reading.faults)).toEqual(["ZZ"]);
  });

  it("marks only the bad listing character", () => {
    const reading = decodeLine("X17110MH1973PLC019786", PIN);
    if (reading.valid) throw new Error("expected invalid");
    expect(marked(reading.cleaned, reading.faults)).toEqual(["X"]);
  });

  it("rebuilds the original string exactly from its segments", () => {
    for (const line of [
      "L17110ZZ1973PLC019786",
      "X17110MH1973PLC019786",
      "nonsense",
      "L17110MH1973PLC019786",
      "AAA-1234",
      "1234567",
    ]) {
      const reading = decodeLine(line, PIN);
      const faults = reading.valid ? [] : reading.faults;
      const rebuilt = markSpans(reading.cleaned, faults)
        .map((segment) => segment.text)
        .join("");
      expect(rebuilt).toBe(reading.cleaned);
    }
  });

  it("merges overlapping faults into one mark rather than nesting", () => {
    const segments = markSpans("ABCDEF", [
      { code: "LENGTH", message: "", start: 1, length: 3 },
      { code: "LENGTH", message: "", start: 2, length: 3 },
    ]);
    expect(segments).toEqual([
      { text: "A", fault: false },
      { text: "BCDE", fault: true },
      { text: "F", fault: false },
    ]);
  });

  it("clamps a span that runs past the end of the string", () => {
    const segments = markSpans("ABC", [
      { code: "LENGTH", message: "", start: 1, length: 99 },
    ]);
    expect(segments).toEqual([
      { text: "A", fault: false },
      { text: "BC", fault: true },
    ]);
  });

  it("marks the hyphen in a CIN at its real position after cleaning", () => {
    const raw = "L17110MH1973PLC019786 AAA-1234";
    const reading = decodeLine(raw, PIN);
    if (reading.valid) throw new Error("expected invalid");

    const located = reading.faults.find(
      (fault) => fault.code === "ILLEGAL_CHARACTER",
    );
    expect(located).toBeDefined();

    const { start, length } = located!;
    expect(reading.cleaned.slice(start, start + length)).toBe("-");

    const marked = markSpans(reading.cleaned, reading.faults).filter(
      (segment) => segment.fault,
    );
    expect(marked.map((segment) => segment.text)).toEqual(["-"]);
  });
});
