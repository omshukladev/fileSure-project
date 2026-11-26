# Checklist: what is done, what is left

**How to use this.** Work top to bottom. The first unticked box is your next move. Tick a box only when you have seen the thing work, not when you have planned it. If you are unsure whether something is done, it is not done.

**Where this project stands on 26 November 2026.** The page exists, looks finished and loads clean as a static file. The checker does not decode anything yet. That is the single biggest thing standing between you and a submittable entry.

## The honest summary

| | Count |
|---|---|
| Phases finished | 3 of 11 |
| Phases partly done | 2 |
| Phases not started | 6 |
| Days left | today is the deadline, so plan for hours, not days |

**Rough order of the rest:** decode the rules, then the page reads them, then the three judged states, then ship. Everything before the decoder is groundwork. Everything after it is polish and packaging. The video can be recorded in parallel with the last two phases, but leave at least two hours for it, because a ten minute video with four required parts is not a five minute job.

---

## Phase 1 · Stack and architecture

Done. Every verify step was run and observed on 26 November.

- [x] Decide the stack and write it down
- [x] Scaffold the project from that decision
- [x] Verify it, all 14 steps in `docs/specs/0001-static-web-stack-for-cin-checker/verify.md`

**Proof:** `npm run build` prints `/` as static (`○`), `out/index.html` is 20 KB of real HTML, the page still renders with JavaScript turned off, and no banned dependency is installed.

One gotcha worth remembering: this machine has `NODE_ENV=production` set. That makes `npm ci` install 18 packages instead of 288 and skip every dev dependency, so lint and build fail for reasons that are not your code. Run `env -u NODE_ENV npm ci` if you see `eslint: command not found`.

## Phase 2 · Coding standards and tooling

Half done. The conventions are written, the extra tooling is not installed.

- [x] Capture conventions into `AGENTS.md` (stack, build approach, commands, eight rules, five gotchas)
- [ ] Install the remaining tooling: Prettier, Vitest, Playwright, and the npm scripts the spec names (`test`, `e2e`, `format:check`)
- [ ] Check it runs clean

**Left to do:** `npm i -D prettier vitest @playwright/test`, add the three scripts to `package.json`, add `.github/workflows/ci.yml`. The spec already pins the order: `npm ci`, lint, format, typecheck, test, build.

## Phase 3 · Decode rules and reference data

Not started. This is the decision that makes or breaks the checker, and it is a spec, not code.

- [ ] Write the spec with `/architect decode rules & reference data`

**What the spec must contain:** the six block layout of a CIN, the complete MCA state table, the complete company type table, the LLPIN pattern, the shape of one parsed result, and the list of named error reasons. Every entry needs a source, and the links are already collected in `docs/scope/scope.md`.

**Why it matters more than it looks:** you already know most of this from `docs/user/briefing.md`. The spec is where you write it down once so the code never guesses. If you skip this and go straight to code, you will make up state codes and the reviewer will catch it.

The facts you must not lose: 21 characters, `L` or `U`, five NIC digits, two letter state, four digit year, three letter type, six digit serial. Odisha is `OR` not `OD`. Telangana is `TG`, and old `AP` codes were reissued in 2014, so accept both. `DD` and `DN` still appear. Leading zeros matter.

## Phase 4 · Design system and UI foundation

Substantially done ahead of its turn, because the design work happened early. Two things are outstanding.

- [x] Pick the direction: late 1960s government data processing bureau
- [x] Write it down in `.commandcode/design/design-system.md` with real tokens
- [x] Hold it consistently: one accent, square corners, rules not shadows, no cards
- [ ] Decide and document the two result layouts and their switch point (short paste versus long paste)
- [ ] Install shadcn/ui and `motion`, since the spec names both and neither is installed

**On the switch point:** the spec defers the threshold to this phase. Pick a number, write it in the design system, and use the same number in code. A number you invent twice is a bug.

**On shadcn/ui:** worth being honest in the interview. The page currently needs none of it, because there are three controls and no overlay. Installing it just to say it is installed would add weight for no behaviour. If you skip it, say so and say why. That is a better answer than a dependency you cannot justify.

## Phase 5 · Decoder and test suite

Not started. **This is the next real work.** It is also the only feature with a test suite, which is why it carries the Beta tag.

- [ ] Build `lib/decode.ts`, `lib/types.ts`, `lib/reference/`
- [ ] Write the Vitest suite and make it pass

