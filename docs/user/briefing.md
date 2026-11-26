# The brief, in plain words

Read this before the interview. Every sentence here is something you can say out loud.

---

## 1. What they asked for, in one breath

One web page. A person pastes a list of Indian company codes, one per line. The page tells them what each code means. Then you put it online and send a link.

That is the whole product. No login. No accounts. No saving of anything.

---

## 2. What the visitor actually does

1. They open the page. One line says what it does. One example code sits there ready to click, so a stranger can try it with no instructions.
2. They paste their list into a box.
3. Results appear below as they type.
4. Each result opens with one plain sentence a business owner understands. Then the parts of the code, laid out as labelled values.
5. If a line is wrong, the message says which part is broken and what was expected. Not just "invalid".
6. On a phone it is one column. Box full width. Results stacked.

For a short paste they see cards. For a long paste they see a table. That switch is a decision we made.

---

## 3. The two codes, explained simply

### CIN: for companies, 21 characters

```
L 17110 MH 1973 PLC 019786
│ │     │  │    │   └── 6 digits: the serial number the office gave it
│ │     │  │    └────── 3 letters: what type of company it is
│ │     │  └─────────── 4 digits: the year it was registered
│ │     └────────────── 2 letters: the state where it is registered
│ └──────────────────── 5 digits: what business it does
└────────────────────── 1 letter: L means listed, U means unlisted
```

Say this: "The CIN is self describing. Each block means something fixed, so you can read it without asking any database."

The example above is Reliance Industries. It is the real one FileSure uses on their own site. Memorise it. It makes you sound fluent.

Common company type codes:

| Code | Meaning |
|---|---|
| PTC | Private limited |
| PLC | Public limited |
| OPC | One person company |
| NPL | Not for profit, Section 8 |
| FTC | Subsidiary of a foreign company |
| GOI | Central government company |
| SGC | State government company |
| ULL | Public company with unlimited liability |
| ULT | Private company with unlimited liability |
| GAP | General association, public, an older code |
| GAT | General association, private, an older code |
| FLC | Financial leasing company |

### LLPIN: for LLPs, 7 characters

Format is `AAA-1234`. Three letters, a hyphen, four digits.

This is the trap. An LLPIN is a plain serial number. It does **not** contain the state, the year, the listing status or the company type.

So for an LLP the page says: this is an LLP, and here is the format. It does not invent a state. If a candidate makes up a state for an LLPIN, that is wrong.

Say this out loud in the interview. It shows you read past the surface.

---

## 4. What "valid" means, part by part

A code is valid only if every part passes:

1. Exactly 21 characters. No spaces inside. No hyphen.
2. First character is `L` or `U`. Nothing else.
3. Characters 2 to 6 are digits.
4. Characters 7 and 8 are a real state code.
5. Characters 9 to 12 are a year that is not in the future and not before company law existed.
6. Characters 13 to 15 are a real company type code.
7. Characters 16 to 21 are six digits.

We report the **first** broken part, by name. That is what the brief means by "exactly what is wrong".

---

## 5. The sentence that separates you from other candidates

Say this unprompted:

> "A format check is not an existence check. My page proves the code is internally consistent with the rules. It does not prove the company exists. Only MCA can tell you that."

Why it lands: MCA's own portal rejects codes that are perfectly well formed but not on the register. Anyone who built a regex will not know this. It also explains why there is no database: the truth about existence lives at MCA, not in our app.

Then add: "Live lookup against MCA is the obvious next step. It is written down as deferred work."

---

## 6. The tricky inputs they will paste

They said they will paste tricky input. Be ready for these:

| Input they try | Right answer |
|---|---|
| `l17110mh1973plc019786` all lowercase | Clean it, accept it |
| `L17110 MH1973 PLC019786` spaces inside | Clean it, accept it |
| `OD` for Odisha | The real code is `OR`. Correct it with a friendly note |
| `TG` for Telangana | Correct today. Old `AP` codes were reissued as `TG` in 2014, so accept both |
| `DD` or `DN` | Real codes from Daman and Diu, and Dadra and Nagar Haveli. Accept them |
| 20 or 22 characters | Say how many you got and how many are needed |
| `000123` at the end | Keep the leading zeros. Stripping them is a real bug |
| Invisible characters from Excel | Strip zero width and non breaking spaces before checking |
| A hyphen inside a CIN | CINs never contain a hyphen. Say so |
| Year `2099` | Digits are fine but a future year is wrong |
| 500 lines at once | Must stay fast and readable. This is where a naive card list dies |

