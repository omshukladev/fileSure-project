# Session log

A running record of every working session on this assignment. Newest entry at the top, so you can read the latest state first. Add a new entry each time you sit down; do not rewrite old ones.

Each entry keeps the same shape:

- **Goal**: what this session set out to do
- **Did**: what actually happened, in order
- **Decisions**: what was chosen and the reason
- **Errors and corrections**: what went wrong, linked to `major-error.md`
- **Left over**: what the next session should pick up

---

## Session 5: Decided the decode rules

**Date:** 26 November 2026
**Branch:** `main`, ahead of `origin/main` by this commit

### Goal

Settle the domain rules before writing any decoder: the CIN block layout, the state and company type tables, the LLPIN rule, and the exact shape of a decoded result.

### Did

1. Ran `/architect decode rules & reference data`, which asked fourteen design questions in four rounds and settled every one.
2. Fetched the state code guide rather than recalling the table, and the TaxGuru note on the 2014 Telangana reissue to confirm the `AP` to `TG` change.
3. Wrote spec `0002` as a directory spec with `index.md` (the build contract, ten acceptance criteria, seven build steps) and `rationale.md` (the checked tables, the options weighed, the sources).
4. Ran a cross check on a different model before presenting the spec. It found nine gaps, including a missing state code and a type that contradicted its own test.
5. Closed all nine, recounted both tables, and logged the two real mistakes in `major-error.md` as E5 and E6.

### Decisions

| Decision | Reason |
|---|---|
| Clean paste habits silently, report only real breaks | Quiet on lower case and stray spaces, loud on a wrong state code. Announcing every tidy up would shout at a 500 line paste |
| Year range 1850 to the current year | Broad enough for the oldest registries, strict enough to reject 2099 and 0000. Three distinct faults, not one range message |
| Name the industry block, ship no code table | The classification has thousands of entries across revisions. A partial table is visibly wrong in places, which is worse than honest |
| Collect every fault, show the first | Lets the page show the parts that passed, and gives the later filter something to work with |
| A discriminated union keyed on kind | An LLPIN branch has no state or year field, so the most likely wrong answer becomes a compile error rather than a review catch |
| State and type tables fetched, not recalled | A remembered table puts `OD` in for Odisha, because the natural abbreviation is the wrong one |
| `AP` stays valid with a note | Andhra Pradesh still uses `AP` today. Only Telangana was reissued |
| `DD` and `DN` stay valid with a note | Merged in 2020, but MCA issued no replacement code and old CINs carry them |
| `CT`, `UA`, `TS` are not asserted | No source confirmed them and the search failed. They fail with an explanation rather than passing on a guess |
| Positions index the cleaned string | Cleaning removes characters, so raw positions would point at the wrong place. The result carries both `input` and `cleaned` |
| The hyphen is punctuation, never inserted | You cannot add an LLPIN hyphen before you know the line is an LLPIN. Removing it from `cleaned` keeps every index honest |

### Errors and corrections

- **The state table was missing Maharashtra.** I wrote 35 rows and then asserted it "contains no gaps". My own first happy path test was `L17110MH1973PLC019786`, which that table could not pass. The cross check counted the rows and found it; I confirmed with `wc -l` and `grep -c '^MH$'`. Logged as E5.
- **The result type contradicted the spec's own test.** The invalid branch had nowhere to put decoded blocks, while the test demanded a bad state still show the year and type. Also found: `FaultCode` never enumerated, positions ambiguous, no LLPIN shape check, and a hyphen insertion rule that could not run before kind detection. Logged as E6.
- **Asked for a model that does not exist, again.** I passed `glm-5.3-flash` and the tool said "did you mean `z-ai/glm-5.3-flash`". Same shape as E1: a plausible name that was never checked. The fix was to read the error and use the real name.
- Web search returned 502 twice while trying to confirm the legacy codes, so the legacy claim was dropped rather than guessed.

### Left over

