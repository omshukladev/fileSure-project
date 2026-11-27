# Checklist: what is done, what is left

**How to use this.** Work top to bottom. The first unticked box is your next move. Tick a box only when you have seen the thing work, not when you have planned it. If you are unsure whether something is done, it is not done.

**Where this project stands on 27 November 2026.** The rules are decided and the decoder is built and proven. The page still shows a static poster because nothing imports the decoder yet. That wiring is the single biggest thing standing between you and a submittable entry.

## The honest summary

| | Count |
|---|---|
| Phases finished | 3 of 11 |
| Phases partly done | 2 |
| Phases not started | 6 |
| Next real work | connect the decoder to the page |

| Phase | State | One line |
|---|---|---|
| 1 Stack and architecture | done | static export proven, 14 verify steps run |
| 2 Coding standards and tooling | half | conventions and Vitest in, Prettier, Playwright, CI out |
| 3 Decode rules and reference data | done | spec written, tables sourced, verified |
| 4 Design system and UI foundation | half | look is finished, result display designed, not built |
| 5 Decoder and test suite | done | 46 tests, all 10 criteria verified |
| 6 Checker page and results | not started | the next real work |
| 7 Working with long lists | not started | switch point decided, filter and speed left |
| 8 Download results as CSV | not started | |
| 9 Shareable link | not started | |
| 10 Empty, wrong and extreme states | not started | empty and wrong are designed in spec 0003 |
| 11 Ship it and submit | not started | holds every remaining item |

**Rough order of the rest:** build the results display, build the page, then the long list filter, then ship. The video can be recorded in parallel with the last two phases, but leave at least two hours for it, because a ten minute video with four required parts is not a five minute job.

---

## Phase 1 · Stack and architecture · done

Every verify step was run and observed on 26 November.

- [x] Decide the stack and write it down
- [x] Scaffold the project from that decision
- [x] Verify it, all 14 steps in `docs/specs/0001-static-web-stack-for-cin-checker/verify.md`

**Proof:** `npm run build` prints `/` as static (`○`), and the page renders with JavaScript turned off.

One gotcha worth remembering: this machine has `NODE_ENV=production` set. That makes `npm ci` skip every dev dependency, so lint and build fail for reasons that are not your code. Run `env -u NODE_ENV npm ci`.

## Phase 2 · Coding standards and tooling · half done

- [x] Capture conventions into `AGENTS.md` (stack, build approach, commands, rules, gotchas)
- [x] Install Vitest, with `test` and `test:watch` scripts
- [ ] Install Prettier and Playwright, and add the `format:check` and `e2e` scripts
- [ ] Add `.github/workflows/ci.yml` running `npm ci`, lint, format, typecheck, test, build
- [ ] Check it runs clean

**Left to do:** `env -u NODE_ENV npm i -D prettier @playwright/test`. Vitest is already in, which is why this phase is half rather than untouched. Playwright is the first thing to cut if time runs short; Vitest is the gate.

Note: `@types/node` moved from 20 to 22 when Vitest was installed, because Vitest 5 requires it and `.nvmrc` says 22. That is aligned, not drift.

## Phase 3 · Decode rules and reference data · done

Spec 0002, written 26 November, built and verified 27 November.

- [x] Write the spec with `/architect decode rules & reference data`
- [x] Build the tables and the rules
- [x] Verify it, all 19 steps in the spec's `verify.md`

**Proof:** 36 state codes and 12 company type codes, both counted from a fetched source rather than recalled. `AP`, `DD` and `DN` stay valid with notes; `OD` suggests `OR`; `CT`, `UA` and `TS` fail with an explanation rather than passing on a guess.

**The decision that carries most weight:** an LLPIN is a separate branch of the result type with no state and no year field, so decoding an LLP like a CIN fails at compile time. That is the trap in T1 of `major-error.md`, closed by the type rather than by a test.

**One thing to say out loud in the interview:** the first draft of the state table had 35 codes and claimed 36, because Maharashtra was missing. A cross check caught it. Reliance's CIN, the example the whole page is built on, would have been rejected by my own table. That is E5.

## Phase 4 · Design system and UI foundation · half done

- [x] Pick the direction: late 1960s government data processing bureau
- [x] Write it down in `.commandcode/design/design-system.md` with real tokens
- [x] Hold it consistently: one accent, square corners, rules not shadows
- [x] Decide the result display and the switch point (spec 0003)
- [ ] Build it: the nine steps in spec 0003
- [ ] Update the design system doc to cover the result display

**The switch point, decided:** cards up to five lines, rows past five, and the rows stack on a phone. It is one tested function, so the number lives in one place.

**Why five and not ten:** I first wrote ten and claimed it was "about two screens of reading". A cross check said otherwise and it was right. Ten cards is about 140 lines because each block renders a label, a value and a meaning. Five is about seventy, which a person will read. That is E8.

**On shadcn/ui, the plan changed.** The briefing said install it. Spec 0003 says no, because the page needs five primitives and the tokens already style four of them. A library would be retuned almost entirely. Say that out loud rather than skipping the question, because it is a decision you changed your mind about with a reason, which is a better answer than a dependency you cannot justify.

## Phase 5 · Decoder and test suite · done

Built under phase 3 rather than as a separate step, because the spec and the code were designed together.

- [x] Build `lib/decode.ts`, `lib/types.ts`, `lib/reference/`
- [x] Write the Vitest suite and make it pass: 46 tests
- [x] Verify it

