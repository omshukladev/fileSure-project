# Verify: results presentation & UI foundation · spec 0003 · updated 27 November 2026

_Steps derived from spec 0003 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

Build `env -u NODE_ENV npm run build` and serve it with `npx serve out -l 4173` before the manual steps, because a static export is what ships. Every step below was run once by hand during the build and passed.

## Manual · UI

- [ ] Paste one valid CIN. Expect one card, the stamp reads `Valid`, and six blocks appear in the order Listing, Industry, State, Year, Type, Serial. → AC-3
- [ ] Paste five lines. Expect five cards and no list. Paste a sixth line. Expect the cards to become disclosure rows. → AC-1
- [ ] Paste a valid LLPIN. Expect the stamp to read `Valid` with an `LLP` label beside it, one block, and the note about what an LLPIN cannot encode. Expect no State, Year, Listing or Type label anywhere in that card. → AC-2, AC-4
- [ ] Look at the LLPIN card and confirm the serial appears once. The decoder gives `AAA-1234` as the code and `AAA1234` as the block value, and only the code should be visible. → AC-4
- [ ] Paste `L17110ZZ1973PLC019786`. Expect the stamp `Not valid`, the sentence asking for a fix, the fault naming `ZZ`, and the five passing blocks still shown. Expect `ZZ` itself visibly marked inside the code. → AC-5
- [ ] Paste `1234567`. Expect `Not valid` with the `LLP` label, the code, and one fault. Expect no blocks section and no crash, because that branch of the decoder has no blocks at all. → AC-5
- [ ] Paste `  l17110mh1973plc019786  `. Expect the card to show `L17110MH1973PLC019786` with a line below reading `Pasted as l17110mh1973plc019786`. Then paste a clean code and confirm that line is absent. → AC-6
- [ ] Open a row by keyboard only: Tab to it, press Enter. Expect it to open and to report its expanded state. → AC-7
- [ ] Collapse an LLP row and confirm the state, year and type columns show a dash and the row keeps the same column rhythm as a CIN row. → AC-7
- [ ] At 360 pixels wide, confirm each stacked row shows a visible label above every value and the page does not scroll sideways. → AC-8
- [ ] Clear the field. Expect the hint and one example button, counts at zero, and no results area. Activate the example. Expect two valid results. → AC-9
- [ ] Type freely in a long paste and confirm the counts settle after a short pause rather than on every keystroke. → AC-10
- [ ] Inspect the `role="status"` region. Expect one sentence, polite, atomic, and totals only, never a line per row. → AC-10
- [ ] Paste one identifier and confirm the announcement reads `1 identifier read.` and not `1 identifiers read.`. → AC-10
- [ ] With a fault showing, confirm the mark is an ink tint plus an underline and not the accent colour. → AC-11

## Manual · accessibility and motion

- [ ] Tab from the top. The skip link appears first, then the field, then any row controls. The focus ring is orange on every surface, and it is at full contrast on the first frame rather than fading in.
- [ ] With `prefers-reduced-motion: reduce`, confirm `.rise` reports `animation-name: none` and full opacity, so no result is withheld by motion.
- [ ] In forced colours, confirm a result's state is still readable, because the stamp word carries it rather than the colour.

## Commands

- [ ] `env -u NODE_ENV npm run build` → both routes report `○ (Static)`, no server features. → AC-11
- [ ] `env -u NODE_ENV npm run lint` → no output. → AC-11
- [ ] `env -u NODE_ENV npm run typecheck` → no output. → AC-11
- [ ] `env -u NODE_ENV npx vitest run` → 71 tests pass across 3 files. → AC-1
- [ ] `grep -rn "control-primary\|radius-sm" app components lib` → no matches, because both were removed with the build. → AC-11

## Value sourcing coverage

One step per row of the spec's Value sourcing table, since this is where a mis sourced value shows up.

- [ ] Card or list → change the line count across 5 and 6 and watch the layout flip exactly once. → AC-1
- [ ] Stamp word and LLP label → try all four combinations: valid CIN, invalid CIN, valid LLPIN, invalid LLPIN. → AC-2
- [ ] Code as shown → paste lower case with spaces and confirm the code is cleaned and upper case. → AC-6
- [ ] What was pasted → same paste, confirm the original appears; a clean paste, confirm it does not. → AC-6
- [ ] Plain sentence → confirm `A listed public limited company, registered in Maharashtra in 1973.` for the Reliance CIN, and `An unlisted private limited company, registered in Karnataka in 2010.` for `U72900KA2010PTC086596`. The article must change with listing status. → AC-3
- [ ] Block label, value, meaning → confirm six labels in CIN order and one for an LLPIN. → AC-3, AC-4
- [ ] Failing characters → confirm the mark slices exactly the fault span, not a neighbouring character. → AC-5
- [ ] Fault message and suggestion → paste `L17110OD1973PLC019786` and confirm the suggestion names `OR`. → AC-5
- [ ] Notes → confirm the AP, TG, DD and DN notes appear when those codes are used. → AC-3
- [ ] Four counts → paste a mix and confirm the LLP count covers every LLP line, valid or not. → AC-10
- [ ] Announced text → confirm it matches the four visible figures exactly. → AC-10
- [ ] State, year, type cells → confirm an LLP row dashes all three. → AC-7
- [ ] Empty state example → confirm the example decodes to two valid results. → AC-9
- [ ] Debounce delay → confirm results appear after a pause, not instantly on each key. → AC-10

## Acceptance-criteria coverage

- AC-1 covered by the five and six line switch, the layout flip step, and the `layoutFor` unit test
- AC-2 covered by the four stamp combinations and the LLP label step
- AC-3 covered by the CIN card order step, the sentence step and the notes step
- AC-4 covered by the LLP card steps, including the once only serial
- AC-5 covered by the marked fault step and the invalid LLPIN step, plus the `markSpans` tests
- AC-6 covered by the cleaned code and original line steps
- AC-7 covered by the keyboard open step and the LLP dash step
- AC-8 covered by the 360 pixel step
- AC-9 covered by the empty state and example steps
- AC-10 covered by the debounce step, the live region step and the plural step
- AC-11 covered by the command steps, the fault mark colour step and the dead code grep
