# 0001. Reasoning behind the static Next.js stack

The decision record for spec 0001. `/develop` skips this file. It is here for the humans who need to know why, and for `/architect` on a later update.

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

**Cons**: The engineer wanted Next.js, and Vite offers no story about a future backend route. It also gives up build time rendering, so the first paint is closer to an empty page unless the shell is hand written.

### Option 3: Astro with React islands

Astro renders the page to static HTML by default and hydrates only the interactive box.

**Pros**: The smallest JavaScript payload of the three, and it is genuinely designed for content pages that need a little interactivity.

**Cons**: The interactive surface here is the whole point of the page, so most of it ends up as a client island anyway. shadcn/ui on Astro is a less travelled path, and a reviewer who asked for Next.js sees an unexplained detour. Extra setup cost on a one day deadline.

### Option 4: One hand written HTML file with vanilla JavaScript

No framework, no build step, one file deployed as is.

**Pros**: Nothing to configure, nothing to break, instant to host, and trivially explainable in a video.

**Cons**: The reported criteria include layout, typography, spacing and a phone layout judged as if it were a production product. Hand rolling a component system with proper focus, keyboard and screen reader behaviour on a single day is slower than using one, and the result is very likely worse. No type safety in the decoder, no test tooling without adding a build anyway.

## Rationale

Option 1 is chosen because two of the engineer's stated wishes meet in it without a fight: Next.js was already wanted, and shadcn/ui supports it officially with Tailwind v4. Static export removes the server entirely, so the honest privacy claim survives while the framework stays.

Option 2 is the technically leaner choice and would ship the same page. It is rejected on two grounds: it abandons the engineer's stated stack, and it gives up build time rendering for a page a stranger must understand in seconds. Option 3 is the better answer if the product were mostly text with a small interactive part, which it is not. Option 4 is rejected because the design is graded against a production site, and hand built accessibility under time pressure is where that grade is usually lost.

One tension accepted deliberately: the engineer asked for bold, showy motion, while the audience is conservative and the brief judges clarity. Motion is therefore allowed to be expressive on arrival, hover and reveal, but it must never delay a result becoming readable and must never be the only carrier of meaning.

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

**Links** (web verified during the design run):
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

### Landscape scan notes

Confirmed by the read only landscape check during the design run:

- Next.js 16 is current. `output: 'export'` still works in the App Router, Server Components run at build, and the output lands in `out/`.
- The static export blockers that matter here: the default `next/image` loader (avoids by `unoptimized`), Server Actions, cookies, headers, redirects, rewrites, proxy, ISR, draft mode, and Route Handlers that read the request.
- Next 16 breaking changes: `middleware` renamed to `proxy`, `params` and `searchParams` are async, parallel routes need a `default.js`, React 18 is deprecated.
- shadcn/ui CLI is `shadcn@latest init` and `add`. Its docs target the App Router with Tailwind v4 and React 19. The Next.js install guide never mentions static export, which is why the spec calls that an inference.
- shadcn/ui expects Tailwind v4 CSS first config: `@import "tailwindcss"`, `@theme inline`, `tw-animate-css`.
- Tailwind v4 is configured in CSS through `@theme`, not a JS config file, which is opt in only.
- Motion is the current package; the React import is `motion/react`. `framer-motion` still publishes but the docs recommend moving off it.
- Vercel Hobby is free and static sites are explicitly fair use, but the terms limit Hobby to personal or non commercial use. Worth knowing if this ever becomes a real FileSure page.
- Vitest 5 requires Node 22.12 or newer, which `.nvmrc` satisfies.
- Playwright's `webServer` block boots a local server before tests. `next start` is not part of the static export flow, so it must point at a static server over `out/`.
