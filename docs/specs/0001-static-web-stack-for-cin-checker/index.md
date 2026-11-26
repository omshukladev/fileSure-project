# 0001. Build the CIN checker as a static single page on Next.js

**Date**: 2026-11-26
**Status**: In Progress

## Summary

The page is built as one static site with Next.js and TypeScript, styled with Tailwind CSS v4, using shadcn/ui components retuned to FileSure's own look, and animated with the motion package. It ships as plain HTML, CSS and JavaScript files with no server and no database, because every answer can be computed from the text the visitor pastes. The decode rules live in one pure TypeScript module covered by Vitest, and a Playwright test drives the real built page the way a reviewer would.

## Requirements

This is an architecture decision, so there are no product acceptance criteria here. The contract is the stack itself, and the feature that executes it (the scaffold) is verified against these:

- **AC-1**: the project builds with `npm run build` and emits a static `out/` folder containing real HTML.
- **AC-2**: no server runtime is required to serve the built site; a plain static file server is enough.
- **AC-3**: `npm run typecheck` and `npm run lint` both pass with no errors.
- **AC-4**: `app/page.tsx` renders as a Server Component, and no interactive state exists outside a `'use client'` boundary.
- **AC-5**: no database, no auth, and no analytics dependency is installed.

## Decision

**Chosen option**: Option 1: Next.js with static export, React 19, Tailwind v4, shadcn/ui, motion

Build one static Next.js app in TypeScript, emitted as plain files with `output: 'export'`, deployed on Vercel. Decode logic is a pure module with no React in it. shadcn/ui provides accessible primitives, retuned to FileSure's palette and type. Motion is added through the motion package, respecting reduced motion.

**Implementation skills**: `design` (built in Command Code skill, `~/.npm-global/lib/node_modules/command-code/dist/bundled/design/`) · `frontend-design` (`~/.agents/skills/frontend-design/`) · `web-design-guidelines` (`~/.agents/skills/web-design-guidelines/`) · `tailwind-4-docs` (`~/.agents/skills/tailwind-4-docs/`) · `ui-ux-pro-max` (`~/.agents/skills/ui-ux-pro-max/`)

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Language | TypeScript, strict mode | The decode logic has many fields and error reasons; types catch a mistyped field before the page is opened |
| Framework | Next.js 16.4.6, App Router, `output: 'export'`, React 19.3.1 | Wanted by the engineer, and emits plain files so no server runs |
| UI components | shadcn/ui, copied into the repo | Accessible primitives with real focus and keyboard behaviour, owned in the repo rather than imported blind |
| Styling | Tailwind CSS v4, CSS first `@theme` tokens, OKLCH colours | One visible place for spacing, type and colour; v4 is what current shadcn/ui expects |
| Animation | `motion`, imported from `motion/react` | Purpose built React animation for enter, exit and layout change, with a reduced motion path |
| State and data | React state plus `useMemo`, no state library | One page, one input, one derived result list; a store would be machinery with no job |
| Domain logic | One pure TypeScript module, no React imports | Makes the decoder testable in plain Node, and keeps logic out of the view |
| Unit testing | Vitest, Node environment | The decoder is pure functions, so no DOM is needed and the suite stays fast |
| Browser testing | Playwright against the built static output | Tests what actually ships, not the dev server |
| Build and checks | npm, ESLint, `tsc --noEmit`, GitHub Actions on push | A green tick in the repo is visible proof to a reviewer, and it catches breakage before deploy |
| Hosting | Vercel free tier | Built by the Next.js team, so static export needs no fighting to deploy |
| Analytics and tracking | None | Any analytics would contradict the promise that nothing pasted leaves the browser |
| Primary DB | None | Every answer is derived from the input; there is nothing to store |
| Auth | None | The page is public and holds no personal data |

## Build shape

The parts a builder would otherwise have to invent, pinned now so two builders produce the same project.

**Scaffold.** `npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"`, then `npx shadcn@latest init`. Node 22 (`.nvmrc` contains `22`), npm, lockfile committed.

**Directory layout.**
```
app/layout.tsx        metadata export, fonts, <html> shell
app/page.tsx          Server Component, static shell and copy
app/globals.css       @import "tailwindcss"; @theme tokens
components/checker.tsx        'use client' boundary, the only stateful island
components/result-card.tsx    one decoded result, card form
components/result-table.tsx   the long list form
components/ui/*               shadcn primitives
lib/decode.ts         decodeLine, decodeList, pure, no React
lib/types.ts          result and error types
lib/reference/*.ts    state and type tables, owned by spec 0003
lib/decode.test.ts    Vitest
e2e/checker.spec.ts   Playwright
next.config.ts        output export, images unoptimized
```

**Routes.** Exactly one route, `/`. No query string state in v1. Share state, when feature 9 lands, lives only in the URL hash fragment, never the query string, so it is never sent to the host in a request line and never lands in server logs.

**Persistence.** v1 stores nothing, anywhere. No `localStorage`, no cookies, no database. Browser history is a deferred feature with its own spec.

**The client boundary.** `app/page.tsx` is a Server Component. Everything interactive lives under `components/checker.tsx`, marked `'use client'`. The decoder in `lib/` imports no React and is never imported by a Server Component, so it stays plain TypeScript.

