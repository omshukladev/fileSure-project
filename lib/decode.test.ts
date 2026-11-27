import { describe, expect, it } from "vitest";
import { clean, decodeLine, decodeList, LLPIN_NOTE } from "./decode";
import type { Block, FaultCode, Reading } from "./types";

const RELIANCE = "L17110MH1973PLC019786";
const PINNED = { now: new Date("2026-11-26T00:00:00Z") };

function blockOf(reading: Reading, label: string): Block | undefined {
  if (!reading.valid) return undefined;
  return reading.blocks.find((block) => block.label === label);
}

function faultCodes(reading: Reading): FaultCode[] {
  return reading.valid ? [] : reading.faults.map((item) => item.code);
}

describe("AC-1 a well formed CIN decodes every block", () => {
  it("decodes the Reliance example in order", () => {
    const reading = decodeLine(RELIANCE, PINNED);
    expect(reading.valid).toBe(true);
    expect(reading.kind).toBe("cin");
    if (!reading.valid) return;
    expect(reading.blocks.map((block) => block.label)).toEqual([
      "Listing",
      "Industry",
      "State",
      "Year",
      "Type",
      "Serial",
    ]);
    expect(blockOf(reading, "Listing")?.meaning).toBe("Listed company");
    expect(blockOf(reading, "State")?.meaning).toBe("Maharashtra");
    expect(blockOf(reading, "Year")?.value).toBe("1973");
    expect(blockOf(reading, "Type")?.meaning).toBe("Public limited company");
    expect(blockOf(reading, "Serial")?.value).toBe("019786");
  });

  it("reports block positions measured against the cleaned line", () => {
    const reading = decodeLine(RELIANCE, PINNED);
    if (!reading.valid) throw new Error("expected valid");
    expect(blockOf(reading, "State")).toMatchObject({ start: 6, length: 2 });
    expect(blockOf(reading, "Year")).toMatchObject({ start: 8, length: 4 });
    expect(blockOf(reading, "Serial")).toMatchObject({ start: 15, length: 6 });
  });

  it("every CIN span slices back out of cleaned as its own value", () => {
    const reading = decodeLine(RELIANCE, PINNED);
    if (!reading.valid) throw new Error("expected valid");
    for (const block of reading.blocks) {
      const span = reading.cleaned.slice(block.start, block.start + block.length);
      expect(span, block.label).toBe(block.value);
    }
  });

  it("the spans still line up after a messy paste is cleaned", () => {
    const reading = decodeLine(" l17110 mh1973 plc019786 ", PINNED);
    if (!reading.valid) throw new Error("expected valid");
    for (const block of reading.blocks) {
      const span = reading.cleaned.slice(block.start, block.start + block.length);
      expect(span, block.label).toBe(block.value);
    }
  });

  it("describes the industry block without inventing a lookup", () => {
    const reading = decodeLine(RELIANCE, PINNED);
    if (!reading.valid) throw new Error("expected valid");
    expect(blockOf(reading, "Industry")?.value).toBe("17110");
    expect(blockOf(reading, "Industry")?.meaning).toContain("national industrial classification");
  });
});

describe("AC-2 every broken block is collected", () => {
  it("keeps the blocks that passed alongside the faults", () => {
    const reading = decodeLine("L17110OD1973PLC019786", PINNED);
    expect(reading.valid).toBe(false);
    if (reading.valid || reading.kind !== "cin") {
      throw new Error("expected an invalid CIN");
    }
    expect(reading.blocks).toHaveLength(6);
    expect(reading.blocks.find((block) => block.label === "Year")?.value).toBe("1973");
    expect(reading.blocks.find((block) => block.label === "State")?.meaning).toBe(
      "Unknown state code",
    );
  });

  it("reports more than one fault when more than one block is wrong", () => {
    const reading = decodeLine("L17110ZZ1973XYZ019786", PINNED);
    expect(faultCodes(reading)).toEqual(
      expect.arrayContaining(["STATE_UNKNOWN", "TYPE_UNKNOWN"]),
    );
  });

  it("stops block checking when the line length is wrong", () => {
    const reading = decodeLine("L17110MH1973PLC01978", PINNED);
    expect(faultCodes(reading)).toEqual(["LENGTH"]);
  });
});