- The decoder itself is not written. Feature 3 is designed, not built.
- Feature 2 still needs Prettier, Playwright and the CI workflow. Vitest arrives with the decoder.
- The card to table switch point is still undecided, and feature 4 owns it.

### Git

- Commit below: decode rules spec, scope link, and the two logged errors.

---

## Session 4: Design passes, motion, audit and verification

**Date:** 26 November 2026
**Branch:** `main`, ahead of `origin/main` by this commit

### Goal

Give the page a real visual direction instead of the scaffold default, fix the problems the checkup found, then audit the docs and prove the whole stack still verifies.

### Did

1. Ran `/design style retro-futurism`, which settled on a late 1960s government data processing bureau: cream printout stock, two colour press, monospaced identifiers, square corners, rules instead of shadows.
2. Ran `/design checkup`, which scored the page 30 of 60 and blocked it on two HIGH findings: an inert button and a placeholder at 2.77:1 contrast.
3. Ran `/design a11y`, which fixed the placeholder contrast to 6.94:1, narrowed the focus transition so the ring paints at full contrast immediately, and made the unavailable button use `aria-disabled` so it stays reachable.
4. Ran `/design interaction`, which gave the button and the paste field real resting, hover, pressed, focus and unavailable states from one rule set.
5. Ran `/design motion`, which added three behaviours: the six specimen underlines draw left to right in the order the diagram teaches, the entrance gained a blur that clears so the ink settles onto the paper, and the readout figures drop in and replay on value change.
6. Ran `/audit`, which found the root `AGENTS.md` held only the 9 line Next.js note and filled it with the real stack, build approach, commands, eight rules, five gotchas and context pointers.
7. Fixed three documentation drifts: a phantom `--radius-md` token, two unused `--phosphor` tokens, and a motion table that still said 70ms where the code says 80ms.
8. Ran every step in `verify.md` for real and ticked them, closing feature 1.
9. Wrote `docs/user/checklist.md` so the remaining phases are trackable in plain language.

### Decisions

| Decision | Reason |
|---|---|
| The specimen underlines draw, the characters never fade | The diagram exists to teach block order, so the motion is that fact. Keeping characters solid means no readable value is ever withheld |
| Only the poster, prose and specimen animate | The form must be usable the instant it paints. A tool should not perform before it works |
| Motion is opt in, static is the default | The page works with animation off, so reduced motion is not a patch bolted on afterwards |
| `aria-disabled` instead of `disabled` | A disabled attribute removes the button from the tab order, taking its explanation with it |
| Accent orange used exactly three times | It reads as emphasis because it is rare. More would make it decoration |
| No shadcn/ui installed yet | The page has three controls and no overlay. Adding a component library it does not use would be weight for a talking point |
| Deleted the phosphor tokens rather than wiring them | They described a dark instrument palette the page never had. Dead tokens are worse than no tokens |
| Kept the API story static | A backend would add a round trip, a failure mode, and a fair question about whether pasted CINs leave the machine |

### Errors and corrections

- **`NODE_ENV=production` bit again during the audit.** `npm ci` installed 18 packages instead of 288, so lint failed with `eslint: command not found` and the build with `Cannot find module '@tailwindcss/turbopack'`. Fixed with `env -u NODE_ENV npm ci --include=dev`, which restored all 288. Nothing errored on its own; the package count was the only signal. Logged in `major-error.md`.
- **A stale `.next` faked a module error.** The build failed on `@tailwindcss/turbopack` even though the package was installed. `rm -rf .next` fixed it. Same class of bug as the earlier stale dev server that made focus lose to hover.
- **Typecheck fails on a wiped `.next`.** `next-env.d.ts` imports `.next/types/routes.d.ts`, so `tsc --noEmit` complains `Cannot find name 'LayoutProps'`. That is generated type order, not broken code. Build first, then typecheck. Now recorded in `AGENTS.md`.
- **The focus ring looked paper on paper again for 150ms.** Already fixed in the a11y pass by narrowing the transition, and confirmed still holding in this pass by sampling computed styles.
- The old verify step asserted the heading `CIN and LLPIN checker`, which the design pass replaced with `Read any company number in one paste`. The check still passes but only matches the document title, so `verify.md` now says so and suggests `Read any company` for rendered text.

