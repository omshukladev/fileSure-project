# Design system

**Direction:** a late 1960s government data processing bureau. Cream printout stock, a two colour press, monospaced field values, and instrument legends. The page should read like an official document produced by a machine that knows exactly what it is doing.

Every token below is real, lives in `app/globals.css` inside the Tailwind v4 `@theme` block, and is referenced by `app/page.tsx`. Nothing here is aspirational.

## Colour

Built in OKLCH so equal lightness steps look equal. Neutrals are tinted toward the paper hue (H 70 to 85) so the greys feel related to the cream rather than sitting on it coldly. Two ink colours, like a two colour press run: warm near black, and one orange.

| Token | Value | Role | Contrast |
|---|---|---|---|
| `--color-paper` | `oklch(0.975 0.009 85)` | canvas, the printout stock | base |
| `--color-ink` | `oklch(0.23 0.012 70)` | body text, strong rules, button fill | 15.73:1 on paper |
| `--color-ink-muted` | `oklch(0.46 0.015 70)` | secondary prose, legends, hints | 6.65:1 on paper |
| `--color-orange` | `oklch(0.55 0.15 42)` | the one accent: highlighted word, focus ring, button hover | 4.82:1 on paper |
| `--color-orange` as fill | same | button hover, with paper text | 4.82:1, paper on orange |
| `--color-rule` | `oklch(0.78 0.014 75)` | hairlines, ruling inside the paste box, dividers | structural |
| `--color-rule-strong` | `oklch(0.23 0.012 70)` | section borders, underline under each block specimen | structural |

Strategy: **whisper**. The surface is cream, the ink carries the hierarchy, and the orange appears exactly three times on the page: one word in the headline, the button hover, and the focus ring. It stays rare enough to mean something.

Every pair above was measured with the design check script, not estimated. All pass WCAG AA for body text and APCA Lc 60 or better, except the muted ink at Lc 69 which is used for secondary prose only.

## Typography

Two families, each with a distinct job. No third.

| Token | Family | Job |
|---|---|---|
| `--font-display` | Archivo, weight 800, `font-stretch: 82%` | poster titles only. Condensed, heavy, tight. The bureau poster voice |
| `--font-sans` | Archivo, normal width | body prose, UI text |
| `--font-mono` | IBM Plex Mono | every identifier, every legend, every numeric readout |

Both are loaded through `next/font`, self hosted at build time, so there is no runtime request to a font CDN. The `wdth` axis is loaded on Archivo so the condensed headline is a real axis setting rather than a fake scale.

**Scale**

| Role | Size | Setting |
|---|---|---|
| Poster title | `2.75rem` → `4.75rem` | weight 800, 82% width, `line-height: 0.88`, `letter-spacing: -0.028em`, uppercase |
| Body | `1.125rem` | `line-height: 1.6`, measure capped at `60ch` |
| Small body | `0.875rem` | `line-height: 1.6` |
| Legend | `0.6875rem` | monospace, `letter-spacing: 0.16em`, uppercase |
| Micro legend | `0.5625rem` | same treatment, for the block specimens |
| Numeric readout | `1.5rem` → `1.875rem` | monospace, `tabular-nums` |

Body measure is capped at `60ch`, inside the readable band. The poster title uses `text-wrap: balance` so its line breaks are intentional at every width. Numbers use `font-variant-numeric: tabular-nums` because the readout digits sit in a row and must not shift as they change.

Uppercase is used only for legends and the poster title, both short. No uppercase body text.

## Spacing

Tailwind's default scale, used at four deliberate levels rather than randomly.

| Level | Value | Where |
|---|---|---|
| Micro | `0.25rem` to `0.5rem` | gaps inside a specimen block, label to value |
| Component | `1rem` to `1.5rem` | prose to specimen, legend to field |
| Section | `3.5rem` to `5rem` | between the three page sections |
| Page | `2.5rem` / `3.5rem` | outer padding, tighter on a phone |

The grouping rule holds: the gap between groups is always at least twice the gap inside a group. Section breaks get a `2px` ink border so the separation is structural, not decorative.

## Edges and depth

This era is **rectangular**. Instruments and forms have corners. There is no pill in the system.

| Token | Value | Role |
|---|---|---|
| `--radius-sm` | removed | declared, never used, deleted once the result display landed |

Radius is effectively zero on the page. The paste box, the button and the specimen underlines are all square. That is the decision, not an omission.

Depth comes from **rules, not shadows**. There is no `box-shadow` anywhere in the system. Containment is a `1px` ink border on the paste box, `2px` ink borders on section boundaries, and a `1px` rule plus a `2px` ink top rail on a result docket. One containment strategy, held.

## The result display

The results are the product, so they have their own contract. This section is the source of truth for how a decoded reading is shown.

**The switch point is five.** A paste of five lines or fewer renders one card per result. Six or more render as disclosure rows. The rule lives in one function, `layoutFor` in `lib/results/layout.ts`, and screen width never changes it. Width only changes how a row presents itself.

**Why five.** A card carries a code, a sentence and six blocks, and each block renders a label, a value and a meaning. That measures about fourteen lines per card, so five is about seventy lines, which a person will read, and ten would be about a hundred and forty. The paste box already sits at the fold on a laptop, so a taller card wall would bury the answer.

**The stamp.** Outcome is a word in a square outline, never colour alone.

