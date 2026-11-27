# 0002. Decode CIN and LLPIN with one pure module and sourced reference tables

**Date**: 2026-11-26
**Status**: Proposed

## Summary

One pure TypeScript module turns a pasted line into a typed result. It decides whether the line is a company CIN or an LLPIN, and for a CIN it decodes all six blocks or names every block that failed. It holds the only copy of the state and company type tables, each checked against a real source. It imports no React, touches no network, and stores nothing, so the page and every later feature read one truth and the rules can be tested in plain Node.

## Requirements

**User stories**:
- As a visitor pasting a company code, I want every block of it explained in plain words, so that I can read the code without opening a government portal.
- As a visitor pasting a wrong code, I want to know which block is broken and what was expected, so that I can fix the character instead of guessing.
- As a visitor pasting an LLP code, I want to be told it is an LLP and what its code can and cannot tell me, so that I am not given a state or a year that was never encoded.
- As the person building the page, I want one tested module holding every rule, so that the page never invents a code and a wrong answer becomes a failing test rather than a silent bug.

**Acceptance criteria**:

- **AC-1**: A well formed 21 character CIN returns `valid: true` with all six blocks present in order: listing, industry, state, year, type and serial. Each block carries its value, a plain meaning, and its zero based start position in the cleaned line.
- **AC-2**: Every block is checked independently and every broken block produces its own fault, each carrying a stable machine code from the closed `FaultCode` union, a plain sentence, and the start position of the offending characters in the cleaned line. Line level faults (length, illegal character, LLPIN shape) stop block checking, because positions are not trustworthy once the shape is wrong. An invalid result still carries the blocks that did decode.
- **AC-3**: A well formed LLPIN returns `valid: true` with `kind: "llpin"` and no state block, no year block, no listing and no type. TypeScript refuses to read those fields from an LLPIN result, so the mistake fails at compile time rather than at review. Every valid LLPIN carries a fixed note saying it is a plain serial number that identifies the LLP but encodes no state, year, listing status or company type.
- **AC-4**: Cleaning fixes paste habits silently and never changes meaning. Lower case is upper cased, leading and trailing whitespace is trimmed, whitespace inside the line is removed, invisible characters (zero width space, zero width no break space, byte order mark, non breaking space, tabs) are removed. A leading zero in the serial is kept. The hyphen is treated as punctuation throughout: kind detection runs on the hyphen stripped string, and `cleaned` holds the line with the hyphen removed, so no character is ever added that the visitor did not type.
- **AC-5**: A line whose cleaned length is not 21 reports the count it arrived at and the count expected. A line containing a character outside A to Z and 0 to 9 reports that character and its position, and the hyphen inside a CIN is reported rather than deleted. Reported positions and counts always refer to `cleaned`, which is also the string `cleaned` carries, so a reported index always points at a character that exists.
- **AC-6**: A state code or company type code that is not in the sourced table fails with its own named fault. The near miss `OD` carries a suggested `OR`. An `AP` code stays valid and carries an informational note that Telangana codes were reissued as `TG` in 2014. A `DD` or `DN` code stays valid and carries a note that the two territories merged in 2020.
- **AC-7**: The year block must be four digits between 1850 and the current year inclusive. A block containing a letter or punctuation fails as `YEAR_INVALID`, a four digit year before 1850 fails as `YEAR_TOO_EARLY`, and a four digit year after the current year fails as `YEAR_IN_FUTURE`. These three are distinct faults, not one range fault.
- **AC-8**: `decodeList` splits on any newline convention (`\r\n`, `\r`, or `\n`) so a paste straight from a spreadsheet works, skips lines that are empty after cleaning, decodes every remaining line in order, keeps repeated codes as separate rows, and returns counts where `read` equals the number of rows, and `valid` plus `invalid` equals `read`.
- **AC-9**: The module is deterministic, imports no React and makes no network call. The current year is injectable so a test can pin it.
- **AC-10**: A Vitest suite covers every rule above and passes with `npm test`. Every acceptance criterion has at least one test naming it, and every member of `FaultCode` is asserted by at least one test.

## Decision

**Chosen option**: Option 1: one pure module with a discriminated union result and sourced tables

`lib/decode.ts` exposes `decodeLine` and `decodeList`. `lib/types.ts` holds the result union. `lib/reference/states.ts` and `lib/reference/company-types.ts` hold the tables. A commented tag on each table records the source it was checked against.

**Implementation skills**: none installed that shape this decision. It is plain TypeScript with no framework surface.

## Feature design

**Data model sketch**:

