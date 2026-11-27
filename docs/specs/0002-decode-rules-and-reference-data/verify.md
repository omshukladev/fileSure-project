# Verify: decode rules & reference data · spec 0002 · updated 2026-11-27

_Steps derived from spec 0002 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

Verified 2026-11-27: 46 of 46 tests, typecheck, lint and the static build all pass, and the public API was driven with independent inputs. Each ticked step below was run in that session.

## Commands

- [x] `env -u NODE_ENV npm test` → 46 tests pass, 0 fail → AC-1 to AC-10
- [x] `env -u NODE_ENV npm run typecheck` → no output, exit 0 → AC-9
- [x] `env -u NODE_ENV npm run lint` → no output, exit 0 → AC-9
- [x] `env -u NODE_ENV npm run build` → `/` and `/_not-found` both marked static (`○`) → AC-9
- [x] `grep -rn "from ['\"]react" lib/` → no match, the module stays free of React → AC-9
- [x] `grep -oE 'code: "[A-Z]{2}"' lib/reference/states.ts | wc -l` → 36 → AC-6
- [x] `grep -oE 'code: "[A-Z]{3}"' lib/reference/company-types.ts | wc -l` → 12 → AC-6

## UI / manual

Not yet verifiable in a browser. Nothing imports `lib/` until feature 6 builds the page. The module is proved by the suite and by driving its public functions directly.

- [x] Open `lib/decode.test.ts` and confirm a test exists per acceptance criterion, named `AC-1` to `AC-10` → AC-10
- [x] Confirm no test asserts a message string where a `FaultCode` would do, so rewording never breaks the suite → AC-2
- [x] Confirm `lib/reference/states.ts` contains `MH` with the meaning Maharashtra → AC-1
- [x] Confirm `AP`, `DD` and `DN` carry a `note` and no other entry does → AC-6
- [x] For every block of every valid result, assert `cleaned.slice(start, start + length)` is non empty and inside `cleaned`; for a CIN it must equal the block value. This is the assertion whose absence let a wrong LLPIN span ship → AC-1, AC-3

## Value sourcing check

Each row names where its value comes from. Vary the input and confirm the value follows the named source, not a guess.

- [x] Pin the clock with `{ now: new Date("2020-01-01") }` and paste `L17110MH2026PLC019786` → fails as `YEAR_IN_FUTURE` saying the latest possible year is 2020, proving the year bound reads the injected clock → AC-9
- [x] Decode `L17110MH1973PLC019786` and read `cleaned` → equals the input, and `input` keeps what was pasted, proving the two strings are distinct sources → AC-5
- [x] Decode ` l17110mh1973plc019786 ` and confirm `cleaned` is upper case with no spaces while `input` still holds the raw text → AC-4
- [x] Decode `L17110OD1973PLC019786` and confirm `faults[0].suggestion` is `OR`, then decode `L17110ZZ1973PLC019786` and confirm no suggestion → AC-6
- [x] Decode `L17110AP1973PLC019786` and confirm the note mentions `TG`; decode `L17110TG1973PLC019786` and confirm `notes` is empty → AC-6
- [x] Decode `AAA-1234` and `AAA1234` and confirm both give the same block value with the hyphen absent → AC-3
- [x] Paste five lines with one blank and a trailing newline into `decodeList` and confirm `read` equals the four real lines, with `valid + invalid` equal to `read` → AC-8

## Acceptance-criteria coverage

- AC-1 covered by the Reliance happy path test and the `MH` table check · every one of the 36 state codes and 12 type codes accepted at runtime
- AC-2 covered by the multi fault test, the kept blocks test, and the length stops block checking test · three faults reported together on one line with correct positions
- AC-3 covered by the LLPIN tests, both hyphen forms, the forbidden label check, and the shape faults · the span fix confirmed at runtime
- AC-4 covered by lower case, inner spaces, byte order mark, leading zero and cleaned versus raw tests
- AC-5 covered by the length counts, the hyphen in a CIN, and the illegal character position tests · 18 hostile inputs all kept their faults inside `cleaned`
- AC-6 covered by the `OD`, `AP`, `TG`, `DD`/`DN`, legacy code, type code and full table tests
- AC-7 covered by both boundary years, the future year, the letter year and the injected clock test · 1849 fails, 1850 and 2026 pass, 2027 fails
- AC-8 covered by blank skipping, Windows endings, duplicates, counts and empty input tests · all three newline styles give `{read: 4, valid: 3, invalid: 1}`
- AC-9 covered by the hostile input, determinism and purity checks
- AC-10 covered by the every fault code reachable test
