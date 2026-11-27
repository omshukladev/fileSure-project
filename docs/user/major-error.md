# Major errors and near misses

Why this file exists: the brief asks for a video that shows at least one place the AI got something wrong, and how you caught it. That is hard to reconstruct from memory after a long build. So we write it down the moment it happens.

Two kinds of entries live here:

- **Caught already.** Real mistakes that happened in this session.
- **Trap we are guarding against.** Things the AI will very likely get wrong while building, written now so you recognise them when they appear.

Add to this file while you build. Do not tidy it later.

---

## Caught already

### E4. npm silently skipped every dev dependency

**What happened.** After scaffolding, `npm install` reported success and added only 22 packages. Tailwind, TypeScript and ESLint were all missing.

**Why it happened.** The shell had `NODE_ENV=production` set, and npm treats that as an instruction to skip dev dependencies. So `npm install` did exactly what it was told, and reported "added 22 packages" as a success.

**Why it matters.** This is the strongest kind of AI mistake to show, because nothing errored. The output looked like a pass. If the next step had been "build the page" instead of "verify the build", the failure would have surfaced much later as a confusing missing module error, or worse, the dev server would have run while the production build was silently broken. A confident "installed successfully" was factually true and completely misleading.

**How it was caught.** By not trusting the success message. `ls node_modules` showed 18 folders, which is far too few for a Next.js project. A check for `node_modules/tailwindcss` failed. Then `echo $NODE_ENV` printed `production` and the cause was obvious.

**The fix.** `NODE_ENV=development npm install --include=dev`, which added all 337 packages.

**Lesson.** A success exit code only proves the command did what it was told. It never proves it did what you wanted. Count the result and check for the specific thing you need, rather than reading the summary line.

---

### E1. Asked for a model name that does not exist

**What happened.** When setting up a background helper to verify reference links, the request named a model as `haiku`.

**What the tool said.** `Sub-agent "general" is configured with an unknown model "haiku". Did you mean "claude-haiku-5-5"?`

**Why it matters.** It is a small thing, but it is the shape of almost every AI mistake: a plausible sounding value that was never checked against the real list of allowed values. It produced no result at all, and if nobody read the error, the step would have been silently skipped and we would have believed the links were verified when they were not.

**How it was caught.** The tool returned an error instead of quietly falling back to another model. We then dropped the model line and let it inherit, and finally verified the links by hand, one by one.

**Lesson.** When you ask an AI to do something with a named setting, make it show you the name exists. Do not accept "done" without output.

---

### E2. A file read refused, outside the project

**What happened.** We tried to read a skill definition file sitting outside the project folder.

**What the tool said.** `File is outside workspace (allowed: .../filesure)`.

**Why it matters.** Not a product bug, but a reminder that tools have boundaries. The correct move was to work from the project itself, not to reach around the limit.

**Lesson.** If a tool refuses, read why. Do not invent a workaround that hides the real problem.

---

### E3. Reference page timed out on the first try

**What happened.** Fetching the Wikipedia page for Corporate Identification Number returned `504` on the first attempt.

**What happened next.** A retry a short time later returned the page normally.

**Why it matters.** A single failure is not proof that a source is wrong or gone. If we had concluded "there is no such page" from one timeout, we would have written a broken link into the plan.

**Lesson.** Retry once before you believe a failure.

---

### E5. The state table was missing Maharashtra, and I claimed it was complete

**What happened.** While writing spec 0002, the decode rules spec, I wrote out the MCA state code table from a fetched source. I then wrote the sentence, "The set covers 28 states and 8 union territories and contains no gaps, which is itself a useful signal that the list is complete." I was reasoning that 36 is the right total, so a list that looked the right size must be right.

It had 35 rows. Maharashtra was missing.

**Why it matters.** This is worse than a typo. The table decides which real companies pass the checker. Without `MH`, every Maharashtra company on earth would be reported invalid, including Reliance Industries, whose CIN is the example the whole page is built around. My own spec's first happy path test was `L17110MH1973PLC019786`, which my own table could not pass.

And the sentence I wrote is the tell. I did not count the rows. I looked at the list, recognised the shape of it, and announced that it was complete. The confidence was entirely manufactured.

**How it was caught.** By asking a different model to cross check the spec before I presented it. It counted the rows, found 35 against a claimed 36, noticed the alphabet jumps from `LD` to `ML`, and put `MH` exactly where it belonged. Then it pointed out the deeper problem: my "no gaps so it must be complete" reasoning was not a check at all.

I confirmed it locally in one command rather than trusting the critique:

```
grep -o '| [A-Z][A-Z] |' ... | tr -d '| ' | sort | wc -l    -> 35
grep -c '^MH$'                                              -> 0
```

**The fix.** Restored Maharashtra, recounted both columns (18 and 18), and added the recount instruction to the spec itself so the next edit cannot repeat it. The type table was recounted the same way and does hold 12.

**Lesson.** "That looks about right" is not verification. A count is verification. If you state a number, run the thing that produces that number, and if a list claims completeness, count it against the total you claimed. The most dangerous sentence in a spec is one that asserts its own correctness.

---

### E6. The result type could not hold what the spec demanded

**What happened.** The same cross check found that my invalid result had nowhere to put the blocks that did decode, while the spec's own test demanded that a bad state code still show the year, type and serial.

**Why it matters.** Two rules in the same document contradicted each other. A builder following the type would have written a function that returns nothing useful for an invalid line, and the test would have failed with no obvious cause.