### Left over

- The decoder is the next real work, phase 5. Nothing decodes yet, and the button honestly says so.
- Prettier, Vitest and Playwright are named in the spec but not installed.
- Feature 4 still needs the card to table switch point decided and written down.
- The repo is still private, and the brief asks for a public link.

### Git

- Commit below: design passes, motion system, audit and verify.

---

## Session 3: Scaffolded the app

**Date:** 26 November 2026
**Branch:** `main`, in sync with `origin/main`

### Goal

Create the real project from spec `0001`: Next.js 16 with static export, TypeScript, Tailwind v4, and prove it builds and runs.

### Did

1. Checked the tree was clean and in sync with the remote before touching anything.
2. Checked the scaffold flags first with `--help` rather than guessing, since Next 16 renamed and added several.
3. `create-next-app` refused to scaffold in place because `extra/` was in the way. Scaffolded into a temp folder and copied the generated files in, keeping the existing git repo and docs.
4. Configured `next.config.ts` for `output: "export"` and `images: { unoptimized: true }`. Removed the generated `cacheComponents` and `partialPrefetching` flags, which assume a server.
5. Replaced the boilerplate home page with the checker shell, and set real page metadata.
6. Removed the Next.js demo assets and rewrote the README around this project instead of the generated one.
7. Proved it works: build passes, both routes prerender static, typecheck clean, lint clean, dev server returns 200 and renders with Tailwind classes live.
8. Promoted spec `0001` to a directory spec, splitting the reasoning into `rationale.md` and adding `verify.md`.

### Decisions

| Decision | Reason |
|---|---|
| Scaffold in a temp dir, then copy in | The initializer refuses a folder containing `extra/`, and moving the docs would break the repo |
| Removed `cacheComponents` and `partialPrefetching` | Both assume a server; static export is the whole point |
| `images: unoptimized` | Spec decision; the default loader does not work under static export and the page ships no photos |
| One client island, page stays a Server Component | Keeps the shell as real HTML, which is what a stranger sees first |
| Kept Geist via `next/font` | Self hosted, no runtime CDN request, and it is the current Next.js default |

### Errors and corrections

- **`NODE_ENV=production` in this shell made npm skip every dev dependency.** The first install added only 22 packages, so Tailwind, TypeScript and ESLint were missing. Caught it by listing `node_modules` and checking `echo $NODE_ENV`. Fixed with `NODE_ENV=development npm install --include=dev`. This is a real catch and a good candidate for the video, since a less careful run would have reported success and then failed at build time.
- The scaffold's `.gitignore` overwrote mine, which briefly un ignored `extra/`. Restored it and added the Playwright output folders in the same pass.
- Typo caught while writing the error log: "Telegana" in `major-error.md`, fixed to "Telangana".

### Left over

- Feature 1 is `in-progress`, not `done`. The scaffold landed but `Verify it` is unticked.
- `AGENTS.md` holds only the Next.js generated warning note about breaking changes. `/audit` should seed the real conventions next.
- The checker itself, the decode rules and the design system are all still to come.

### Git

- Commit `c53dd3f`: Scaffold the static Next.js app from spec 0001.
- Commit `0957dc2`: Split spec 0001 into a directory spec with verify steps.
- Both pushed, tree clean.

---

## Session 2: Chose the stack

**Date:** 26 November 2026
**Branch:** `main`, in sync with `origin/main`

### Goal

Decide the stack and the architecture for the page, and write it down so the build follows it.

### Did