describe("AC-3 an LLPIN never carries a state or a year", () => {
  it("decodes AAA-1234 as an LLPIN", () => {
    const reading = decodeLine("AAA-1234", PINNED);
    expect(reading.valid).toBe(true);
    expect(reading.kind).toBe("llpin");
    if (!reading.valid) return;
    expect(reading.blocks).toHaveLength(1);
    expect(reading.blocks[0].label).toBe("LLPIN");
    expect(reading.notes).toContain(LLPIN_NOTE);
  });

  it("decodes AAA1234 with no hyphen the same way", () => {
    const withHyphen = decodeLine("AAA-1234", PINNED);
    const withoutHyphen = decodeLine("AAA1234", PINNED);
    expect(withHyphen.valid).toBe(true);
    expect(withoutHyphen.valid).toBe(true);
    if (!withHyphen.valid || !withoutHyphen.valid) return;
    expect(withoutHyphen.blocks[0].value).toBe("AAA1234");
    expect(withHyphen.blocks[0].value).toBe("AAA1234");
  });

  it("has no state, year, listing or type block", () => {
    const reading = decodeLine("AAA-1234", PINNED);
    if (!reading.valid) throw new Error("expected valid");
    const labels = reading.blocks.map((block) => block.label);
    for (const forbidden of ["State", "Year", "Listing", "Type"]) {
      expect(labels).not.toContain(forbidden);
    }
  });

  it("spans the whole identifier in cleaned, hyphen or not", () => {
    for (const input of ["AAA-1234", "AAA1234"]) {
      const reading = decodeLine(input, PINNED);
      if (!reading.valid) throw new Error(`expected valid for ${input}`);
      const block = reading.blocks[0];
      const span = reading.cleaned.slice(block.start, block.start + block.length);
      expect(span, input).toBe(reading.cleaned);
      expect(block.start).toBe(0);
      expect(block.length).toBe(reading.cleaned.length);
    }
  });

  it("keeps the serial without the hyphen in the value", () => {
    const reading = decodeLine("AAA-1234", PINNED);
    if (!reading.valid) throw new Error("expected valid");
    expect(reading.blocks[0].value).toBe("AAA1234");
  });

  it("rejects a seven character line that is not three letters then four digits", () => {
    expect(faultCodes(decodeLine("12A3456", PINNED))).toEqual(["LLPIN_SHAPE"]);
  });

  it("rejects a misplaced hyphen inside the LLPIN", () => {
    // seven characters once the hyphen is removed, so it routes to the LLPIN path
    expect(faultCodes(decodeLine("AB1-2345", PINNED))).toEqual(["LLPIN_SHAPE"]);
  });
});

describe("AC-4 cleaning fixes paste habits and keeps meaning", () => {
  it("accepts lower case", () => {
    const reading = decodeLine("l17110mh1973plc019786", PINNED);
    expect(reading.valid).toBe(true);
    expect(reading.cleaned).toBe(RELIANCE);
  });

  it("accepts spaces inside the line", () => {
    expect(decodeLine("L17110 MH1973 PLC019786", PINNED).valid).toBe(true);
  });

  it("strips invisible characters from an Excel paste", () => {
    expect(decodeLine("\uFEFFL17110MH1973PLC019786\u200B", PINNED).valid).toBe(true);
  });

  it("keeps a leading zero in the serial", () => {
    const reading = decodeLine(RELIANCE, PINNED);
    if (!reading.valid) throw new Error("expected valid");
    expect(blockOf(reading, "Serial")?.value).toBe("019786");
    expect(blockOf(reading, "Serial")?.value.startsWith("0")).toBe(true);
  });

  it("exposes the cleaned line alongside the raw input", () => {
    const reading = decodeLine(" l17110mh1973plc019786 ", PINNED);
    expect(reading.input).toBe(" l17110mh1973plc019786 ");
    expect(reading.cleaned).toBe(RELIANCE);
  });

  it("cleans without changing the hyphen", () => {
    expect(clean("aaa-1234")).toBe("AAA-1234");
  });
});