**Done when the tests prove:** a valid CIN decodes every field, each malformed block yields its own named error, an LLPIN is recognised as a pure serial, and messy paste habits are cleaned first (extra spaces, mixed case, trailing punctuation, invisible characters).

**Do not over clean.** `L17110MH1973PLC019786` must keep every zero. A decoder that strips or reorders digits is worse than one that says no.

## Phase 6 · Checker page and results

Not started. This is where the page stops being a poster and becomes the product.

- [ ] Move the state into `components/checker.tsx` behind a `'use client'` boundary
- [ ] Wire the button and the live results
- [ ] Each result opens with one plain sentence, then the decoded blocks
- [ ] Verify it

**The accessibility work already done pays off here:** the `role="status"` region, the labelled input, the skip link and the focus ring are all in place and waiting for real content. Do not rebuild them.

## Phase 7 · Working with long lists

Not started, and it needs a decision first.

- [ ] Write the spec: how the page stays fast and readable at 500 lines
- [ ] Add the summary strip and the filter that hides valid rows

**The brief tests this explicitly.** Five hundred rich cards will crawl. Plan on a table above the threshold, plain text, no per row animation.

## Phase 8 · Download results as CSV

Not started.

- [ ] Build the download button and the CSV writer
- [ ] Verify it opens correctly in Excel and in Numbers

**Watch for:** quoting values that contain commas, and a leading zero getting eaten by a spreadsheet. Prefix such serials so Excel keeps them as text.

## Phase 9 · Shareable link

Not started.

- [ ] Encode the list into the URL **hash fragment**, never the query string
- [ ] Cap the length with a clear message instead of a broken link
- [ ] Verify it

**Why the hash:** a hash never reaches the host and never lands in server logs, so the privacy promise stays true. A query string would quietly break it.

## Phase 10 · Empty, wrong and extreme states

Not started. The brief names these three as judged, so treat them as designed screens, not leftovers.

- [ ] Empty state that teaches with a one click example
- [ ] Wrong input that stays calm and names the failing block
- [ ] 500 line paste that shows a summary, not a wall of red
- [ ] Verify it

**This is where the grader spends time.** Three states, explicitly tested. Build them deliberately even if the rest is thinner.

## Phase 11 · Ship it and submit

Not started. The brief says an entry is not reviewed without these, and this phase holds every remaining item.

- [ ] Deploy to a free host and check the live link on a phone and a laptop
- [ ] Flip the repo to public
- [ ] Write the README that explains the decode rules
- [ ] Export the AI transcripts unedited
- [ ] Record the ten minute video
- [ ] Send the email

**The video needs four parts, all required:**
- [ ] A working demo
- [ ] One design decision, defended out loud
- [ ] A code walkthrough
- [ ] One place the AI was wrong and how it was caught

**Your strongest material is already written down** in `docs/user/major-error.md`. The `NODE_ENV` catch is the best one, because nothing errored and only counting `node_modules` revealed it. The false "missing focus ring" diagnosis is the second best, because the real cause was a stale cache and the lesson is to distrust your first explanation.

---

## Decisions you must still make

These are open, and each one blocks something below it.

| Decision | Blocks | Where it gets written |
|---|---|---|
| The state and type tables, complete and sourced | Phase 5 | spec for phase 3 |
| The card to table switch point | Phases 6 and 7 | design system |
| Whether shadcn/ui is actually used, or dropped with a reason | Phase 4 | spec 0001 |
| The share link length cap | Phase 9 | spec for phase 9 |

## Traps that will cost you time

- **`NODE_ENV=production` in this shell.** Silent dev dependency skip. Use `env -u NODE_ENV`.
- **A stale `.next` directory** fakes a Turbopack module error. `rm -rf .next` before believing the build is broken.
- **`npm start` does not serve a static export.** Use `npx serve out`.
- **An `@media` inside `@layer utilities` is silently dropped** by the compiler. Keep at-rules at top level.
- **Do not add a backend to look impressive.** It would break the privacy promise and the static build, for no gain.

## If you run out of time

Cut in this order. Each cut still leaves something honest to submit.

1. Drop the share link (phase 9). It is a nicety, not a judged state.
2. Drop the CSV (phase 8). Say you scoped it out and why.
3. Simplify the long list handling (phase 7) to plain text rows with a count.
4. **Never cut the decoder, the three judged states, or the video.** Those are the assignment.

A page that decodes ten lines correctly and explains every failure beats a page with a share button that decodes nothing.
