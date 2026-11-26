# Verify: stack & architecture · spec 0001 · updated 26 November 2026

_Steps derived from spec 0001. `/check verify` runs these; `/test` locks the durable ones._

**Run on 26 November 2026, all checked boxes observed.** One trap is worth knowing before you run these: this machine has `NODE_ENV=production` set in the shell, and `npm ci` in that environment installs 18 packages instead of 288, silently skipping every dev dependency. Prefix the commands with `env -u NODE_ENV` if a run fails with `eslint: command not found` or `Cannot find module '@tailwindcss/turbopack'`. A stale `.next` directory causes the same module error; `rm -rf .next` before building.

## Commands

- [x] `npm ci` → exits clean, no errors → AC-5
- [x] `npm run typecheck` → exits 0, no type errors → AC-3
- [x] `npm run lint` → exits 0, no lint errors → AC-3
- [x] `npm run build` → exits 0 and prints the `/` route as static (marked `○`) → AC-1
- [x] `ls out/index.html` → the file exists and is non empty → AC-1
- [x] `grep -c 'CIN and LLPIN checker' out/index.html` → returns at least 1, proving the copy is in the static HTML and not injected at runtime → AC-1
- [x] `grep -o 'href="/_next/static/chunks/[^"]*\.css"' out/index.html` → returns a stylesheet link, proving Tailwind CSS shipped → AC-1
- [x] `npm ls --depth=0 2>/dev/null | grep -Ei 'prisma|mongoose|next-auth|firebase|supabase|posthog|segment|gtag'` → returns nothing → AC-5

The copy check matches the `<title>` only. The visible heading is now "Read any company number in one paste", changed by the design pass, so assert on `Read any company` if you want the rendered text rather than the document title.

## UI / manual

- [x] Run `npm run dev`, open the local URL → the page loads with status 200 and shows the heading "CIN and LLPIN checker" → AC-4
- [x] Inspect the served HTML for the page → the heading text is present in the first response, proving the shell renders at build or request time rather than only after hydration → AC-4
- [x] Narrow the browser to 375 pixels wide → the heading and paragraph reflow to one column with no horizontal scrolling → AC-1
- [x] Disable JavaScript in the browser and reload → the heading and paragraph still show, proving the shell is real HTML → AC-2
- [x] Serve the built folder with a plain static server (`npx serve out`) → the page loads and looks the same as in dev, proving no server runtime is needed → AC-2
- [x] View source and search for `create-next-app` or `next.svg` → returns nothing, proving the boilerplate demo page and its assets are gone → AC-4

## Acceptance-criteria coverage

- AC-1 covered by the build command, the `out/index.html` check, the copy grep, the stylesheet grep and the 375 pixel width check
- AC-2 covered by the JavaScript disabled check and the plain static server check
- AC-3 covered by the typecheck and lint commands
- AC-4 covered by the dev server render, the first response check, and the boilerplate removal check
- AC-5 covered by the `npm ci` check and the banned dependency scan
