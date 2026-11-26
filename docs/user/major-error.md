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