**Interpretation of the no server rule.** If the MCA lookup is ever added, the change is to drop `output: 'export'` and deploy a server. It is not a route handler inside the current setup.

**Images.** `images: { unoptimized: true }` in `next.config.ts`. There is no custom loader, because the page ships no raster images.

**Theme.** Light theme only, one `@theme` token block in `globals.css`, no dark mode toggle in v1. Contrast is checked against the light surface.

**Fonts.** One display face and one text face, self hosted through `next/font`, declared in `app/layout.tsx`. No runtime request to a font CDN.

**Metadata.** A `metadata` export with title, description and Open Graph fields, plus a favicon. Social card copy is written in the design feature, not here.

**Accessibility mechanism.** A single `aria-live="polite"` region announces the result count after each paste. Valid, invalid and LLP states each carry a text label and a shape as well as a colour, never colour alone.

**Long lists.** Above the card threshold the page renders the plain table from `components/result-table.tsx`. No list virtualisation package may be added outside feature 7. The threshold value is owned by the design feature.

**Test locations.** `lib/decode.test.ts` for Vitest, `e2e/checker.spec.ts` for Playwright. npm scripts: `dev`, `build`, `test` (Vitest), `e2e` (Playwright), `lint`, `format:check`, `typecheck`.

**Playwright serving.** `next start` does not serve a static export. `playwright.config.ts` sets `webServer: { command: 'npx serve out -p 4321', port: 4321 }` so the browser test drives the real built folder.

**Continuous integration.** `.github/workflows/ci.yml` on push and pull request, Node 22, in order: `npm ci`, `lint`, `format:check`, `typecheck`, `test`, `build`. Playwright is not in the blocking workflow in v1; it runs locally and can be added once it is stable.

## Motion budget

The engineer asked for bold motion. It is capped here so the showy request never fights readability, and the page stays honest for a conservative audience.

| Element | Trigger | Motion | Duration | Notes |
|---|---|---|---|---|
| Result rows | Results appear | Staggered rise, 12px travel, opacity 0 to 1 | 240ms each, 40ms stagger | Stagger caps at 10 rows, later rows appear together |
| Result cards | Hover | Lift 2px, shadow deepens, border brightens | 160ms | Transform and shadow only, no layout shift |
| Summary counts | Counts change | Number tweens to its new value | 300ms | Never blocks reading the final number |
| Card to table switch | Crossing the threshold | Layout crossfade | 200ms | `LayoutGroup`, no height animation on the container |
| Empty state example | Click | Fills the box, then results animate in | Instant fill | A click must always produce a visible result |
| Invalid rows | Paste | No motion | None | An error must be readable the moment it appears |

Rules that hold across the table: animate `transform` and `opacity` only, never `width` or `height`. `useReducedMotion()` returns true, every entry collapses to a 100ms opacity fade with no travel and no stagger. Animation never delays a result becoming readable, and no state is communicated by motion alone.

## Consequences

**Positive**:
- Nothing runs on a server, so the privacy claim is literally true and the page cannot go down because a backend is unhealthy.
- The decoder is testable without a browser, which makes the tricky input cases cheap to prove.
- shadcn/ui gives real accessibility and keyboard behaviour for free, which protects the accessibility target.
- The build output is a folder of files, so the live link works on any static host and cannot be broken by a platform change.

**Negative / tradeoffs**:
- Next.js is heavier than one page needs. Static export forbids Server Actions, cookies, headers, redirects, rewrites, middleware, ISR and the default image loader, so every later feature must stay inside that fence or the export has to go.
- Four new tools (Next.js 16, Tailwind v4, shadcn/ui, motion) plus two test runners is a lot of new surface on a one day deadline. The foundations order absorbs it, but it is the main schedule risk.
- Tailwind v4 changed how config works compared with the older file based config, so any pattern the AI recalls from memory is a likely source of wrong code and needs checking against current docs.
- Playwright is a target, not a gate. Vitest blocks the build because the decoder is the graded logic; Playwright proves the page works in a real browser and is the first thing cut if the deadline tightens. Its minimum four assertions: a valid CIN decodes, an invalid one names the broken block, an LLPIN is recognised without a state, and 500 lines render without the page freezing.
- Bold motion sits in tension with a conservative audience and a mobile screen, which is why the budget table above caps it rather than leaving it to taste.

**Neutral**:
- Build time rendering means the page shell is real HTML, but the paste box still hydrates on the client, so the interactive part loads second.
- Vercel ties the deploy to one vendor. The output stays portable, so moving host is a re upload, not a rewrite.
- No analytics means the team learns nothing about real usage. That was the price of the privacy promise.

## Follow-up

- [ ] The design direction is settled by running the built in `/design variants` comparison before building the page, so the FileSure retune is a choice made against real options rather than an assumption. Retuning shadcn's default look to FileSure's is real design work, not a colour swap, and skipping it leaves a generic looking page.
- [ ] `lib/reference/` is created by spec 0003, not here. Do not fill the tables in this feature; this spec only decides where they live.
- [ ] Record one real instance of the AI getting something wrong during the build in `docs/user/major-error.md`, for the video requirement.
- [ ] `AGENTS.md` currently only holds the Next.js generated note. `/audit` seeds the real conventions from the scaffold, and the stack, styling and motion rules belong in its `## Rules`.

## Rationale

Reasoning, the options weighed and the sources: see [rationale.md](rationale.md).
