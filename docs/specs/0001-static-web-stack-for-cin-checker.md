# 0001. Build the CIN checker as a static single page on Next.js

**Date**: 2026-11-26
**Status**: Accepted

## Summary

The page is built as one static site with Next.js and TypeScript, styled with Tailwind CSS v4, using shadcn/ui components retuned to FileSure's own look, and animated with the motion package. It ships as plain HTML, CSS and JavaScript files with no server and no database, because every answer can be computed from the text the visitor pastes. The decode rules live in one pure TypeScript module covered by Vitest, and a Playwright test drives the real built page the way a reviewer would.

## Context

The product is one public page. A chartered accountant, a lawyer or a business owner pastes a list of company and LLP identifiers, and the page explains what each one means. There is no login, no saved state and no personal data. Every answer is a pure function of the pasted text.

That fact drives the whole decision. Because the answer never needs the network, a server would add a round trip, a runtime that can fail, and an awkward question from a cautious professional: does my client's identifier leave my machine? A static page answers in under a millisecond, works on any free host, and lets us promise that nothing pasted is ever sent anywhere.

The audience is non technical and time pressured, working from client files, often on a phone. The assignment judges design as heavily as code, names an empty state, a wrong input and a 500 line paste as specific states it will inspect, and says the page should look as if it went live on filesure.in tomorrow. So the build needs a real component base and a real visual system, not hand rolled widgets.

The deadline is one day, and the same person must later record a ten minute video walking through the code, then make a live change to the page while an interviewer watches. Readability of the code and the ability to explain it simply are therefore part of the technical requirement, not a nice extra.

## Options considered

### Option 1: Next.js with static export, React 19, Tailwind v4, shadcn/ui, motion

One Next.js app using the App Router, built with `output: 'export'` so it emits a folder of plain files. React components for the interactive parts. Tailwind v4 for the visual system, shadcn/ui for accessible primitives copied into the repo, motion for animation.

**Pros**: shadcn/ui supports Next.js officially and is the most common pairing a reviewer will recognise. Static export means no server, so the deployment is plain files on any host. Server Components still render at build time, so the page arrives as real HTML rather than a blank shell. TypeScript catches a whole class of mistakes in the decode logic.

**Cons**: Next.js is more machinery than one page strictly needs. Export mode has real limits: Server Actions, cookies, headers, redirects, rewrites, middleware and ISR are all unavailable, and the default image loader does not work. shadcn/ui's own install guide never mentions static export, so that pairing is inferable rather than documented, though its components are ordinary client components and work fine.

### Option 2: React with Vite, Tailwind v4, shadcn/ui, motion

The same React components and the same visual system, with Vite as the build tool and no routing framework.

**Pros**: Much lighter, faster cold start, fewer moving parts, and shadcn/ui supports Vite officially. The output is also plain files.

**Cons**: The engine wanted Next.js, and Vite offers no story about a future backend route. It also gives up build time rendering, so the first paint is closer to an empty page unless the shell is hand written.

### Option 3: Astro with React islands

Astro renders the page to static HTML by default and hydrates only the interactive box.

**Pros**: The smallest JavaScript payload of the three, and it is genuinely designed for content pages that need a little interactivity.

**Cons**: The interactive surface here is the whole point of the page, so most of it ends up as a client island anyway. shadcn/ui on Astro is a less travelled path, and a reviewer who asked for Next.js sees an unexplained detour. Extra setup cost on a one day deadline.

### Option 4: One hand written HTML file with vanilla JavaScript

No framework, no build step, one file deployed as is.

**Pros**: Nothing to configure, nothing to break, instant to host, and trivially explainable in a video.

**Cons**: The reported criteria include layout, typography, spacing and a phone layout judged as if it were a production product. Hand rolling a component system with proper focus, keyboard and screen reader behaviour on a single day is slower than using one, and the result is very likely worse. No type safety in the decoder, no test tooling without adding a build anyway.

## Decision

**Chosen option**: Option 1: Next.js with static export, React 19, Tailwind v4, shadcn/ui, motion

Build one static Next.js app in TypeScript, emitted as plain files with `output: 'export'`, deployed on Vercel. Decode logic is a pure module with no React in it. shadcn/ui provides accessible primitives, retuned to FileSure's palette and type. Motion is added through the motion package, respecting reduced motion.