1. Ran pre-flight: in sync with the remote, zero source files, no `AGENTS.md`, no `docs/specs/` yet, so this became spec `0001`.
2. Walked the stack layer by layer with the engineer: framework, language, styling, components, animation, hosting, structure, rendering, SEO, accessibility, reference data, package manager, CI, and how far to push motion.
3. Confirmed every version against the real npm registry instead of trusting memory: next 16.4.6, react 19.3.1, tailwindcss 4.3.5, motion 14.14.0, vitest 5.1.2, @playwright/test 1.65.1.
4. Fetched the official docs for static export, the shadcn Next.js installer, the shadcn Tailwind v4 notes, Tailwind theme config, and the Playwright `webServer` option, and read them rather than skimming search results.
5. Ran a landscape check that corrected one of my own claims: shadcn/ui's install guide never actually mentions static export, so that pairing is inference rather than documented support. The spec now says so instead of overclaiming.
6. Wrote spec `0001`, then ran a read only cross check from a second model, which found 6 real blockers.
7. Applied every blocker fix, then the engineer confirmed the spec.

### Decisions

| Decision | Reason |
|---|---|
| Next.js 16 with `output: 'export'` | Wanted by the engineer, emits plain files, so no server runs and the privacy claim stays true |
| TypeScript, strict | The decode logic has many fields and error reasons; types catch typos at build time |
| Tailwind CSS v4 with `@theme` tokens | What current shadcn/ui expects, and one visible place for spacing, type and colour |
| shadcn/ui retuned to FileSure | Accessible primitives without hand building focus and keyboard behaviour, skinned so it belongs on filesure.in |
| motion, imported from `motion/react` | Purpose built React animation with a real reduced motion path |
| Pure domain module, no React in it | Makes the decoder testable in plain Node, which is the graded logic |
| Vitest blocking, Playwright not blocking | Vitest proves the rules; Playwright proves the page and is the first cut if time runs out |
| Vercel free tier | Made by the Next.js team, so static export deploys without fighting the platform |
| No database, no auth, no analytics | Every answer is derived from the input, so storing anything would break the promise and add nothing |

### Errors and corrections

- I claimed shadcn/ui officially supports Next.js static export. The landscape check found the install guide is silent on it. Corrected in the spec's Options and Cons rather than left as a confident wrong claim. This is a good one for the video.
- The cross check found 6 blockers in my first draft: no decoder module path or function names, no directory layout or scaffold command, the motion scope punted to a follow-up, no route or client boundary, no test file locations or script names, and no CI contents. All six are now pinned in a new `## Build shape` section.
- The cross check also caught a contradiction: the spec promised nothing pasted leaves the browser while a later feature puts pasted codes in a share URL. Fixed by requiring share state to live in the URL hash fragment, never the query string, so it never reaches host logs.
- A background skills discovery agent ran far too long without returning anything. Killed it and used the skills I could already see were relevant.

### Left over

- Spec `0001` is `Accepted` and in force. Feature 1 in the scope is `in-progress` with the spec linked.
- Nothing is scaffolded yet. Next box is `Scaffold from the decision: /develop stack & architecture`.
- `AGENTS.md` still does not exist; `/audit` seeds it from the real scaffold.
- The briefing in `docs/user/` needs a line about the stack decision so it stays current. Worth doing when the scaffold lands.

---

## Session 1: Read the brief and wrote the plan

**Date:** 26 November 2026
**Branch:** `main`, in sync with `origin/main` on github.com/omshukladev/fileSure-project (private)

### Goal

Read the FileSure internship assignment, work out what the product actually is, research the CIN and LLPIN formats, and produce an ordered plan. Deadline is the same day.

### Did

1. Read `extra/filesure_tech_assignment.txt` and `extra/FileSure-Tech-Assignment.pdf`. Both say the same thing, and the PDF added no new requirements.
2. Confirmed the project was empty: no source files, no `package.json`, no git repository. So this is a greenfield build, not an existing codebase.
3. Researched the CIN format from several independent sources, and fetched the ones that mattered rather than trusting search snippets:
   - `learn.cspratik.com` gave the full six block breakdown, the state code table, and the company type table.
   - Wikipedia confirmed it is 21 characters in six sections, issued by the Registrar of Companies under the Ministry of Corporate Affairs.
   - MCA's own Find CIN page and Master Data Services page were both fetched and confirmed live.
   - A 2014 TaxGuru article, quoting an MCA circular, confirmed Telangana codes changed from `AP` to `TG`.