```ts
type Kind = "cin" | "llpin";

type Block = {
  label: string;      // "State"
  value: string;      // "MH"
  meaning: string;    // "Maharashtra"
  start: number;      // zero based index into `cleaned`
  length: number;
};

type FaultCode =
  // line level, block checking stops
  | "LENGTH"              // not 21 and not 7 after cleaning
  | "ILLEGAL_CHARACTER"   // a character outside A to Z, 0 to 9, and the LLPIN hyphen
  | "LLPIN_SHAPE"         // 7 characters but not 3 letters then 4 digits
  // block level, collected together
  | "LISTING_INVALID"     // first character is not L or U
  | "INDUSTRY_INVALID"    // characters 2 to 6 are not five digits
  | "STATE_UNKNOWN"       // two letters, not in the state table
  | "YEAR_INVALID"        // characters 9 to 12 are not four digits
  | "YEAR_TOO_EARLY"      // four digits, before 1850
  | "YEAR_IN_FUTURE"      // four digits, after the current year
  | "TYPE_UNKNOWN"        // three letters, not in the company type table
  | "SERIAL_INVALID";     // characters 16 to 21 are not six digits

type Fault = {
  code: FaultCode;
  message: string;
  start: number;         // zero based index into `cleaned`
  length: number;
  suggestion?: string;   // "OR" when OD was found
};

type Reading =
  | { kind: "cin";   valid: true;  input: string; cleaned: string; blocks: Block[]; notes: string[] }
  | { kind: "llpin"; valid: true;  input: string; cleaned: string; blocks: Block[]; notes: string[] }
  | { kind: "cin";   valid: false; input: string; cleaned: string; blocks: Block[]; faults: Fault[] }
  | { kind: "llpin"; valid: false; input: string; cleaned: string; faults: Fault[] };

type List = {
  rows: Reading[];
  counts: { read: number; valid: number; invalid: number };
};
```

Four rules hold this shape together:

- **An LLPIN result has no state, year, listing or type block.** That branch has no field to hold them, so AC-3 is enforced by the compiler, not by a test hoping nobody forgets.
- **`input` is the raw line as pasted. `cleaned` is what every check and every index refers to.** `Block.start` and `Fault.start` are zero based indices into `cleaned`, never into `input`, because cleaning removes and can add characters. The page highlights `cleaned[start]`, so it always points at a real character.
- **An invalid result still carries the blocks that did decode.** A line with a wrong state still shows its year and type, which is what makes "the other five blocks still decode" possible and what the brief means by naming the broken block rather than condemning the line.
- **`kind` is always decided.** A line of 7 characters after hyphen removal is an LLPIN, anything else is a CIN, so the CIN length fault covers empty and oversized input. There is no third "unknown" kind to handle.

`FaultCode` is a closed union, one member per failure above. The page may style and translate from the code, so rewording a message never changes behaviour and never breaks a test.

**State transitions**: not applicable. Every call is a pure function with no stored state.

**API surface**:

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `decodeLine` | function | `line: string` (req), `options?: { now?: Date }` (opt) | `Reading` | none, pure | Never throws. Every failure is a `Reading` with `valid: false` |
| `decodeList` | function | `text: string` (req), `options?: { now?: Date }` (opt) | `List` | none, pure | Never throws. Empty input returns zero rows and zero counts |

**Value sourcing** (each value the result shows, and where it comes from):

| Action | Value produced / displayed | Source |
|---|---|---|
| Kind detection | `kind` | Derived from `cleaned`: exactly 7 characters is an LLPIN, anything else is a CIN. The hyphen is removed before this test, so `AAA-1234` and `AAA1234` both clean to 7 characters |
| Every block | `start`, `length` | Fixed offsets from the CIN layout, declared once in `lib/decode.ts`, measured against `cleaned` |
| Every fault | `start`, `length` | The offsets of the block that failed, measured against `cleaned` |
| Listing block | meaning, "Listed" or "Unlisted" | `L` or `U`, from the layout rule |
| Industry block | value, and the note that it is a national industrial classification code | The five characters, plus a fixed label. No code table, decided in this spec |
| State block | meaning, the state name | `lib/reference/states.ts`, checked against the source in References |
| State notes | note text for `AP`, `DD` and `DN` | A `note` field on those three entries in `lib/reference/states.ts` |
| Year block | value | The four characters. Plausibility comes from the 1850 to current year rule |
| Year plausibility | upper bound | `options.now` when given, else `new Date()` at call time. Injectable so tests are stable (AC-9) |
| Type block | meaning, the company kind | `lib/reference/company-types.ts`, checked against the source in References |
| Serial block | value, leading zeros kept | The six characters, never parsed as a number |
| LLPIN block | one block, label "LLPIN", value the cleaned 7 characters, meaning the serial | The cleaned line. The 3 letters then 4 digits shape is validated and faulted as `LLPIN_SHAPE` |
| LLPIN note | the fixed sentence explaining what an LLPIN cannot encode | A constant in `lib/decode.ts`, attached to every valid LLPIN (AC-3) |
| `OD` fault | `suggestion: "OR"` | A closed near miss table in `lib/decode.ts`, containing exactly the `OD` to `OR` entry |
| Length fault | the count received, the count expected | Both counted from `cleaned` (AC-5) |
| Counts | `read`, `valid`, `invalid` | Derived from `rows`. `read` is `rows.length`, the other two counted in the same pass |

