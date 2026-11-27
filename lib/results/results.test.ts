import { describe, expect, it } from "vitest";
import { decodeLine } from "../decode";
import { countReadings, totalsSentence } from "./counts";
import { EXAMPLE_INPUT } from "./examples";
import { CARD_LIMIT, DEBOUNCE_MS, layoutFor } from "./layout";
import { plainSentence } from "./summary";

const PIN = { now: new Date("2026-11-26") };

describe("layoutFor", () => {
  it("gives cards up to the card limit", () => {
    expect(layoutFor(0)).toBe("cards");
    expect(layoutFor(1)).toBe("cards");
    expect(layoutFor(CARD_LIMIT)).toBe("cards");
  });

  it("gives rows past the card limit", () => {
    expect(layoutFor(CARD_LIMIT + 1)).toBe("rows");
    expect(layoutFor(500)).toBe("rows");
  });

  it("uses a limit of five", () => {
    expect(CARD_LIMIT).toBe(5);
  });

  it("debounces at 250 milliseconds", () => {
    expect(DEBOUNCE_MS).toBe(250);
  });
});

describe("countReadings", () => {
  it("counts nothing for an empty list", () => {
    expect(countReadings([])).toEqual({
      read: 0,
      valid: 0,
      invalid: 0,
      llp: 0,
    });
  });

  it("counts every reading, valid or not", () => {
    const readings = [
      decodeLine("L17110MH1973PLC019786", PIN),
      decodeLine("nonsense", PIN),
      decodeLine("AAA-1234", PIN),
    ];
    expect(countReadings(readings)).toEqual({
      read: 3,
      valid: 2,
      invalid: 1,
      llp: 1,
    });
  });

  it("counts a malformed LLP shaped line as an LLP", () => {
    const readings = [decodeLine("1234567", PIN)];
    expect(countReadings(readings).llp).toBe(1);
    expect(countReadings(readings).invalid).toBe(1);
  });
});

describe("totalsSentence", () => {
  it("pluralises for one identifier", () => {
    expect(
      totalsSentence({ read: 1, valid: 1, invalid: 0, llp: 1 }),
    ).toBe("1 identifier read. 1 valid, 0 not valid. 1 is an LLP.");
  });

  it("pluralises for many identifiers", () => {
    expect(
      totalsSentence({ read: 3, valid: 2, invalid: 1, llp: 0 }),
    ).toBe("3 identifiers read. 2 valid, 1 not valid. 0 are LLPs.");
  });

  it("reads zero without claiming an LLP", () => {
    expect(totalsSentence({ read: 0, valid: 0, invalid: 0, llp: 0 })).toBe(
      "0 identifiers read. 0 valid, 0 not valid. 0 are LLPs.",
    );
  });
});

describe("plainSentence", () => {
  it("names a listed CIN by listing, type, state and year", () => {
    const reading = decodeLine("L17110MH1973PLC019786", PIN);
    expect(plainSentence(reading)).toBe(
      "A listed public limited company, registered in Maharashtra in 1973.",
    );
  });

  it("uses An for an unlisted CIN", () => {
    const reading = decodeLine("U72900KA2010PTC086596", PIN);
    expect(plainSentence(reading)).toBe(
      "An unlisted private limited company, registered in Karnataka in 2010.",
    );
  });

  it("gives the same LLP sentence whether or not the serial is hyphenated", () => {
    const hyphened = decodeLine("AAA-1234", PIN);
    const bare = decodeLine("AAA1234", PIN);
    expect(plainSentence(hyphened)).toBe(plainSentence(bare));
    expect(plainSentence(hyphened)).toBe(
      "An LLP registration number. It identifies the LLP and nothing more.",
    );
  });

  it("never claims a company exists", () => {
    for (const line of ["L17110MH1973PLC019786", "AAA-1234"]) {
      expect(plainSentence(decodeLine(line, PIN))).not.toMatch(/exists|real/i);
    }
  });

  it("asks for a fix on an invalid CIN without repeating the faults", () => {
    const reading = decodeLine("L17110ZZ1973PLC019786", PIN);
    expect(plainSentence(reading)).toBe(
      "This one needs a fix before it can be read.",
    );
  });

  it("survives an invalid LLPIN that has no blocks at all", () => {
    const reading = decodeLine("1234567", PIN);
    expect(reading.valid).toBe(false);
    expect("blocks" in reading).toBe(false);
    expect(plainSentence(reading)).toBe(
      "This one is not a valid LLP registration number.",
    );
  });
});

describe("example input", () => {
  it("is exactly one CIN and one LLPIN, both valid", () => {
    const rows = EXAMPLE_INPUT.split("\n").map((line) => decodeLine(line, PIN));
    expect(rows).toHaveLength(2);
    expect(rows.every((row) => row.valid)).toBe(true);
    expect(rows[0].kind).toBe("cin");
    expect(rows[1].kind).toBe("llpin");
  });
});
