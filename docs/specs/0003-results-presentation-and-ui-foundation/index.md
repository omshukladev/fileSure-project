# 0003. Render decoded results as cards, a list, and one result contract

**Date**: 2026-11-27
**Status**: Proposed

## Summary

This settles how a decoded result is shown, which is the last undecided part of the interface. Up to five lines read as cards, because a card can hold the plain sentence and every labelled block. Past five the same information becomes a list of rows, where each row opens into its full reading. A phone stacks the same rows with a label beside each value. The visual language does not change: it already exists in `globals.css`, and this feature reuses it rather than inventing a second look.

## Requirements

**User stories**:
- As a visitor with a few codes, I want each one explained in a card, so that I can read the meaning without decoding anything myself.
- As a visitor pasting a hundred codes, I want rows I can scan, so that I can find the wrong ones without scrolling through paragraphs.
- As a visitor on a phone, I want the same answers, so that I never scroll sideways to find the state.
- As a visitor with a wrong code, I want to see which character to fix, so that I do not count to position nine myself.

**Acceptance criteria**:

- **AC-1**: `layoutFor(rowCount)` returns `cards` for five or fewer and `rows` for six or more. It is the only place the boundary exists, it is pure and unit tested, and it takes no argument other than the row count. Screen width never changes the choice.
- **AC-2**: Every result states its outcome in words, and the full space is enumerated: a valid CIN reads `Valid`, an invalid CIN reads `Not valid`, a valid LLPIN reads `Valid` with an `LLP` label, an invalid LLPIN reads `Not valid` with an `LLP` label. The word is always present in the markup, so colour is never the only signal and a screen reader always hears it.
- **AC-3**: A valid CIN card shows the cleaned code, the plain sentence, all six labelled blocks in the order Listing, Industry, State, Year, Type, Serial, and any notes. Each block shows its value and its meaning.
- **AC-4**: A valid LLPIN card shows the cleaned code, the plain sentence, one labelled block, and the decoder's note saying what an LLPIN cannot tell you. It shows no State, Year, Listing or Type label, and no empty field standing in for one. The block's serial is not printed a second time beside the code.
- **AC-5**: An invalid result shows the plain sentence and every fault, each with its message and, when the decoder supplied one, its suggestion. The failing characters are marked inside the displayed code using `start` and `length`. A `cin` result also shows the blocks that decoded. An `llpin` result has no blocks at all, so it shows the code and the faults only, and the layout must not assume blocks exist.
- **AC-6**: The code shown is always the decoder's `cleaned` string, because that is the only string its positions index. When cleaning changed the input, one line names what was pasted. When it did not, that line is absent.
- **AC-7**: Six or more results render as a list of rows, each row a native `details` element inside a `summary`, so a row opens with no JavaScript and announces its expanded state itself. A collapsed row shows the code, the outcome stamp, the state, the year and the type. An LLP row shows a dash in the state, year and type cells, with `Not applicable` available to a screen reader. Opening a row shows the plain sentence, the faults with their marks, and the blocks.
- **AC-8**: Below 640 pixels each row stacks, with every value carrying its own visible label, and the same open control remains. No result view causes horizontal scrolling at 360 pixels wide.
- **AC-9**: An empty box shows one line saying what to paste and one example that fills the field when activated. Counts read zero and no results region renders.
- **AC-10**: Results update as the text changes, 250 milliseconds after the last keystroke, so a long paste does not decode on every character. The counts region is a polite live region carrying `aria-atomic`, announcing the totals sentence once per settled decode and never per row.
- **AC-11**: No new colour, font or radius is introduced. The result display uses only existing `@theme` tokens. The unused `--radius-sm` token is deleted as the final build step, after the last component lands and nothing uses it.

## Decision

**Chosen option**: Option 1: one result contract, two presentations, hand built from existing tokens