4. Fetched filesure.in to see their own product and visual language, and noticed they show the Reliance CIN `L17110MH1973PLC019786` as their example. That became our reference example.
5. Worked out that this page needs no server and no database, because the answer is entirely determined by the pasted text.
6. Wrote the plan to `docs/scope/scope.md`, with 11 features, 4 deferred, the Skateboard build approach and the Alpha workflow tier with the decoder raised to Beta.
7. Wrote the two plain language documents in `docs/user/`: `briefing.md` for interview preparation, and `major-error.md` for the video requirement.

### Decisions

| Decision | Reason |
|---|---|
| Browser only, no server, no database | The answer depends only on the input. A backend adds a round trip, a failure mode and a privacy question, and buys nothing |
| Keep Next.js in mind as the stack | The user wanted it; it can build to static files and deploy on Vercel, so no server is needed |
| Build approach Skateboard | One day deadline, one page. Ship the smallest genuinely usable whole, then grow it |
| Workflow Alpha, decoder Beta | Most features get a real check that they work. Only the decoder gets a test suite, because that is where the reviewer's tricky inputs land |
| Cards for short pastes, table for long ones | Readable for a first timer, survivable at 500 lines |
| Counts plus a show broken only filter | Makes a large paste actionable instead of a wall of red |
| Include CSV download | A chartered accountant works in a spreadsheet, so this turns a toy into a tool |
| Match FileSure's own visual language | The brief says design it as if it goes live on filesure.in tomorrow |

### Errors and corrections

- A background helper was launched with a model name that does not exist (`haiku`). The tool rejected it rather than guessing. Fixed by dropping the model line, then verifying the reference links by hand. Logged as E1 in `major-error.md`.
- Reading a skill file outside the project was refused by the workspace boundary. Worked inside the project instead. Logged as E2.
- The Wikipedia fetch timed out on the first attempt and worked on retry. Logged as E3, because one failure is not proof a source is gone.

### Left over

- Nothing is scaffolded yet. No `package.json`, no app code.
- The repository is live at github.com/omshukladev/fileSure-project, currently private. Both commits are pushed and the branch is in sync.
- Remember to flip it to public before you send the assignment in. The brief asks for a public repo link.
- `extra/` is ignored on purpose. It holds the company's own assignment files, and the submitted repo will be public.
- Next step is the first unticked box in `docs/scope/scope.md`: `/architect stack & architecture`.

### Git

- `git init` run, `.gitignore` added covering dependencies, build output, environment files, editor noise, and `extra/`.
- Commit `b1ecbcb`: Add scope plan and plain language docs for the CIN checker.
- Commit `dc46058`: Record git setup in the session log.
- Both are on `origin/main`, working tree clean, nothing ahead or behind.
- Commit trailer `Co-authored-by: CommandCodeBot <noreply@commandcode.ai>` is applied, so the transcript and the history agree about how the work was made.

---

## How to add the next entry

Copy this shape, put it at the top under the heading, and fill it in while the session is fresh:

```markdown
## Session N: <what this session was about>

**Date:** <date>
**Branch:** <branch name, and how far ahead of the remote>

### Goal
### Did
### Decisions
### Errors and corrections
### Left over
```

Then commit. See the note at the bottom of this file for how commits are handled.

---

## Commit convention used on this project

Every commit made by the AI assistant ends with the co-author trailer below, so it is always clear which changes were AI assisted. This matters here because the brief explicitly judges how the AI was used.

```
Co-authored-by: CommandCodeBot <noreply@commandcode.ai>
```

Subjects are short and in the imperative, for example:

- `Add scope plan for the CIN checker`
- `Add plain language briefing and error log`
- `Scaffold the checker page`

No session log entry is written for a commit that only fixes a typo. Log work, not keystrokes.