**Implementation skills**: `design` (built in Command Code skill, `~/.npm-global/lib/node_modules/command-code/dist/bundled/design/`) · `frontend-design` (`~/.agents/skills/frontend-design/`) · `web-design-guidelines` (`~/.agents/skills/web-design-guidelines/`) · `tailwind-4-docs` (`~/.agents/skills/tailwind-4-docs/`) · `ui-ux-pro-max` (`~/.agents/skills/ui-ux-pro-max/`)

## Rationale

Option 1 is chosen because two of the engineer's stated wishes meet in it without a fight: Next.js was already wanted, and shadcn/ui supports it officially with Tailwind v4. Static export removes the server entirely, so the honest privacy claim survives while the framework stays.

Option 2 is the technically leaner choice and would ship the same page. It is rejected on two grounds: it abandons the engine's stated stack, and it gives up build time rendering for a page a stranger must understand in seconds. Option 3 is the better answer if the product were mostly text with a small interactive part, which it is not. Option 4 is rejected because the design is graded against a production site, and hand built accessibility under time pressure is where that grade is usually lost.

One tension accepted deliberately: the engineer asked for bold, showy motion, while the audience is conservative and the brief judges clarity. Motion is therefore allowed to be expressive on arrival, hover and reveal, but it must never delay a result becoming readable and must never be the only carrier of meaning.

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
| Build and checks | npm, ESLint, Prettier, `tsc --noEmit`, GitHub Actions on push | A green tick in the repo is visible proof to a reviewer, and it catches breakage before deploy |
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
- [ ] `lib/reference/` is created empty by the scaffold and owned by spec 0003. Do not fill the tables here; this spec only decides where they live.
- [ ] Record one real instance of the AI getting something wrong during the build in `docs/user/major-error.md`, for the video requirement.
- [ ] `AGENTS.md` does not exist yet. `/audit` seeds it from the real scaffold, and the stack, styling and motion conventions belong in its `## Rules` because they reach every file.

## References

**Project sources** (verifiable, in this repo):
- `docs/scope/scope.md`, feature 1 Stack and architecture, and the project header recording the Skateboard approach and the Alpha workflow tier.
- `extra/filesure_tech_assignment.txt`, the brief: the six decoded fields, the three judged states, the four submission items, and the score on design, layout, typography, spacing, colour and phone use.
- `docs/user/briefing.md`, the recorded reasoning behind the no server and no database call.

**Practices & standards**:
- Static first for pure functions: when every output is determined by an input already in the browser, a backend adds operational risk with no capability, and the strongest privacy claim is the one with no upload path at all.
- Separate the domain core from the view, so business rules are testable without a browser and the view can change shape without touching logic.
- Foundations before features, and the smallest usable whole first, which is the recorded Skateboard approach this spec serves.
- Progressive enhancement of motion: animate transform and opacity only, and honour the reduced motion preference.
- WCAG 2.2 AA as the accessibility floor, including a live region so results are announced rather than silently appearing.

**Links** (web verified during this run):
- Next.js, How to create a static export: https://nextjs.org/docs/app/guides/static-exports
- Next.js 16 upgrade guide (the breaking changes): https://nextjs.org/docs/app/guides/upgrading/version-16
- shadcn/ui, Next.js installation: https://ui.shadcn.com/docs/installation/next
- shadcn/ui, Tailwind v4 setup and CSS first config: https://ui.shadcn.com/docs/tailwind-v4
- Tailwind CSS, theme configuration through `@theme`: https://tailwindcss.com/docs/theme
- Tailwind CSS, Next.js installation: https://tailwindcss.com/docs/installation/framework-guides/nextjs
- Motion for React: https://motion.dev/docs/react
- Playwright, the `webServer` option: https://playwright.dev/docs/test-webserver
- Vercel terms (the Hobby fair use limit): https://vercel.com/legal/terms

Package versions confirmed against the npm registry on 2026-11-26: next 16.4.6, react 19.3.1, tailwindcss 4.3.5, motion 14.14.0, vitest 5.1.2, @playwright/test 1.65.1.