**Proof:** `env -u NODE_ENV npm test` prints 46 passed. Typecheck, lint and the static build all pass. Every one of the 10 acceptance criteria is met, with 19 of 19 verify steps run.

**The most valuable thing in this phase is not the passing suite.** It is that the suite passed at 42 tests while the LLPIN block pointed one character short. `/check verify` caught it by slicing the cleaned string at each block's position and comparing. That is E7, and it is the strongest video material in the repo, because every signal said done and the feature was still wrong.

**Do not over clean.** `L17110MH1973PLC019786` keeps every zero. A test asserts it.

## Phase 6 · Checker page and results · not started

**This is the next real work.** The decoder is finished and nothing imports it.

- [ ] Move the state into `components/checker.tsx` behind a `'use client'` boundary
- [ ] Build the results components from spec 0003
- [ ] Wire the live decode with the 250ms debounce
- [ ] Remove the inert button, since results now appear as you type
- [ ] Verify it

**The accessibility work already done pays off here:** the `role="status"` region, the labelled input, the skip link and the focus ring are all in place and waiting for real content. Do not rebuild them.

**Two things spec 0003 settles so you do not have to decide them mid build:** the displayed code is always the cleaned one, because that is what the decoder's positions index, and an invalid LLPIN has no blocks at all so its card shows the code and faults only.

## Phase 7 · Working with long lists · not started

The layout question is now answered. What is left is speed and filtering.

- [x] Decide the switch point (spec 0003: cards to five, rows past)
- [x] Decide how each row shows its detail (native disclosure, no script)
- [ ] Add the summary strip and the filter that hides valid rows
- [ ] Confirm a 500 line paste stays responsive while typing and scrolling
- [ ] Verify it

**The brief tests this explicitly.** Five hundred lines is named in it. The row layout is plain and per row animation is absent, which is the plan that survives that size.

## Phase 8 · Download results as CSV · not started

- [ ] Build the download button and the CSV writer
- [ ] Verify it opens correctly in Excel and in Numbers

**Watch for:** quoting values that contain commas, and a leading zero getting eaten by a spreadsheet. Prefix such serials so Excel keeps them as text. Your decoder already keeps the zeros, so this is about the spreadsheet's behaviour, not yours.

## Phase 9 · Shareable link · not started

- [ ] Encode the list into the URL **hash fragment**, never the query string
- [ ] Cap the length with a clear message instead of a broken link
- [ ] Verify it

**Why the hash:** a hash never reaches the host and never lands in server logs, so the privacy promise stays true. A query string would quietly break it.

## Phase 10 · Empty, wrong and extreme states · not started

Two of the three are already designed in spec 0003. Build them deliberately.

- [x] Design the empty state (one hint and one clickable example)
- [x] Design the wrong input state (marked failing characters, passing blocks kept)
- [ ] Build the empty state
- [ ] Build the wrong input state
- [ ] Build the 500 line paste so it shows a summary, not a wall of red
- [ ] Verify it

**This is where the grader spends time.** Three states, explicitly tested.

## Phase 11 · Ship it and submit · not started

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

**Your strongest material is already written down** in `docs/user/major-error.md`, and it is better than it was in November because two more entries are now real:

| Entry | Why it is strong |
|---|---|
| E5 | The state table was missing Maharashtra while claiming to be complete. A count caught it, not an instinct |
| E7 | 42 green tests and the feature was still wrong. A runtime probe caught what the suite could not see |
| E8 | I claimed ten cards was two screens. It was about 140 lines. A measurement claim I never measured |
| E9 | I specified a `details` element inside a table row, which is invalid HTML |

E7 is the best one to show, because nothing errored. Every signal said done: green tests, clean lint, clean typecheck, static build. The feature was wrong anyway, and the fix was adding the assertion the suite never had.

## Decisions you must still make

| Decision | Blocks | Where it gets written |
|---|---|---|
| The share link length cap | Phase 9 | spec for phase 9 |
| Whether Prettier and Playwright are worth the time, or cut | Phase 2 | `package.json` |
| Whether the five line card limit survives real pastes | Phases 6 and 7 | spec 0003 |

Settled already, so do not reopen them: the state and type tables, the card to row switch, and whether shadcn/ui is used (it is not, with a reason).

## Traps that will cost you time

- **`NODE_ENV=production` in this shell.** Silent dev dependency skip. Use `env -u NODE_ENV`.
- **A stale `.next` directory** fakes a Turbopack module error. `rm -rf .next` before believing the build is broken.
- **`npm run typecheck` needs a build first.** `next-env.d.ts` imports generated route types, so a wiped `.next` fails with `Cannot find name 'LayoutProps'`. Build first.
- **`npm start` does not serve a static export.** Use `npx serve out`.
- **An `@media` inside `@layer utilities` is silently dropped** by the compiler. Keep at-rules at top level.
- **A `details` element cannot go inside a table row.** A row may only hold cells. This is E9.
- **Do not add a backend to look impressive.** It would break the privacy promise and the static build, for no gain.

## If you run out of time

Cut in this order. Each cut still leaves something honest to submit.

1. Drop the share link (phase 9). It is a nicety, not a judged state.
2. Drop the CSV (phase 8). Say you scoped it out and why.
3. Drop Prettier and Playwright, keeping Vitest.
4. Simplify the long list handling (phase 7) to plain rows with a count.
5. **Never cut the decoder, the page wiring, the three judged states, or the video.** Those are the assignment.

A page that decodes ten lines correctly and explains every failure beats a page with a share button that decodes nothing.
