# Rationale: results presentation and UI foundation

## Context

The interface already has a design system, and it is unusually complete for a one page project. Colour is defined in OKLCH so equal steps look equal, every pair was measured rather than estimated, the neutrals are tinted toward the paper hue so the greys belong to the cream, and there is exactly one accent used in exactly three places. Type is two families with distinct jobs, loaded through `next/font` so nothing is fetched at runtime. Motion is one arrival beat, and it never withholds a readable value. There is no shadow anywhere, and the corners are square by decision rather than by omission.

That system was not invented here. It was applied, measured, documented in `.commandcode/design/design-system.md`, and checked by a separate checkup pass that scored it 30 of 60 and named its two blocking findings. Both of those findings are about the page being unfinished, not about the direction: the button is inert because the decoder did not exist, and the placeholder text was too faint. The direction itself held up under scrutiny, which is why this spec reuses it instead of proposing a second one.

What is genuinely undecided is the result display. Nothing in the system says what a decoded code looks like, and it is the part the visitor came for. The brief also names three states to design for, and two of them are result shaped.

## Existing system inventory

Read from `app/globals.css` and `app/page.tsx`, so this spec builds on what is real.

| Layer | What exists | Reused here |
|---|---|---|
| Colour | paper, ink, ink-muted, orange, rule, rule-strong, all OKLCH | yes, unchanged |
| Type | Archivo display and body, IBM Plex Mono for every identifier and legend | yes, unchanged |
| Scale | poster, body 18px, small 14px, legend 11px, micro 9px, readout | micro raised to 11px |
| Spacing | Tailwind scale at four deliberate levels, grouping rule held | yes |
| Edges | square, `--radius-sm: 2px` declared and unused | token removed |
| Depth | rules only, no shadow anywhere | yes |
| Motion | rise, specimen draw, figure write, press, all with a reduced path | extended, same timings |
| Focus | 2px orange at 3px offset, excluded from transitions, forced colours path | yes |
| Assets | none, and none needed | yes |

The one thing worth noting is that the design system doc and the code had already drifted once: the doc listed a radius token the code did not have. The checkup caught it. That is the argument for updating the doc in this feature rather than leaving the result display documented only in a spec.

## The layout decision

**Cards up to five, rows past five.** The limit started at ten and a cross check proved the arithmetic behind it wrong. A valid CIN card carries a code, a sentence and six blocks, each with a label, a value and a meaning, which measures about 140 lines for ten cards. Two screens was never true. The page's own paste box already sits at the fold on a laptop, so a ten card scroll wall would start immediately below it.

Five is about seventy lines, which a person will read, and it lines up with the most common real case: someone checking their own company's code. The number is still a judgement, and it is one tested function, so changing it later is a one line edit.

The alternative worth naming is rows always. It is simpler, because there is one layout, and three codes in three rows would be fine. It loses on this audience: a business owner reading their own code gets a cramped row where the explanation has nowhere to live, and the plain sentence is the product.

**Phones stack the rows.** A row at 360 pixels cannot hold five columns, and sideways scrolling hides the columns that matter. The information is already there in the row, so stacking is a presentation change. One rule decides the layout, the row count, and width only changes how a row presents itself. An earlier draft had phone width choosing cards instead, which contradicted the row count rule and would have produced a third component. The cross check caught it.

**Rows are disclosures, not a table.** The first draft said the table would use a `details` element inside a row. That is invalid HTML: a table row's content must be cells, and browsers move a `details` element out of it. Worse, the full reading expanding inside one column is cramped enough to defeat the expansion. So the element is a list of native `details` disclosures, each styled to line its columns up. The tradeoff is honest and stated: no `table` element means no native table semantics. For one record per line, where each opens into an explanation, a disclosure is a better fit than a grid, but screen reader users get a list rather than a table.

The earlier justification for native `details`, that it keeps the list working with JavaScript off, was also wrong and is now removed. Results only exist after client side decoding, so a visitor without JavaScript never has a row to open. `details` is still the right choice, because it carries its own expanded state and announces it, but the reason is correctness rather than no-JavaScript support.

## The display honesty decision

**Show the cleaned code, and name what was pasted.** This is the decision that most looks like a detail and is not. The decoder reports every position against `cleaned`, because cleaning removes characters: spaces, lower case, invisible characters. If the view displayed the raw paste and used those offsets, a fault would be marked a few characters off, and the marker would point at the wrong character while claiming to be precise.

So the displayed code is always the cleaned one, and one line shows the original only when it differs. A visitor who pasted lower case sees their line acknowledged rather than silently rewritten, which is the difference between cleaning being helpful and cleaning being a lie.

**Show passing blocks alongside the fault.** The decoder deliberately keeps them, and hiding them would throw away work that already exists. A visitor whose state code is wrong still benefits from reading the year and the type they got right.