describe("AC-5 the failing block is named, never a blanket invalid", () => {
  it("reports the count received and the count expected", () => {
    const reading = decodeLine("L17110MH1973PLC01978", PINNED);
    if (reading.valid) return;
    expect(reading.faults[0].message).toContain("20");
    expect(reading.faults[0].message).toContain("21");
  });

  it("reports a hyphen inside a CIN instead of deleting it", () => {
    const reading = decodeLine("L-17110MH1973PLC019786", PINNED);
    expect(faultCodes(reading)).toEqual(["ILLEGAL_CHARACTER"]);
    if (reading.valid) return;
    expect(reading.faults[0].start).toBe(1);
    expect(reading.faults[0].message).toContain("hyphen");
  });

  it("reports an illegal character with its position", () => {
    const reading = decodeLine("L17110MH1973PLC01978!", PINNED);
    expect(faultCodes(reading)).toEqual(["ILLEGAL_CHARACTER"]);
    if (reading.valid) return;
    expect(reading.faults[0].start).toBe(20);
  });
});

describe("AC-6 the tables decide, and near misses are explained", () => {
  it("suggests OR when OD is pasted for Odisha", () => {
    const reading = decodeLine("L17110OD1973PLC019786", PINNED);
    expect(faultCodes(reading)).toEqual(["STATE_UNKNOWN"]);
    if (reading.valid) return;
    expect(reading.faults[0].suggestion).toBe("OR");
  });

  it("keeps AP valid and attaches the reissue note", () => {
    const reading = decodeLine("L17110AP1973PLC019786", PINNED);
    expect(reading.valid).toBe(true);
    if (!reading.valid) return;
    expect(reading.notes.join(" ")).toContain("TG");
  });

  it("keeps TG valid with no note", () => {
    const reading = decodeLine("L17110TG1973PLC019786", PINNED);
    expect(reading.valid).toBe(true);
    if (!reading.valid) return;
    expect(reading.notes).toEqual([]);
  });

  it("keeps DD and DN valid with the merger note", () => {
    for (const code of ["DD", "DN"]) {
      const reading = decodeLine(`L17110${code}1973PLC019786`, PINNED);
      expect(reading.valid).toBe(true);
      if (!reading.valid) continue;
      expect(reading.notes.join(" ")).toContain("2020");
    }
  });

  it("fails the unverified legacy codes with an explanation", () => {
    for (const code of ["CT", "UA", "TS"]) {
      const reading = decodeLine(`L17110${code}1973PLC019786`, PINNED);
      expect(faultCodes(reading)).toEqual(["STATE_UNKNOWN"]);
      if (reading.valid) continue;
      expect(reading.faults[0].message).toContain("MCA");
    }
  });

  it("fails an unknown company type by name", () => {
    const reading = decodeLine("L17110MH1973XYZ019786", PINNED);
    expect(faultCodes(reading)).toEqual(["TYPE_UNKNOWN"]);
    if (reading.valid) return;
    expect(reading.faults[0].message).toContain("XYZ");
  });

  it("accepts all twelve type codes", () => {
    const codes = [
      "PTC", "PLC", "OPC", "NPL", "FTC", "GOI",
      "SGC", "ULL", "ULT", "GAP", "GAT", "FLC",
    ];
    for (const code of codes) {
      const reading = decodeLine(`L17110MH1973${code}019786`, PINNED);
      expect(reading.valid).toBe(true);
    }
  });

  it("accepts all thirty six state codes", () => {
    const codes = [
      "AN", "AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN",
      "GA", "GJ", "HP", "HR", "JH", "JK", "KA", "KL", "LD", "MH",
      "ML", "MN", "MP", "MZ", "NL", "OR", "PB", "PY", "RJ", "SK",
      "TG", "TN", "TR", "UP", "UT", "WB",
    ];
    expect(codes).toHaveLength(36);
    for (const code of codes) {
      const reading = decodeLine(`L17110${code}1973PLC019786`, PINNED);
      expect(reading.valid, code).toBe(true);
    }
  });
});