**Key invariants**:
- `decodeLine` and `decodeList` never throw on any string input, including empty, very long, or containing control characters.
- `Block.start` and `Fault.start` are zero based indices into `cleaned`, and always point at a character that exists in it. They are never indices into `input`.
- A result with `kind: "llpin"` has no block whose label is State, Year, Listing or Type.
- A result with `valid: false` and `kind: "cin"` may carry blocks, and those blocks describe the parts that did pass.
- `counts.valid + counts.invalid === counts.read`, always.
- Every member of `FaultCode` is reachable by at least one input, and no fault is emitted with a code outside that union.
- The serial is handled as characters end to end. No `parseInt` on any block value.
- The state and type tables are the only place those codes are written down.
- One code per line. A line holding two identifiers is not split, so it fails on length rather than being silently guessed at.

**Security model**: no data leaves the browser, no storage, no network, no authentication. Input is treated as untrusted text: it is cleaned to a known character set before any check, and no part of it is ever evaluated, inserted as HTML, or used to build a path. There is no regulated data scope beyond the fact that a pasted code may identify a public company, which the page never transmits.

**Configuration required**: none. No environment variable, secret, or third party credential.

**Critical test scenarios**:
- Happy path: `L17110MH1973PLC019786` decodes to Maharashtra, 1973, public limited, serial `019786` with the zero intact, verifies **AC-1** and **AC-4**.
- Happy path: `AAA-1234` and `AAA1234` both return an LLPIN with one block, no state, no year, and the cannot encode note, verifies **AC-3**.
- Failure: `L17110OD1973PLC019786` fails on the state block with code `STATE_UNKNOWN` and a suggestion of `OR`, while the year, type and serial blocks still decode, verifies **AC-2** and **AC-6**.
- Failure: a 20 character line and a 22 character line each report the count received and 21 expected, both measured on the cleaned line, verifies **AC-5**.
- Failure: `L17110MH2099PLC019786` fails on the year alone as `YEAR_IN_FUTURE`, and `L17110MH1849PLC019786` as `YEAR_TOO_EARLY`, with the clock pinned so neither test expires, verifies **AC-7**.
- Failure: `L17110MH1973XYZ019786` fails on the type block by name, verifies **AC-6**.
- Failure: `L-17110MH1973PLC019786` reports an illegal character at index 1 rather than deleting the hyphen, verifies **AC-5**.
- Failure: `12A34567` fails as `LLPIN_SHAPE`, not as a CIN, verifies **AC-3**.
- Boundary: `AP` passes with the reissue note, `DD` and `DN` pass with the merger note, and `CT`, `UA` and `TS` fail with a named unknown state fault, verifies **AC-6**.
- Boundary: every `FaultCode` member is asserted by at least one test, verifies **AC-10**.
- List handling: a paste with a blank line, a trailing newline, `\r\n` separators and one repeated code yields rows equal to the non blank lines, duplicates kept, and counts that add up, verifies **AC-8**.

## Context

The page can only be as honest as its rules. A CIN is a fixed format government identifier, so every block has one correct reading, and a checker that guesses is worse than one that refuses: the audience is chartered accountants and lawyers reading codes that decide filings.

Two forces shape this. First, the codes are not evenly documented. The twelve company type codes are short and stable. The state table looks obvious and is not: Odisha is `OR` and not `OD`, Telangana is `TG` since MCA reissued `AP` codes in June 2014, and Andhra Pradesh still uses `AP` today, so the two must not be confused. Second, an LLPIN is a plain serial that encodes nothing beyond itself, which makes it the most likely place for a confident wrong answer.

The brief tests this directly. It says a reviewer will paste tricky input, and it asks for exactly what is wrong rather than a blanket invalid. It also supplies three states to design for, one of which is a wrong input that must stay calm and specific.

## Consequences

