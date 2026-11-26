<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# FileSure CIN checker

A single static page where a visitor pastes Indian company and LLP identifiers, one per line, and reads what each one means. No server, no database, no account.

## Stack

- **Language / Runtime**: TypeScript strict, Node 22 (`.nvmrc`)
- **Framework**: Next.js 16.4.6 App Router, React 19.3.1, `output: 'export'`
- **Key dependencies**: Tailwind CSS v4 (`@theme` in `app/globals.css`), `@tailwindcss/turbopack`, `next/font`
- **Package manager**: npm, lockfile committed

Planned and specified but not installed yet: shadcn/ui, `motion`, Vitest, Playwright. See `docs/specs/0001-static-web-stack-for-cin-checker/index.md`.

## Build approach

**Skateboard**: ship the thinnest usable whole, then grow the same page release by release. Foundations first, then one vertical slice at a time.

## Commands

```bash
npm ci                    # install
npm run dev               # dev server
npm run build             # static export to out/
npm run lint              # ESLint
npm run typecheck         # tsc --noEmit
```

## Specs

Stored in `docs/specs/`. Format: `docs/specs/NNNN-title/index.md` with `rationale.md` and `verify.md` alongside. Scope lives in `docs/scope/scope.md`. Do not add build tasks to the scope; it owns features, not tasks.

## Rules

- **No server, no database, no analytics.** Every answer is computed from the pasted text. Nothing pasted leaves the browser. Any dependency that would send input off the device contradicts the product claim.
- **Static export fence.** `output: 'export'` forbids Server Actions, cookies, headers, redirects, rewrites, middleware, ISR and the default image loader. Stay inside it or change the spec first.
- **Server Component by default.** `app/page.tsx` is a Server Component. Interactive state lives only under a `'use client'` boundary (`components/checker.tsx`). `lib/` imports no React.
- **One source of truth for domain rules.** Decode logic and the state and type tables live in `lib/`, never inline in a component.
- **Design tokens, never raw colour.** Every colour, radius and font comes from the `@theme` block in `app/globals.css`. The direction is a 1960s print bureau: cream paper, warm ink, one orange accent used three times, square corners, rules instead of shadows. No gradients, no glass, no pills, no shadows.
- **Reduced motion is part of the design.** Every animation and transition has a `prefers-reduced-motion: reduce` path. Motion never delays a result becoming readable, and no state is carried by motion or colour alone.
- **Report the failing block, never a blanket invalid.** A compliance audience needs to know which character to fix.
- **A valid format is not a real company.** Only MCA can confirm existence. Never let copy imply otherwise.

## Gotchas

- `NODE_ENV=production` is set in this machine's shell. `npm ci` under it installs 18 packages instead of 288 and silently skips every dev dependency, so `eslint: command not found` and `Cannot find module '@tailwindcss/turbopack'` are environment faults, not code faults. Prefix with `env -u NODE_ENV` or export the variable away.
- A stale `.next` directory produces the same Turbopack module error. `rm -rf .next` before concluding the build is broken.
- `npm run typecheck` needs a build first. `next-env.d.ts` imports `.next/types/routes.d.ts`, so a `tsc --noEmit` on a wiped `.next` fails with `Cannot find name 'LayoutProps'`. That is generated type order, not your code. Run `npm run build` (or `npm run dev` once) before typechecking a fresh clone.
- `npm start` (`next start`) does not serve a static export. Use `npx serve out` or deploy the folder.
- The compiler silently drops an `@media` nested inside `@layer utilities`. Declare at-rules at top level.
- `extra/` holds the assignment brief and is gitignored, since the repo may go public.

## Context files

- `docs/specs/0001-static-web-stack-for-cin-checker/` holds the stack spec, its rationale and its verify steps
- `docs/user/` holds the plain language briefing, the error log, the session log and the checklist
- `.commandcode/design/design-system.md` is the token and component contract; read it before changing colour, type, spacing or motion

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