| State | Word | Kind label | Colour |
|---|---|---|---|
| valid CIN | `Valid` | none | ink |
| invalid CIN | `Not valid` | none | ink muted |
| valid LLPIN | `Valid` | `LLP` | ink, label muted |
| invalid LLPIN | `Not valid` | `LLP` | ink muted |

The stamp is `.stamp` with `.stamp-pass` or `.stamp-fail`. The kind label is a `.stamp-kind` child, separated by a hairline rather than a second badge, so one result carries one mark. It survives greyscale and forced colours because the word is always present.

**The card** is a docket: `.docket`, a `1px` rule outline with a `2px` ink top rail. One result, full width.

**The row** is a native `<details>` styled as a grid, not a table element. A `details` element cannot be a child of a `tr` (a row may only contain cells, and browsers move anything else out of the table), so the list is a styled disclosure list and gives up native table semantics on purpose. A row holds the code, the stamp, the state, the year and the type; opening it reveals the sentence, the faults and every block. An LLP row shows a dash in the state, year and type columns, with `Not applicable` available to a screen reader only, and the dash columns are fixed width so a short row keeps the same rhythm.

**The failing characters** are marked inline by `.fault-mark`: a 14 percent ink tint plus a `2px` underline. Not orange, because the accent has three uses and a fourth would dilute it, and not colour alone, because a tint by itself vanishes in forced colours and in a printout.

**The code shown is always the cleaned one.** Decoder positions index `cleaned`, so showing the raw paste would mark the wrong characters. When cleaning changed the input, one line names what was pasted.

**Counts** are four: Read, Valid, Not valid, LLP. The LLP count covers every line of that kind, valid or not. The same object feeds the visible figures and the polite live region, so the announcement can never disagree with the display.

**Debounce** is 250 milliseconds. Decoding is local and synchronous, so a loading state would be a lie about work that is not happening.

## Motion

One arrival beat per element, not a blanket scroll reveal.

| Element | Motion | Timing |
|---|---|---|
| Poster title | rise 10px, fade, blur 4px to 0 | 520ms, `cubic-bezier(0.16, 0.84, 0.28, 1)` |
| Prose and specimen | same rise, offset | +80ms |
| Block specimen rules | six underlines draw left to right, `scaleX(0)` to `1` | 320ms each, 45ms stagger from 220ms |
| Readout figures | drop in from `-0.18em`, replays on value change | 180ms |
| Primary button press | `scale(0.97)` | 100ms, faster than hover because touch feedback comes first |
| Everything else | none | the form is readable immediately |

The six specimen underlines are the one piece of motion that explains something: the diagram exists to teach that a CIN's blocks arrive in a fixed order, so the rules draw in that order. Only the rules move. The characters are solid at paint, so no animation ever withholds a readable value.

The form section carries no entrance animation, deliberately. A tool must be usable the moment it paints. Only `transform`, `opacity` and `filter` animate; no layout property moves.

`prefers-reduced-motion: reduce` removes the rise entirely, leaves the specimen rules drawn at full scale, and lets figures arrive without travelling. Transitions are off, so nothing moves.

Hover on the button swaps ink fill for orange fill over 150ms. There is no flicker, no glow and no scanline anywhere, because the era is a print bureau rather than a screen.

## Focus and access

Focus is a `2px` orange outline at `3px` offset on `:focus-visible`, never removed. The orange clears 5.18:1 against the white paste box and 4.82:1 against the paper, so the ring is visible on every surface it crosses. It is excluded from every transition, so it paints at full contrast on the first frame rather than fading in. Under `forced-colors: active` it becomes a `3px` system `Highlight` ring.

The paste box has a real `<label>` and an `aria-describedby` hint. The counts are a `<dl>` with real `<dt>` and `<dd>`. The empty state's example is a real `<button type="button">`, not a div. The CIN block specimen is an ordered list because the order is the meaning.

Results appear as the visitor types, 250 milliseconds after the last keystroke. There is no submit button, because there is nothing to submit: the page decodes locally on every settled change. The old inert "Read the list" button and its `control-primary` styles were removed with the build, since a control that does nothing is worse than no control.

Every control that changes state reports it. A stable `role="status"` region with `aria-live="polite"` and `aria-atomic="true"` holds the running count text, so repeat reads announce consistently rather than inserting a new region each time. It is `sr-only`: it speaks without occupying space.

A skip link is the first focusable element and becomes visible on focus, jumping to the checker section, which carries `scroll-mt-6` so the anchor target is not swallowed by the top edge. The section is a labelled region via `aria-labelledby`.

Colour never carries state alone: the readout labels say "Valid" and "Not valid" in words, not only in colour.

## Assets and icons

No icons and no images. The specimen blocks are type and rules, which is the honest form for a document that is entirely text. Nothing was hand drawn and no icon set was installed, because the page needs none.

## Not yet tokenized

These are intentional and belong to the layout, not the token layer:

- The `2px` and `1px` border widths are raw Tailwind values. They are structural and singular enough not to warrant a token.
- The grid column ratio `1.15fr 1fr` on the intro row is a one off composition decision.
- The `82%` font width on the poster is set in the `.poster` utility rather than a token, because it belongs to that one role.

## What is deliberately absent

No gradients of any kind. No glass or blur. No shadows. No pills. No cards, because the page has no genuinely card shaped content: it is a poster, a form and a readout. No section eyebrow labels above headings, since the legends name real fields rather than decorating a heading. No emoji. No invented cockpit jargon, because the labels name real actions.