A single `ResultReading` component reads a decoder `Reading` and renders the stamp, the marked code, the sentence and the blocks. `ResultCard` and `ResultRow` wrap it. `layoutFor` alone picks between them. All primitives are built by hand from the tokens in `globals.css`.

**Implementation skills**: none installed. The project has no UI community skill, and this feature deliberately builds from its own tokens rather than a library's defaults.

## Feature design

**Component inventory**:

| Component | File | Job | Client |
|---|---|---|---|
| `ResultOutcome` | `components/results/outcome.tsx` | The word stamp and the LLP label | no `'use client'` needed |
| `ResultCode` | `components/results/result-code.tsx` | The cleaned code with failing spans marked | no |
| `ResultBlocks` | `components/results/result-blocks.tsx` | The labelled values, or nothing for an invalid LLPIN | no |
| `ResultReading` | `components/results/result-reading.tsx` | Sentence, faults, blocks: the body both layouts share | no |
| `ResultCard` | `components/results/result-card.tsx` | One result, full width | no |
| `ResultRow` | `components/results/result-row.tsx` | One native details row, also the stacked phone form | no |
| `ResultList` | `components/results/result-list.tsx` | The rows | no |
| `Results` | `components/results/results.tsx` | Calls `layoutFor`, renders cards or the list | no |
| `EmptyState` | `components/results/empty-state.tsx` | The hint and the example, takes `onFill` | no |
| `Checker` | `components/checker.tsx` | The field, counts, debounce, text state | yes, `'use client'` |

Only `Checker` carries `'use client'`. Everything below it is imported by a client component, so it all compiles into the client bundle and prerenders fine under `output: 'export'`. Stating that once here prevents a future reader adding a directive that changes nothing.

**Data model sketch**:

Nothing is stored. The feature consumes `Reading` from `lib/types.ts` unchanged. Three additions, all pure and all in `lib/results/`:

```ts
// layout.ts
type Layout = "cards" | "rows";
const CARD_LIMIT = 5;
const DEBOUNCE_MS = 250;
function layoutFor(rowCount: number): Layout;

// counts.ts
type Counts = { read: number; valid: number; invalid: number; llp: number };
function countReadings(readings: Reading[]): Counts;
function totalsSentence(counts: Counts): string;

// summary.ts
function plainSentence(reading: Reading): string;
```

`countReadings` derives all four numbers from `readings`, so `decodeList` needs no new field. `llp` counts every reading whose kind is `llpin`, valid or not.

**The plain sentence, pinned**

Each is a fixed template with decoder values slotted in, so it is testable and cannot drift.

| Case | Template | Example |
|---|---|---|
| Valid CIN | `A {listing} {type}, registered in {state} in {year}.` | A listed public limited company, registered in Maharashtra in 1973. |
| Valid LLPIN | `An LLP registration number. It identifies the LLP and nothing more.` | same, every time |
| Invalid CIN | `This one needs a fix before it can be read.` | same, plus the faults below |
| Invalid LLPIN | `This one is not a valid LLP registration number.` | same |

The templates use only `kind`, `valid` and the block meanings the decoder already supplies. The sentence never asserts that a company exists, which the decoder cannot know.

**The stamp, pinned**

| Kind | Valid | Stamp word | LLP label | Token |
|---|---|---|---|---|
| cin | true | Valid | none | ink |
| cin | false | Not valid | none | ink-muted |
| llpin | true | Valid | LLP | ink, label in ink-muted |
| llpin | false | Not valid | LLP | ink-muted |

Square, `1px` ink border, `2px` horizontal padding, mono at the legend size, uppercase. No fill. Orange is untouched, so it keeps its three uses.

**The totals sentence, pinned**

`{read} identifiers read. {valid} valid, {invalid} not valid. {llp} are LLPs.`

Built by `totalsSentence(counts)` from the same object the visible counts render, so the announcement and the display cannot disagree.

**Interface surface**:

| Surface | Inputs | Output | Notes |
|---|---|---|---|
| `Checker` | none | form and results | Owns text state, the 250ms debounce, and `countReadings` |
| `Results` | `readings` | cards or list | The only caller of `layoutFor` |
| `EmptyState` | `onFill: () => void` | hint and example | `Checker` owns the field value and passes the handler |
| `ResultReading` | `reading` | sentence, faults, blocks | Branches on `reading.valid` and `reading.kind` |
| `ResultCode` | `cleaned`, `faults` | marked code | Slices `cleaned` by offsets, builds spans, never rewrites markup |
| `ResultRow` | `reading` | `<details>` row | Native disclosure |

**Value sourcing**:

| Value displayed | Source |
|---|---|
| Card or list | `layoutFor(readings.length)` |
| Stamp word and LLP label | `reading.valid` and `reading.kind`, per the stamped table above |
| Code as shown | `reading.cleaned` |
| What was pasted | `reading.input`, shown only when it differs from `cleaned` |
| Plain sentence | `plainSentence(reading)`, fixed templates above |
| Block label, value, meaning | `reading.blocks`, already ordered by the decoder |
| Failing characters | `reading.faults[].start` and `.length` into `cleaned` |
| Fault message and suggestion | `reading.faults[].message`, `.suggestion` when defined |
| Notes | `reading.notes`, on a valid result |
| Four counts | `countReadings(readings)`, LLP over every `kind === "llpin"` |
| Announced text | `totalsSentence(counts)`, same object as the visible counts |
| State, year, type cells | `reading.blocks` by label, dash when the label is absent |
| Empty state example | `EXAMPLE_INPUT` in `lib/results/examples.ts`, one CIN and one LLPIN |
| Debounce delay | `DEBOUNCE_MS = 250` in `lib/results/layout.ts` |

The example constant is `L17110MH1973PLC019786` then `AAA-1234`, both confirmed to decode as valid, so the example a stranger clicks actually works.

**Key invariants**:
- `layoutFor` is the only place the five row boundary exists.
- A displayed code is always `reading.cleaned`. Nothing slices `reading.input`.
- No component renders a State, Year, Listing or Type label for an `llpin` reading.
- No component reads `reading.blocks` without first narrowing on `kind`, because an invalid LLPIN has no such property.
- The visible counts and the announced sentence read from one `Counts` object.
- Every colour is a token. No raw colour value is introduced.
- Only `transform` and `opacity` animate, and no result becomes readable only after a transition.

**Security model**: no data leaves the browser, no storage, no network, no authentication. Pasted text renders as text only. React escapes it, nothing is set as HTML, and the one highlighted span is built from character offsets rather than by string replacement into markup.

**Configuration required**: none.

**Critical test scenarios**:
- Boundary: 5 rows gives cards, 6 gives rows, satisfies **AC-1**
- Happy path: a valid CIN card shows six blocks in order with meanings and the pinned sentence, satisfies **AC-3**
- Happy path: a valid LLPIN card shows one block, the note and no state or year label, and does not repeat the serial beside the code, satisfies **AC-4**
- Failure: an invalid CIN marks the failing characters at the reported offset and still shows the passing blocks, satisfies **AC-5**
- Failure: `1234567` returns an invalid LLPIN with no `blocks` property, and the card renders the code and fault with no crash, satisfies **AC-5**
- Boundary: a paste that cleans unchanged shows no original line; one with spaces or lower case shows it, satisfies **AC-6**
- Accessibility: a row opens with the keyboard, reports expanded state, and its collapsed cells name themselves, satisfies **AC-7**
- Responsive: at 360 pixels each row stacks with a visible label per value and no horizontal scroll, satisfies **AC-8**
- Empty: activating the example fills the field and renders two results, satisfies **AC-9**
- Live region: typing a long paste announces once after settling, satisfies **AC-10**

## Context

The page already has a finished visual language: a cream printout surface, one orange accent used three times, square corners, held rules instead of shadows, and motion that never withholds a readable value. It is documented, measured and consistent. A second visual system would be the worst outcome here, which is why this spec reuses it.