**Positive**:
- Every rule has one home, so the page, the tests and any later feature cannot disagree.
- The suite proves the tricky inputs before the page exists, which is cheaper than discovering them in a browser.
- The result union makes the LLPIN trap a compile error rather than a code review catch.
- Faults carry positions, so the page can point at the exact character without re parsing the line.

**Negative / tradeoffs**:
- Two files of reference data must be maintained by hand. A code added by MCA is a code we will not know until someone updates the table.
- Rejecting any state or type code outside the table means an unusual real company is reported as invalid. This is the deliberate choice over accepting anything shaped right, and it trades a rare false negative for never accepting an impossible code.
- The verified table has 36 state codes and no legacy `CT`, `UA` or `TS`. If those were ever issued, a company carrying one is rejected with an explanation rather than accepted.
- The module will grow as later features ask for more detail, and the union is closed, so a new outcome shape is a deliberate edit.
- Positions refer to `cleaned`, not to what the visitor typed, because cleaning removes characters. The page must highlight against `cleaned` too, which is a small constraint on feature 6.
- One code per line. A visitor pasting two codes separated by a space gets a length fault, not a split, so the page needs a hint that says one per line.

**Neutral**:
- Vitest is installed by this feature rather than by the tooling feature, because the suite is the proof.
- `decodeList` is a thin wrapper over `decodeLine`. It exists so the page never counts rows on its own.
- The industry digits are named but not decoded. A full classification table is thousands of rows and would be wrong in places, which is worse than honest.

## Build plan

Ordered by the Skateboard approach: stand up the thinnest thing that proves the harness, then grow the same two functions until every rule is covered.

1. Create `lib/types.ts` with the union, `Block`, `Fault`, `FaultCode` and `List`, plus `lib/decode.ts` exporting `decodeLine` that returns a length fault for any input. Install Vitest and add the `test` script. One test proves the harness runs. Satisfies **AC-9**, **AC-10**.
2. Write the cleaning pass: strip invisible characters, trim, upper case, remove internal whitespace, strip hyphens for kind detection and store `cleaned` with them removed. Build kind detection on the cleaned length. Tests for lower case, inner spaces, a byte order mark, `AAA1234` and a hyphen inside a CIN staying reported. Satisfies **AC-4**, **AC-5**.
3. Add `lib/reference/states.ts` and `lib/reference/company-types.ts` from the verified tables, recounting both, each with its source recorded and a `note` field on `AP`, `DD` and `DN`. Build the happy path: a well formed CIN returns all six blocks with meanings and offsets against `cleaned`. The Reliance example becomes the first real test. Satisfies **AC-1**, **AC-6**.
4. Add block validation that collects every fault rather than stopping at the first, keeps the blocks that did pass, and adds the line level faults for length, illegal characters and LLPIN shape. A test per fault code. Satisfies **AC-2**, **AC-5**.
5. Add the year rule with an injectable clock and three distinct year faults, plus the closed `OD` to `OR` near miss table. Tests pin the clock so they never expire. Satisfies **AC-2**, **AC-6**, **AC-7**.
6. Add the LLPIN path with its shape check, its single block and its cannot encode note, and narrow the result so no state or year field exists to read. Tests assert both hyphen forms pass and that a malformed 7 character line fails as `LLPIN_SHAPE`. Satisfies **AC-3**.
7. Add `decodeList` with all newline conventions, blank skipping after cleaning, duplicate keeping and counts. Tests assert positions survive a multi line paste, `\r\n` works, and the counts add up. Satisfies **AC-8**.

No database migration applies: nothing is stored.

## Follow-up

- [ ] Confirm whether `CT` (Chhattisgarh), `UA` (Uttarakhand) and `TS` (Telangana) were ever issued as CIN state codes. The verified table has `CG`, `UT` and `TG` only. Until a source confirms them, they fail with an explanation rather than being accepted on a guess.
- [ ] Note the LLPIN length wording: MCA calls it a 7 character code and displays it as `AAA-0000`, which is 8 characters with the hyphen. The module treats the hyphen as punctuation and validates 7 alphanumeric characters. Worth saying plainly in the interview so the difference does not look like an error.
- [ ] Revisit the state table when MCA publishes a new list, since a table is only as current as its source. Recount on every edit: the first draft silently held 35 rows while claiming 36.
- [ ] The page feature (scope 6) must show `faults[0]` and may offer the rest, since the module collects all of them. It must also highlight against `cleaned`, not the raw paste.
- [ ] Feature 6 needs a visible hint that says one code per line, since two codes on one line fail on length rather than being split.

## References

Reasoning and the options weighed: see [rationale.md](rationale.md).
