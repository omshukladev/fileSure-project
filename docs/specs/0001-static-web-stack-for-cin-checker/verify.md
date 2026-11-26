# Verify: stack & architecture · spec 0001 · updated 26 November 2026

_Steps derived from spec 0001. `/check verify` runs these; `/test` locks the durable ones._

## Commands

- [ ] `npm ci` → exits clean, no errors → AC-5
- [ ] `npm run typecheck` → exits 0, no type errors → AC-3
- [ ] `npm run lint` → exits 0, no lint errors → AC-3
- [ ] `npm run build` → exits 0 and prints the `/` route as static (marked `○`) → AC-1
- [ ] `ls out/index.html` → the file exists and is non empty → AC-1
- [ ] `grep -c 'CIN and LLPIN checker' out/index.html` → returns at least 1, proving the copy is in the static HTML and not injected at runtime → AC-1
- [ ] `grep -o 'href="/_next/static/chunks/[^"]*\\.css"' out/index.html` → returns a stylesheet link, proving Tailwind CSS shipped → AC-1
- [ ] `npm ls --depth=0 2>/dev/null | grep -Ei 'prisma|mongoose|next-auth|firebase|supabase|posthog|segment|gtag'` → returns nothing → AC-5

## UI / manual

- [ ] Run `npm run dev`, open the local URL → the page loads with status 200 and shows the heading "CIN and LLPIN checker" → AC-4
- [ ] Inspect the served HTML for the page → the heading text is present in the first response, proving the shell renders at build or request time rather than only after hydration → AC-4
- [ ] Narrow the browser to 375 pixels wide → the heading and paragraph reflow to one column with no horizontal scrolling → AC-1
- [ ] Disable JavaScript in the browser and reload → the heading and paragraph still show, proving the shell is real HTML → AC-2
- [ ] Serve the built folder with a plain static server (`npx serve out`) → the page loads and looks the same as in dev, proving no server runtime is needed → AC-2
- [ ] View source and search for `create-next-app` or `next.svg` → returns nothing, proving the boilerplate demo page and its assets are gone → AC-4

## Acceptance-criteria coverage

- AC-1 covered by the build command, the `out/index.html` check, the copy grep, the stylesheet grep and the 375 pixel width check
- AC-2 covered by the JavaScript disabled check and the plain static server check
- AC-3 covered by the typecheck and lint commands
- AC-4 covered by the dev server render, the first response check, and the boilerplate removal check
- AC-5 covered by the `npm ci` check and the banned dependency scan
