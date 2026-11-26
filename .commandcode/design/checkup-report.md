# Checkup: FileSure CIN checker

**Mode:** `/design checkup` · a fast vital-sign read, not a full review
**Date:** 26 November 2026
**Surface:** the single page in `app/page.tsx`, at the scaffold stage
**Context:** spec 0001 records this as the scaffold. The checker logic lands in a later slice, which is why finding 1 exists at all.

## Score

**30 / 60**

| Vital | Score | Status | Read |
|---|---|---|---|
| Intentionality | 5 / 10 | Watch | Token system is real and used, but two dead colour tokens and one documented radius that does not exist |
| Readability | 0 / 10 | Critical | Placeholder text measures 2.77:1 against its own field |
| Usability | 0 / 10 | Critical | The primary action is inert. Clicking or pressing Enter changes nothing |
| Responsiveness | 10 / 10 | Healthy | No overflow at 320px or at 200% zoom, field is 16px so iOS will not zoom |
| Speed | 10 / 10 | Healthy | Page loads in 189ms, zero console errors, self-hosted fonts |
| Accessibility | 5 / 10 | Watch | Keyboard path works and the ring lands correctly, but it starts invisible for about 150ms |

**Verdict: Block.** Two HIGH findings are standing.

## TL;DR

The visual system is the strongest part of this page and it is doing real work: one deliberate era, one accent used three times, square corners held throughout, and motion that respects the form being readable at paint. It does not look assembled from defaults.

Two things stop it being shippable. The **Read the list button does nothing**, and the **placeholder text is too faint**. Both are small fixes. Neither is a design-direction problem.

## Findings

| # | Severity | Discipline | Location | Before | After | Why |
|---|---|---|---|---|---|---|
| 1 | HIGH | Interaction | `app/page.tsx:100` | `<button type="button">` with no handler; click and Enter both leave the counts at `0 0 0` | Wire it to the decoder, or render it `disabled` with the label "Checker arrives next slice" until that logic exists | The page shows a fully styled, enabled button and a placeholder containing three real codes. A visitor will click it and nothing will happen. Verified by click and by keyboard Enter |
| 2 | HIGH | Color | `app/page.tsx:82` | `placeholder:text-ink-muted/60` composites to `rgb(157 153 147)` on `rgb(253 252 251)` = **2.77:1** | Drop the `/60` so the placeholder uses `--color-ink-muted` at 6.65:1 | Placeholder text is text. It misses 4.5:1 by a wide margin. Measured from rendered pixels, not estimated |
| 3 | MEDIUM | Accessibility | `app/page.tsx:96` | `transition-colors` includes `outline-color`, so the focus ring starts at paper on paper (**1.00:1**) and reaches orange only after about 150ms | Transition only `background-color` and `border-color`, e.g. `transition-[background-color,border-color]` | Tab lands on the button with a nearly invisible ring. It resolves correctly, so this is a timing defect, not a missing ring |
| 4 | MEDIUM | Layout | `app/page.tsx:18-19` | On a 1440 by 900 laptop the paste box starts at 771px, so only 52 percent of it is above the fold | Trim the hero: reduce `pt-20` and the `lg` headline size so the field starts above roughly 640px | A first-time visitor sees a poster and a specimen, then has to scroll to find the actual tool. The page's one job is below the fold |
| 5 | MEDIUM | Type | `globals.css:24` vs `design-system.md:72` | The design system documents `--radius-md: 3px`; that token does not exist in the code and resolves to Tailwind's default `.375rem` | Either add `--radius-md: 3px` to the `@theme` block or delete the row | The design system is meant to be the source of truth. One documented value is currently wrong, which is worse than undocumented |
| 6 | LOW | Type | `globals.css:9-12` | `--color-phosphor` and `--color-phosphor-dim` are declared and never referenced by any component | Delete both | Dead tokens claim a dark instrument palette that the page does not have. They were left over from an earlier direction |
| 7 | LOW | Type | `app/page.tsx:41` | The six block labels render at 9px uppercase with `0.16em` tracking | Raise to 11px to match the other legend, or drop the tracking to `0.12em` | It clears contrast, so this is not a failure, but tracked uppercase at 9px is at the edge on a laptop screen |

## What is working