describe("AC-7 the year is checked at both ends", () => {
  it("rejects a future year", () => {
    expect(faultCodes(decodeLine("L17110MH2099PLC019786", PINNED))).toEqual([
      "YEAR_IN_FUTURE",
    ]);
  });

  it("rejects a year before 1850", () => {
    expect(faultCodes(decodeLine("L17110MH1849PLC019786", PINNED))).toEqual([
      "YEAR_TOO_EARLY",
    ]);
  });

  it("accepts the boundary years", () => {
    expect(decodeLine("L17110MH1850PLC019786", PINNED).valid).toBe(true);
    expect(decodeLine("L17110MH2026PLC019786", PINNED).valid).toBe(true);
  });

  it("rejects a year block holding a letter as a different fault", () => {
    expect(faultCodes(decodeLine("L17110MH19A3PLC019786", PINNED))).toEqual([
      "YEAR_INVALID",
    ]);
  });

  it("follows the injected clock, not the real one", () => {
    const past = { now: new Date("2020-01-01T00:00:00Z") };
    expect(faultCodes(decodeLine("L17110MH2026PLC019786", past))).toEqual([
      "YEAR_IN_FUTURE",
    ]);
  });
});

describe("AC-8 decodeList handles a whole paste", () => {
  it("skips blank lines and a trailing newline", () => {
    const list = decodeList(`\n${RELIANCE}\n\nAAA-1234\n`, PINNED);
    expect(list.rows).toHaveLength(2);
    expect(list.counts).toEqual({ read: 2, valid: 2, invalid: 0 });
  });

  it("handles Windows line endings from a spreadsheet", () => {
    const list = decodeList(`${RELIANCE}\r\nAAA-1234\r\n`, PINNED);
    expect(list.counts.read).toBe(2);
    expect(list.counts.valid).toBe(2);
  });

  it("keeps a repeated code as two rows", () => {
    const list = decodeList(`${RELIANCE}\n${RELIANCE}`, PINNED);
    expect(list.rows).toHaveLength(2);
    expect(list.counts.read).toBe(2);
  });

  it("counts valid and invalid so they add up", () => {
    const list = decodeList(`${RELIANCE}\nL17110OD1973PLC019786\nAAA-1234`, PINNED);
    expect(list.counts).toEqual({ read: 3, valid: 2, invalid: 1 });
    expect(list.counts.valid + list.counts.invalid).toBe(list.counts.read);
  });

  it("returns empty counts for empty input", () => {
    expect(decodeList("", PINNED).counts).toEqual({
      read: 0,
      valid: 0,
      invalid: 0,
    });
  });

  it("treats a whitespace only line as blank", () => {
    expect(decodeList(`${RELIANCE}\n   \n\t\n`, PINNED).counts.read).toBe(1);
  });
});

describe("AC-9 pure and deterministic", () => {
  it("never throws on hostile input", () => {
    const inputs = [
      "",
      " ",
      "\u0000",
      "🙂🙂🙂",
      "a".repeat(10_000),
      "-".repeat(50),
      "\n\n\n",
    ];
    for (const input of inputs) {
      expect(() => decodeLine(input, PINNED)).not.toThrow();
      expect(() => decodeList(input, PINNED)).not.toThrow();
    }
  });

  it("returns the same result for the same input", () => {
    expect(decodeLine(RELIANCE, PINNED)).toEqual(decodeLine(RELIANCE, PINNED));
  });
});

describe("AC-10 every fault code is reachable", () => {
  it("produces each member of the union", () => {
    const cases: Array<[string, FaultCode]> = [
      ["L17110MH1973PLC01978", "LENGTH"],
      ["L-17110MH1973PLC019786", "ILLEGAL_CHARACTER"],
      ["12A3456", "LLPIN_SHAPE"],
      ["X17110MH1973PLC019786", "LISTING_INVALID"],
      ["L17X10MH1973PLC019786", "INDUSTRY_INVALID"],
      ["L17110ZZ1973PLC019786", "STATE_UNKNOWN"],
      ["L17110MH19A3PLC019786", "YEAR_INVALID"],
      ["L17110MH1849PLC019786", "YEAR_TOO_EARLY"],
      ["L17110MH2099PLC019786", "YEAR_IN_FUTURE"],
      ["L17110MH1973XYZ019786", "TYPE_UNKNOWN"],
      ["L17110MH1973PLC01978X", "SERIAL_INVALID"],
    ];

    for (const [input, code] of cases) {
      expect(faultCodes(decodeLine(input, PINNED)), input).toContain(code);
    }

    const covered = new Set<FaultCode>();
    for (const [input] of cases) {
      for (const code of faultCodes(decodeLine(input, PINNED))) {
        covered.add(code);
      }
    }
    expect(covered.size).toBe(cases.length);
  });
});
