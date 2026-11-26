# Session log

A running record of every working session on this assignment. Newest entry at the top, so you can read the latest state first. Add a new entry each time you sit down; do not rewrite old ones.

Each entry keeps the same shape:

- **Goal**: what this session set out to do
- **Did**: what actually happened, in order
- **Decisions**: what was chosen and the reason
- **Errors and corrections**: what went wrong, linked to `major-error.md`
- **Left over**: what the next session should pick up

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
