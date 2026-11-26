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
| `--radius-sm` | `2px` | not yet used, reserved |
| `--radius-md` | `3px` | not yet used, reserved |

Radius is effectively zero on the page. The paste box, the button and the specimen underlines are all square. That is the decision, not an omission.

Depth comes from **rules, not shadows**. There is no `box-shadow` anywhere in the system. Containment is a `1px` ink border on the paste box and `2px` ink borders on section boundaries. One containment strategy, held.

## Motion

One arrival beat per element, not a blanket scroll reveal.

| Element | Motion | Timing |
|---|---|---|
| Poster title | rise 10px, fade in | 520ms, `cubic-bezier(0.16, 0.84, 0.28, 1)` |
| Prose and specimen | same rise, offset | +70ms delay |
| Everything else | none | the form is readable immediately |

The form section carries no entrance animation, deliberately. A tool must be usable the moment it paints. Only `transform` and `opacity` animate.

`prefers-reduced-motion: reduce` sets every animation and transition to `0.01ms` and removes the rise transform entirely, so nothing moves.

Hover on the button swaps ink fill for orange fill over 150ms. There is no flicker, no glow and no scanline anywhere, because the era is a print bureau rather than a screen.

## Focus and access

Focus is a `2px` orange outline at `3px` offset on `:focus-visible`, never removed. The orange clears 4.82:1 against the paper, so the ring is visible on every surface it crosses.

The paste box has a real `<label>` and an `aria-describedby` hint. The counts are a `<dl>` with real `<dt>` and `<dd>`. The button is a real `<button type="button">`, not a div. The CIN block specimen is an ordered list because the order is the meaning.

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