## The state marking decision

Orange stays at three uses. A result needs three outcomes and the system forbids colour carrying state alone, so the answer is words in a square stamp: `Valid`, `Not valid`, and `LLP` beside the outcome. Ink for valid, muted ink for not valid, neutral for LLP. It is legible in forced colours, it survives a greyscale printout, and it does not quietly turn the accent into a status light.

This is also the honest choice for the audience. A chartered accountant reading a compliance tool does not want a green tick; they want the word, next to the reason.

## No component library

The briefing planned shadcn/ui. That plan predates the design system. What the page actually needs is five primitives: a field, a button, a stamp, a card and a table row. Four already exist or are one utility away, and all of them are already styled from the project's own tokens. Installing a component library now would mean importing a second set of defaults and overriding most of them, and the retuning would be invisible in the video because the result is the same code.

The cost is honest: the accessibility is ours to get right. The mitigation is that the primitives are simple and each one's accessible behaviour is named in the acceptance criteria rather than assumed.

## Options considered

### Option 1: One result contract, two presentations, hand built from tokens

`ResultReading` renders one `Reading`, wrapped by a card and by a disclosure row. A pure `layoutFor` function picks between them. Primitives built by hand from existing tokens.

**Pros**:
- The information is defined once, so the layouts cannot disagree about what a result means.
- Tokens are reused exactly, so the page stays one system.
- Native disclosures carry their own expanded state without script.

**Cons**:
- Three variants to maintain, counting the stacked phone row, and every new field must land in each.
- Accessibility is the project's own responsibility, not inherited.
- No `table` element, so no native table semantics.

### Option 2: Cards only

One card layout for every paste size.

**Pros**:
- One layout, the least code, and the most readable single result.

**Cons**:
- Five hundred cards is the exact failure the brief warns about.
- At roughly fourteen lines each, even ten cards is a scroll wall.

### Option 3: A real table with every column

A `<table>` carrying the code, stamp and all six blocks as columns.

**Pros**:
- Native table semantics, and the densest honest use of space.

**Cons**:
- Unreadable at six columns of blocks, and impossible at 360 pixels.
- The plain sentence has no comfortable home in a cell.

### Option 4: Install shadcn/ui and retune its card, table and badge

Use the library's primitives as the base and restyle to the tokens.

**Pros**:
- Accessible behaviour arrives tested, and it matches what the briefing planned.

**Cons**:
- A dependency tree and a second set of defaults for five primitives.
- The retuning would touch nearly every default, so the library earns little of its keep.

## Rationale

Option 1 was chosen because the expensive part is not drawing a card. It is keeping every view of the same data honest with each other, and honest with the decoder's character positions. A single result contract makes that structural: the sentence, the stamp and the marked span are computed once and rendered three ways, so no view can tell a different story.

Option 2 fails on both sizes: too little for five hundred, too much for ten. Option 3 fails on the phone and gives the sentence nowhere to live. Option 4 loses because the design system already exists and is measured; a library would supply defaults that must be overridden to match tokens that already work.

The tradeoff accepted is three variants and accessibility ownership. Both are named rather than hidden, and the layout rule lives in one tested function so the boundary cannot drift.

## What the cross check changed

This spec was drafted, then cross checked, and nine of its twelve findings were real. They are recorded here because the pattern is worth seeing.

| What was wrong | What it taught |
|---|---|
| Ten cards was called "two screens". It is about 140 lines | An arithmetic claim in a spec is still a claim. It should be measured |
| `details` inside a `table` row was specified. That is invalid HTML | A DOM shape asserted in prose needs checking against the platform, not assuming |
| Phone width choosing cards contradicted the row count rule | Two rules that both pick a layout will eventually disagree |
| The plain sentence had no template at all | The most valuable line on the page cannot be "derived". It needs words |
| The invalid LLPIN branch has no `blocks`, so AC-5 was unimplementable for it | The type was already written. The spec should have been read against it |
| A fourth count was added with no owner and no source | A value on screen needs a named source, even a count |
| The debounce delay had no number | "Debounced" is a description, not a decision |
| The announced sentence had no wording | An accessibility promise needs actual text |
| A valid LLPIN would print its serial twice beside its own code | Two fields that look identical to a reader are a display bug, not a detail |

The last one is the useful habit: read the spec against the real type it consumes. Most of these were visible in `lib/types.ts` before a line of JSX existed.

## Differentiators this creates for the interview

Each is a decision with a reason, not a feature.

- The switch from cards to table is a tested function, not a guess in a component.
- The displayed code is the cleaned one because positions index it, and the original is still named.
- The failing characters are marked from offsets the decoder already reports, so precision is visible rather than claimed.
- State is words in a stamp, so the accent stays rare and the meaning survives greyscale.
- The table expands natively, so a static export keeps working with JavaScript off.