What was never decided is the part the visitor came for. The decoder can now say everything about a code, and nothing says what that looks like. The brief names three states to design for and two are result shaped: a wrong input and five hundred lines. A single card design cannot serve both, because the element that makes one code pleasant makes five hundred unusable.

A correctness pressure appears only in the view. The decoder reports positions against the cleaned string, so a view showing the raw paste would mark the wrong characters. That is why the display rule belongs in this decision rather than in styling.

## Consequences

**Positive**:
- The information does not change when the layout does, so the visitor never relearns the page.
- The switch is one tested function, so the boundary cannot drift.
- Reusing the tokens costs nothing and keeps the page one system.
- Native disclosures keep the list keyboard accessible with no scripted state to get wrong.
- Decoder positions become visible value rather than unused data.

**Negative / tradeoffs**:
- Three variants to maintain: card, row, and stacked row. Every future field must land in each.
- Five is a judgement, and someone with six short codes sees rows where cards would have been nicer.
- The stacked row needs a visible label per value, which is markup the wide row does not need.
- Native `details` gives no control over the open animation, so opening is instant.
- Building the primitives by hand makes the accessibility the project's own responsibility.
- The list is not a `table` element, so it gives up native table semantics. Each row is a disclosure, which suits one record far better than a grid, but a screen reader user gets a list rather than a table.

**Neutral**:
- The briefing planned shadcn/ui. This supersedes that: five primitives from existing tokens.
- `design-system.md` is updated so the source of truth stays in one place.
- The 9px micro legend is raised to 11px, closing the lowest severity checkup finding.

## Build plan

Ordered by the Skateboard approach: prove one result end to end, then the second presentation, then the states that get forgotten.

1. Write `lib/results/layout.ts`, `counts.ts`, `summary.ts` and `examples.ts`, all pure and all unit tested, including the 5 and 6 row boundary, the four counts, every sentence template and the totals sentence. Satisfies **AC-1**, **AC-10**.
2. Add the outcome stamp and card rule utilities to `globals.css`, and raise the micro legend to 11px, with the stamp defined per the stamped table. Satisfies **AC-2**, **AC-11**.
3. Build `ResultOutcome`, `ResultCode` and `ResultBlocks`, with tests that a fault offset marks the right characters and that an invalid LLPIN renders with no blocks. Satisfies **AC-2**, **AC-5**, **AC-6**.
4. Build `ResultReading` and `ResultCard`, then `EmptyState` and `Checker`, so one code typed shows one correct card end to end, including the empty state and the debounce. Satisfies **AC-3**, **AC-4**, **AC-9**, **AC-10**.
5. Change the counts region from three to four columns, rendering `countReadings`, with the phone behaviour for four counts and the announced sentence. Satisfies **AC-10**.
6. Build `ResultRow` and `ResultList` with native details, then `Results` calling `layoutFor`. Satisfies **AC-7**.
7. Make the row stack below 640 pixels with a visible label per value, verified at 360 with no horizontal scroll. Satisfies **AC-8**.
8. Update `.commandcode/design/design-system.md` with the result display, the stamp, the switch point and the phone behaviour. Satisfies **AC-11**.
9. Delete `--radius-sm` once the last component has landed and nothing references it. Satisfies **AC-11**.

No database migration applies: nothing is stored.

## Follow-up

- [ ] The checkup's finding 1, the inert button, belongs to the page build and is superseded here: results now render as the visitor types, so the button is removed rather than wired.
- [ ] The checkup's finding 4, the paste box below the fold on a laptop, is not fixed here. Decide it in feature 6 now that the results are real.
- [ ] Revisit the five row limit once real pastes are tried. If reviewers habitually paste six to ten, the limit is wrong.
- [ ] Confirm the checkup's placeholder contrast and focus transition findings are still closed in the built page.

## Rationale

Reasoning and the options weighed: see [rationale.md](rationale.md).