---

## 7. Decisions we made, and why

| Decision | Why we chose it |
|---|---|
| No server and no database | The answer depends only on the text pasted. A server adds a round trip, a thing that can break, and an awkward question: "does my client's CIN leave my machine?" A static page answers in under a millisecond and lets us promise nothing is sent anywhere |
| Still use Next.js | Because you wanted that stack. It can build to plain static files and deploy on Vercel, so you get the framework without running a server |
| Cards for short lists, table for long ones | Cards read best for one to ten codes. A table survives 500 lines. Best experience, at the cost of designing two layouts |
| Counts plus a "show broken only" filter | This is what makes a 500 line paste actually usable instead of a wall of text |
| Download as CSV | A chartered accountant works in a spreadsheet. This is the difference between a toy and a tool |
| Shareable link | One extra way to be useful, with a cap so long lists never make a broken link |
| Match FileSure's own look | The brief says design it as if it goes live on filesure.in tomorrow. Looking like their site argues the page already belongs there |
| Put count of valid, invalid, LLP at the top | So a person scanning 500 results knows the shape of the answer before reading any row |
| Build approach: Skateboard | Ship the smallest complete thing that is genuinely usable, then grow it. One day deadline on one page. No point building layers first |
| Workflow: Alpha, decoder tested | Most features only get a check that they really work. The decoder alone gets a real test suite, because that is where their tricky inputs land |
| Sources recorded and links checked | So every rule in the plan can be defended in the interview. Five links were actually fetched and confirmed, not guessed |

---

## 8. What we do next, in order

1. `/architect stack & architecture` to decide the stack and write it down.
2. Scaffold the project, then capture coding standards with `/audit`.
3. `/architect decode rules & reference data` to write the state table, type table and error messages. This is the heart.
4. `/architect design system & UI foundation` to set the look.
5. Build the decoder with its test suite. Get this right first.
6. Build the page and results.
7. Add long list handling, then CSV, then share links.
8. Design the empty, wrong and huge states properly.
9. Deploy, export transcripts, record the video, send the email.

The full plan with all 11 features lives in `docs/scope/scope.md`.

---

## 9. How they will grade it

Straight from their brief:

- **Does it work?** They will paste tricky input. Hence section 6 above.
- **Is it well designed?** Would a first time visitor understand it and enjoy it? They name layout, typography, spacing, colour, and phone as well as laptop.
- **The three states they named:** empty, wrong, and 500 lines.
- **How do you prompt?** They read the transcripts. So do not hide the AI use. Steering the AI when it is wrong scores points. Accepting its first answer loses points.
- **Do you understand what you built?** Can you explain it simply. Hence this file.

---

## 10. What you must send

All four. The brief says without the transcripts and the video, the assignment is not reviewed.

1. Live link to the page.
2. Public GitHub repo link.
3. Every AI transcript, unedited, from this whole task.
4. A video of 10 minutes or less, with your screen, face and voice, that shows:
   - the page working
   - one design decision you are proud of
   - a walk through of the code
   - at least one place the AI got something wrong, and how you caught it

For that last point, keep `docs/user/major-error.md` open while you build and add every real mistake as it happens.

---

## 11. The live round, if you get shortlisted

30 minutes on video. You share your screen and they ask you to change something in your own page, live, using whatever AI tools you like, while you talk them through it.

So before then: make sure you can run the project, find any file, and explain any function. Do not let the AI be the only one who knows the code.

---

## 12. If time runs short

Ship in this order:

1. Slice 1 and Slice 2, plus the deploy. That is a complete, honest answer.
2. Then the empty, wrong and huge states. These are named in the brief, so they beat the extras.
3. Drop the share link and the CSV before you drop anything the brief explicitly asks for.
