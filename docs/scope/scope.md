# Scope: CIN Checker (FileSure tech assignment)

A single page where a CA, a lawyer or a business owner pastes a list of Indian company and LLP identifiers, one per line, and gets back what each one means: valid or not, company or LLP, listed or unlisted, state, year of incorporation and company type. Built to look and read as if it went live on filesure.in tomorrow.

**Build approach:** Skateboard (ship the smallest usable whole, then grow the same page release by release).
**Workflow:** Alpha (/check verify after /develop). The decoder carries a `· Beta` tag so it also gets a real test suite, because that is where the reviewer's tricky inputs land. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | done |
| 2 | Coding standards & tooling | Foundation | in-progress |
| 3 | Decode rules & reference data | Foundation | planned |
| 4 | Design system & UI foundation | Foundation | in-progress |
| 5 | Decoder & test suite | Slice 1 | planned |
| 6 | Checker page & results | Slice 1 | planned |
| 7 | Working with long lists | Slice 2 | planned |
| 8 | Download results as CSV | Slice 2 | planned |
| 9 | Shareable link | Slice 3 | planned |
| 10 | Empty, wrong and extreme states | Slice 3 | planned |
| 11 | Ship it and submit | Slice 4 | planned |

## Foundations

### 1. Stack & architecture · done
Decide how the page is built and scaffold a runnable project so every later slice stands on real structure. One decision worth defending out loud: this page needs no server and no database, because the answer is fully determined by the text the visitor pastes, so a static build answers in under a millisecond, works on any free host, and lets you say honestly that nothing pasted ever leaves the browser.
**Done when:** the spec records the stack and the "no server, no database" call with its reasoning, and the empty scaffold boots locally and passes a production build.
- [x] Decide the stack (spec): `/architect stack & architecture`
- [x] Scaffold from the decision: `/develop stack & architecture`
- [x] Verify it: `/check verify stack & architecture`
Spec [0001](../specs/0001-static-web-stack-for-cin-checker/index.md) · code in `app/`, `next.config.ts`

### 2. Coding standards & tooling · in-progress
Capture the conventions the assignment is judged on (readable code you can explain simply) and install the guards so every later file follows them, from the real scaffold.
**Done when:** root `AGENTS.md` reflects the real stack, and lint, format and type checking run clean on the scaffold.
- [x] Capture conventions + tooling choices: `/audit`
- [ ] Install the tooling: `/develop tooling`
- [ ] Check it runs clean: `/check verify tooling`
Root `AGENTS.md` holds the stack, the Skateboard approach, the commands, eight rules and five gotchas. Prettier, Vitest and Playwright are still to install.

### 3. Decode rules & reference data · needs a decision
The one place the domain rules live, because guessing here is what makes a checker wrong. Decides the exact block layout of a CIN, the full table of MCA state codes, the full table of company type codes, how NIC industry digits are described (or deliberately left unexplained), the LLPIN pattern, and the shape of one parsed result plus its error reasons. Everything in slices 1 to 3 rests on this.
**Done when:** the spec carries the state table, the type table and the error reason list, each entry traceable to a source, and states plainly what an LLPIN can and cannot tell you.
- [ ] Design it (spec): `/architect decode rules & reference data`

### 4. Design system & UI foundation · needs a decision
Match FileSure's own visual language so the page argues it already belongs on filesure.in, and decide the two result layouts (cards for a short paste, a table for a long one) before either is built. Owns type scale, spacing, colour, badges for valid, invalid and LLP, and the base components.
**Done when:** `design.md` covers type, colour, spacing, the two result layouts and their switch point, and the base components handle focus, keyboard and a phone width.
- [ ] Design it (spec): `/architect design system & UI foundation`

## Slice 1: The smallest usable whole

### 5. Decoder & test suite · Beta
Turn one line of text into a typed result: which kind it is, and for a CIN every block decoded or the exact reason it breaks. Pure logic with no screen attached, so it can be tested against the tricky inputs a reviewer will try.
**Done when:** a test suite proves valid CINs decode every field, each malformed block yields its own named error, LLPINs are recognised, and messy paste habits (extra spaces, mixed case, trailing punctuation, invisible characters) are cleaned before checking.
- [ ] Build it: `/develop decoder & test suite`
- [ ] Test it: `/test decoder & test suite`

### 6. Checker page & results
The page itself: a paste box, live results under it, and each result opening with one plain sentence a non expert understands, then the decoded blocks as labelled values. Cards for a short paste, table for a long one, one column on a phone.
**Done when:** a first time visitor can paste a list with no instructions and read every answer, each invalid line says which block failed and what was expected, and the phone layout is usable at 360 pixels wide.
- [ ] Build it: `/develop checker page & results`
- [ ] Verify it: `/check verify checker page & results`

## Slice 2: Real client files