**Other gaps it found in the same pass.** The error code union was never enumerated, so two builders would have invented different names. Fault positions did not say which string they indexed into, and cleaning removes characters, so the page could have highlighted the wrong thing. The LLPIN was never given a shape check, so `1234567` would have passed as valid. The hyphen insertion rule contradicted kind detection, because you cannot add an LLPIN hyphen before you know the line is an LLPIN.

**Lesson.** A type and a test scenario are two statements of the same rule. If they disagree, one of them is wrong, and only reading both together finds it.

---

### E7. Forty two green tests, and the feature was still wrong

**What happened.** The decoder shipped with 42 passing tests. It reported the LLPIN block as `value: "AAA1234"` starting at position 0 with length 7. The cleaned string was `AAA-1234`. So the block claimed to point at characters `0` to `7`, which are `AAA-123`. The printed value and the highlighted span disagreed by one character, and the span was wrong.

**Why it matters.** This is the most useful mistake in the whole build, because nothing warned me. The tests were green, lint was clean, the typecheck passed, the build was static. Every signal I had said done. The suite simply never asked the question that would have caught it. It checked that the block existed, that its label was right, and that the value was the serial, and it never once compared a block's position against the string that position indexes into.

The bug was latent. Nothing imports the decoder yet, so no page rendered a wrong highlight. It would have surfaced in feature 6 as a highlight one character short, with no obvious cause, while I was building something else.

**How it was caught.** By `/check verify` driving the public API with its own inputs instead of trusting the suite. It wrote a probe that sliced `cleaned` at each block's start and length and compared that slice to the block's value. Six CIN blocks matched. The LLPIN printed `slice=AAA-123 match=false`.

That one assertion is the whole lesson. It is four lines, and it was not in the suite.

**The fix.** Two things, not one. First the span: `length` now counts the cleaned identifier, hyphen included, so highlighting `cleaned[start]` shows the whole code. Second the spec: it said positions index `cleaned` but never said what a slice of them must equal, so I made that explicit for a CIN (equal to the value) and for an LLPIN (covers the identifier, may be one character wider than the hyphen free value, because no contiguous slice of `AAA-1234` equals `AAA1234`).

Then I added the missing assertion to the suite, twice over: every CIN span must slice back out as its own value, and it must still hold after a messy paste is cleaned. The suite went from 42 to 46 tests, and the four new ones are all things it should have had from the start.

**Lesson.** A passing suite proves the cases the author thought of, and the author is the one who cannot see their own blind spot. If a value is a position, assert that the position finds the value. Anything less is hoping. This is the argument for running the real thing rather than reading a green summary, and it is worth showing on screen: same code, same author, one probe run, and the difference between a feature that works and one that only looks like it does.

---

## Traps we are guarding against

### T1. Decoding an LLPIN as if it were a CIN

**The mistake.** Treating `AAA-1234` as if its letters encoded a state or a year, because a CIN does.

**The truth.** An LLPIN is a plain serial number. It carries no state, no year, no listing status and no company type. The brief only asks us to say it is an LLP.

**Why this is the big one.** It is the most likely place for a confident, wrong answer. If the page invents a state for an LLP, a reviewer who knows the domain will spot it instantly, and it undermines every other claim the page makes.

**Guard.** A test that asserts an LLPIN result contains no state and no year field at all, and a plain sentence on the page saying what an LLPIN cannot tell you.

---

### T2. Believing a valid format means a real company

**The mistake.** Saying "this company exists" when all we did was check the digits follow the rules.

**The truth.** A CIN can be perfectly well formed and belong to no company at all. MCA's own portal rejects codes that are structurally fine but not on the register.

**Why this is the big one.** It is a false claim about real legal records, made to lawyers and chartered accountants. Overclaiming is worse than being modest.

**Guard.** The page must say "valid format" and never "verified company". Say the difference out loud in the interview. This is the sentence that separates us from candidates who just wrote a regex.

---

### T3. Getting Odisha and Telangana wrong

**The mistake.** Accepting `OD` for Odisha, because it matches the English spelling, or rejecting `AP` for Telangana companies outright.

**The truth.** Odisha's real CIN code is `OR`. Telangana's is `TG` today, and MCA reissued older `AP` codes as `TG` in 2014.

**Why this is the big one.** This is exactly the kind of "tricky input" the brief says they will paste. Getting it wrong is visible and specific.

**Guard.** Test cases for `OR`, `OD`, `TG`, `AP`, and a friendly corrective note rather than a flat rejection.

---

### T4. Stripping leading zeros from the serial number

**The mistake.** Reading the last six digits as a number, which turns `019786` into `19786`.

**The truth.** They are characters, not a quantity. The zeros are part of the code.

**Guard.** A test using a CIN that starts with a zero, asserting the printed value keeps it.

---

### T5. A regex that silently accepts almost anything

**The mistake.** One big pattern with optional parts, or a check that only counts characters.

**The truth.** Every block has its own rule and its own error. A blanket "invalid CIN" fails the brief's "exactly what is wrong".

**Guard.** A test per broken block, each asserting its own named error message.

---

### T6. Cleaning input so aggressively that a real problem is hidden

**The mistake.** Uppercasing, trimming and stripping so much that a genuinely wrong code gets accepted.

**The truth.** Clean the paste habits (spaces, case, invisible characters) but never clean away a character that actually makes the code invalid. A hyphen inside a CIN is an error to report, not a character to delete.

**Guard.** A test that a hyphenated CIN is reported as an error, while stray whitespace is accepted.

---

## How to use this in the video

Pick one entry that actually happened during the build, not one from this list, and show it honestly:

1. Show the AI's wrong output on screen.
2. Say what made you doubt it.
3. Show the check that caught it, ideally a failing test.
4. Show the fix.

A recorded, visible correction is worth more than a claim that you were careful.