| Signal | Evidence |
|---|---|
| One era, held | Cream stock, two-colour press, square corners, ruled printout lines. Nothing on the page contradicts the premise |
| Accent discipline | Orange appears three times: one word in the headline, the button hover, the focus ring. It reads as emphasis because it is rare |
| Motion with a rule | Only the headline, prose and specimen animate. The form section carries no entrance animation, so the tool is readable at paint. `prefers-reduced-motion` verified to set `animation-name: none` |
| Real text hierarchy | 76px poster, 18px body at 60ch, 11px legends, tabular numerals in the readout. Good separation between steps |
| Honest copy | "A valid format is not a real company. Only MCA can confirm that." That sentence is the most valuable line on the page |

## Reflexes checked

| Check | Result |
|---|---|
| Purple or blue gradients | None. The only gradient is a hairline repeating rule inside the paste box, which has a stated job |
| Card-ification | None. The page is a poster, a form and a readout |
| Pills and uniform radius | None. Corners are square by decision |
| Heavy shadows | None anywhere in the CSS |
| Reflex fonts | Archivo and IBM Plex Mono, both serving a stated role. No Inter, no Roboto, no reflex pairing |
| Emoji, exclamations, filler copy | None found |
| Eyebrow label above a heading | None. The header legends are a running head; "Paste your identifiers" is a real field label |
| Off-scale spacing | None. Observed values sit on the Tailwind scale |
| Blanket scroll reveal | None. Three elements, one beat |
| Mixed icon sets | No icons at all, so nothing to mismatch |

## Considered but rejected

| Location | Candidate | Rejected because |
|---|---|---|
| `app/page.tsx:82` | `bg-white/70` on the field looks like an arbitrary colour | It is deliberate: the field must read lighter than the page to look like a form on paper. The composite measures fine and it earns its place |
| `globals.css:33` | The ruled background is a gradient, which the reflex list mentions | It is a hairline pattern with a job (printout ruling), not a decorative colour gradient. Removing it would flatten the era decision |
| `app/page.tsx:19` | The 76px headline is large for a tool | It is the brand register at the top of a single page, and it passes the squint test. The real problem is its height pushing the form down, which is finding 4, not the size itself |
| `app/page.tsx` | No `aria-live` region despite the spec requiring one | The counts never change yet because no decoding exists, so nothing is silently appearing. This becomes a live requirement in the decoder slice, not a defect today |
| `app/page.tsx` | Square corners and no shadows could read as an unfinished radius system | Deliberate: instruments and forms have corners. Documented in the design system and held consistently |

## Verification

**Checks run and observed:**
- `node .../check.mjs <project>`: 0 FAIL, 0 WARN across 1 file, 8 oklch colours, 0 hex. It reported that it did not read the two `.tsx` files, so every component-level contrast number below was measured in the rendered page instead
- Rendered in Chromium at 1440 by 900: page load 189ms, 0 console errors, 0 page errors
- Contrast measured from computed styles on the live page: heading 15.73:1, intro prose 6.65:1, button text on ink 13.76:1, textarea text 15.73:1
- Placeholder composited from real pixels: `rgb(157 153 147)` on `rgb(253 252 251)` = **2.77:1**
- Keyboard: Tab order is textarea then button, both reach `:focus-visible`, ring is 2px at 3px offset
- Button ring sampled at 0ms, 60ms, 260ms and 760ms: starts at `oklab(0.975 …)` which is paper at 1.00:1, reaches the orange token at 260ms, holds
- Primary action: filled the field, clicked the button and pressed Enter. Counts stayed `0 0 0` and the DOM was unchanged
- Responsive: 320px gives `scrollWidth 320` against `clientWidth 320`, no overflow. 200% (720 CSS px at 2x) also no overflow
- Mobile field font-size: 16px, so iOS Safari will not auto-zoom
- Reduced motion: `animation-name: none`, `animation-duration: 0s`, opacity 1
- `aria-live`, `role="status"` and `role="alert"` regions: 0 of each, consistent with finding noted above
- Button hit area: 166 by 48px, over the 44px minimum

**Not verified:**
- Screen reader announcement behaviour, since there is nothing dynamic to announce yet
- Real device testing on iOS and Android. Widths were simulated, not run on hardware
- Text direction and RTL, which this product does not currently support

## Next modes

`/design interaction` for finding 1 and the button states. `/design a11y` for findings 2 and 3. `/design relayout` for finding 4. `/design style retro-futurism` is already applied and does not need repeating.