### 7. Working with long lists · needs a decision
Five hundred lines is called out in the brief, and five hundred rich cards will make a browser crawl. Decide how the page stays fast and readable at that size, then add the summary strip and the filter that makes a big paste actionable.
**Done when:** pasting 500 lines stays responsive while scrolling and typing, a summary shows how many were valid, invalid and LLP, and one control hides the valid ones without losing the counts.
- [ ] Design it (spec): `/architect working with long lists`

### 8. Download results as CSV
Let a visitor take the decoded list into a spreadsheet, which is how a CA actually files client work.
**Done when:** one button downloads a CSV with a header row and one row per pasted line, messy values are quoted safely, and the file opens correctly in Excel and in Numbers.
- [ ] Build it: `/develop download results as CSV`
- [ ] Verify it: `/check verify download results as CSV`

## Slice 3: Share and polish

### 9. Shareable link
Encode the pasted list into the URL so a colleague opening the link sees the same results, with a sane cap so long lists never produce a broken link.
**Done when:** opening a share link restores the list and its results, a list beyond the cap shares a clear message instead of a truncated link, and no pasted data is sent anywhere to make it work.
- [ ] Build it: `/develop shareable link`
- [ ] Verify it: `/check verify shareable link`

### 10. Empty, wrong and extreme states
The brief names these three states as judged, so treat them as designed screens rather than leftovers: an empty page that teaches with a working example, a wrong input that stays calm and specific, and an enormous paste that stays readable.
**Done when:** the empty state offers a one click example, a single garbage line explains what was expected without an alarm, and a 500 line paste shows a summary rather than a wall of red.
- [ ] Build it: `/develop empty, wrong and extreme states`
- [ ] Verify it: `/check verify empty, wrong and extreme states`

## Slice 4: Submit

### 11. Ship it and submit
The brief says an entry is not reviewed without these, so they are part of the product, not an afterthought.
**Done when:** the live URL loads on a phone and a laptop, the repo is public with a short README that explains the decode rules, the AI transcripts are exported unedited, and the ten minute video covers a working demo, one design decision, a code walkthrough and one place the AI was wrong and how it was caught.
- [ ] Deploy to a free host and check the live link: `/develop ship it and submit`
- [ ] Export transcripts, record the video, send the email: `/develop ship it and submit`

## Deferred
Out of scope for today, kept so the plan stays honest and so you have something to say when the interviewer asks what you would do next.
- **Live lookup against MCA records**: confirm the CIN exists and pull the real company name, not just decode the digits. Needs a decision. This is the honest boundary of what a decoder can claim.
- **Bulk clean up and fix suggestions**: offer to correct near misses like `OD` for `OR` or a stray space. Needs a decision.
- **Saved history for repeat visitors**: remember recent lists in the browser. Needs a decision.
- **Analytics on what people paste**: useful for the team, and a privacy question for this audience. Needs a decision.

## References

### Project sources
- The assignment brief in `extra/filesure_tech_assignment.txt` and `extra/FileSure-Tech-Assignment.pdf` (the six decoded fields, the three judged states, the four submission items).
- FileSure's live site at filesure.in (visual language, and the fact that search accepts a name, CIN, LLPIN, company PAN or GSTIN).

### Practices and standards
- Foundations before features, and ship the smallest usable whole first: a page that answers one honest question is more useful than a half built app (basis: Skateboard approach).
- Parse strictly and report the failing block, never a blanket "invalid": a compliance audience needs to know which character to fix (basis: the brief's "exactly what is wrong").
- Keep the domain rules in one module with a test suite, so the page and every later feature read from a single truth (basis: decode rules and reference data feature).

### Links
Verified official and reference pages behind the decode rules:
- Wikipedia, Corporate Identification Number: https://en.wikipedia.org/wiki/Corporate_Identification_Number
- MCA, Find CIN (Ministry of Corporate Affairs company search): https://www.mca.gov.in/content/mca/global/en/mca/fo-llp-services/findCinFinalSingleCom.html
- MCA, Master Data Services: https://www.mca.gov.in/content/mca/global/en/mca/master-data/MDS.html
- CS Pratik Shah, State Codes and CIN Format Guide: https://learn.cspratik.com/docs/other-resources/state-codes-cin-format/
- TaxGuru, MCA changed the CIN of Telangana companies from AP to TG: https://taxguru.in/company-law/mca-cin-companies-located-telangana-state.html

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies (`Design it (spec)`, `Decide the stack (spec)`), so skills locate it by that `(spec)` suffix, never by an exact label.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + 2 to 5 milestones; the tier's closing boxes |
| `in-progress` (building) | `/develop` | milestone sub boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** | boxes you ran ticked; the tier's last stage is the suggested point to call it done |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **Status** `planned` to `in-progress` to `done`, plus `existing` and `dropped`.
- **Workflow tier tag** beside a heading (`· Beta`) sets that one feature's rigor above the project default; no tag inherits Alpha.
- **Workflow** (header line) is the project default: Alpha means `/check verify` after `/develop`. Beta adds `/test`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
