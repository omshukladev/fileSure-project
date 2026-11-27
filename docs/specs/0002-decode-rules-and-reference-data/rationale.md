# Rationale: decode rules and reference data

## Context

The checker's value depends entirely on its rules being right. There are three separate risks, and they need different answers.

**The tables.** A state code is two letters, which makes it look guessable. It is not. Odisha is `OR` and not `OD`. Telangana is `TG`, and MCA reissued the `AP` codes of Telangana companies in June 2014. Andhra Pradesh still uses `AP` for its own companies today. A model asked to produce a state table from memory will produce a plausible one with `OD` in it, because `OD` is the natural abbreviation for Odisha and the natural abbreviation is wrong. So the table was fetched and checked, not remembered.

**The shape.** An LLPIN looks like a shortened CIN. It is not. It is a sequential registration number with no state, no year, no listing status and no company type inside it. Any code that decodes it like a CIN will produce a confident, wrong state. This is the single most likely failure in the whole build.

**The reporting.** The brief asks for exactly what is wrong. That rules out one regex and a blanket invalid, because a blanket answer tells a compliance reader nothing they can act on.

## The rule set, block by block

**CIN**, 21 characters, read as six blocks:

| # | Positions | Width | Rule | Meaning shown |
|---|---|---|---|---|
| 1 | 1 | 1 | `L` or `U` | Listed or unlisted |
| 2 | 2 to 6 | 5 | Five digits | The economic activity code. Named, not decoded |
| 3 | 7 and 8 | 2 | In the state table | The state name |
| 4 | 9 to 12 | 4 | Four digits, 1850 to the current year | Year of registration |
| 5 | 13 to 15 | 3 | In the company type table | The kind of company |
| 6 | 16 to 21 | 6 | Six digits | The serial. Kept as characters so leading zeros survive |

**LLPIN**: three letters, then four digits, with the hyphen treated as punctuation. Validated as a pure serial. Nothing is decoded from it.

## Verified state table, 36 codes

Checked against the CS Pratik state code guide, which lists each code with its ROC jurisdiction. The set covers 28 states and 8 union territories.

| Code | State or territory | Code | State or territory |
|---|---|---|---|
| AN | Andaman and Nicobar Islands | MN | Manipur |
| AP | Andhra Pradesh | MP | Madhya Pradesh |
| AR | Arunachal Pradesh | MZ | Mizoram |
| AS | Assam | NL | Nagaland |
| BR | Bihar | OR | Odisha |
| CG | Chhattisgarh | PB | Punjab |
| CH | Chandigarh | PY | Puducherry |
| DD | Daman and Diu | RJ | Rajasthan |
| DL | Delhi | SK | Sikkim |
| DN | Dadra and Nagar Haveli | TG | Telangana |
| GA | Goa | TN | Tamil Nadu |
| GJ | Gujarat | TR | Tripura |
| HP | Himachal Pradesh | UP | Uttar Pradesh |
| HR | Haryana | UT | Uttarakhand |
| JH | Jharkhand | WB | West Bengal |
| JK | Jammu and Kashmir | LD | Lakshadweep |
| KA | Karnataka | MH | Maharashtra |
| KL | Kerala | ML | Meghalaya |

Count check, since a table can lose a row in transcription: left column 18, right column 18, total 36. The first draft of this table had 35 rows, because Maharashtra was dropped, which the cross check caught before any code was written. Every future edit should recount.

Three notes sit on this table and are visible in the result rather than hidden in a comment:

- `AP` is a valid state. It also carries a note that Telangana codes were reissued as `TG` in June 2014, so a reader who expected `AP` for Hyderabad understands why a newer code says `TG`.
- `DD` and `DN` stay valid as separate codes. The two territories merged in January 2020 but MCA issued no replacement code, so historical CINs still carry `DD` and `DN`. They carry a note that the territory merged, because a table naming a dissolved territory will otherwise look stale to the accountants reading it.
- `OD` is not a state code. It fails, and the fault suggests `OR`, because that is the mistake a person actually makes.

**Legacy codes not included.** `CT`, `UA` and `TS` do not appear in the verified source. A search for a source confirming them was attempted and the search service returned an error, so they are not asserted. They fail with an unknown state fault whose message says a legacy code may exist and to confirm with MCA. This is the honest position: an unexplained rejection would be worse, and a guessed acceptance would be worse still.

## Verified company type table, 12 codes

Checked against the same guide, which lists exactly these twelve.

| Code | Meaning |
|---|---|
| PTC | Private limited company |
| PLC | Public limited company |
| OPC | One person company |
| NPL | Not for profit, Section 8 company |
| FTC | Subsidiary of a foreign company |
| GOI | Government of India company |
| SGC | State government company |
| ULL | Public limited company with unlimited liability |
| ULT | Private limited company with unlimited liability |
| GAP | General association, public, an older form |
| GAT | General association, private, an older form |
| FLC | Financial leasing company |

The wider MCA set contains rarer codes. They are excluded by the engineer's decision, because a longer table that is partly remembered is a bigger risk than a short table that is checked. The consequence is stated plainly: an unusual real company can be reported invalid, and the fault message says the code is not in the table rather than that the company is fake.

## The industry digits decision

The five digits follow the National Industrial Classification, which has thousands of entries across several revisions. Only the leading digits are stable enough to describe: `62` is computer programming, `64` is financial services, and so on, but a company's five digits do not always map cleanly to the current revision.

Shipping a partial table would create a lookup that is visibly wrong in places, which is worse for this audience than naming the block honestly. So the page says the block is an industry code following the national classification and stops there. A reader who needs the exact activity looks it up in the classification, which is the right place for it.

## Options considered

### Option 1: One pure module, discriminated union, sourced tables

`lib/decode.ts` with `decodeLine` and `decodeList`, a union result keyed on `kind`, tables in `lib/reference/`.

**Pros**:
- The union makes the LLPIN trap impossible to code by accident: there is no field to read.
- Pure functions mean the whole rule set is provable in Node, with no browser and no mocking.
- One home for the rules, so the page cannot drift from the tests.

**Cons**:
- A union is more ceremony than a flat object with optional fields.
- Adding an outcome shape later means editing a type the page depends on.

### Option 2: One regex with capture groups

A single pattern that captures each block, then a lookup on the captured state and type.

**Pros**:
- Very little code, and it reads like the format definition itself.

**Cons**:
- It cannot report every broken block, only the first failure to match, so it fails the brief's "exactly what is wrong".
- A pattern permissive enough to capture a wrong year will accept things it should reject, and tightening it turns the regex into something nobody can read or defend out loud.
- Positions become an afterthought, so pointing at the wrong character is harder.

### Option 3: Flat result type with optional fields, and a separate validator

One `Reading` with every field optional, a `valid` boolean, and a validator that fills what it can.

**Pros**:
- The simplest type to write, and the page can read `result.state` without narrowing.

**Cons**:
- Nothing stops the page rendering a state for an LLPIN, which is the exact mistake the briefing names as the most likely one.
- Optional fields push the "is this really an LLP" question into every consumer.

### Option 4: Accept any two letters as a state and any three as a type

Validate only the shape and the character classes, and treat the lookups as unknown rather than invalid.

**Pros**:
- Never rejects a real company, whatever code MCA invents next.

**Cons**:
- Accepts codes that cannot exist, so `XX` and `ZZZ` pass a checker that claims to validate.
- Contradicts the domain knowledge the whole submission is meant to demonstrate.

## Rationale

Option 1 was chosen because the two things most likely to go wrong here are a wrong lookup and a wrong claim about an LLPIN, and the type system removes the second one entirely. That is not a stylistic preference: AC-3 exists because a confident wrong state on an LLPIN would undermine every other claim the page makes, and a union makes it unwriteable rather than merely discouraged.

Option 2 is the tempting one, and it is worth saying why it loses. A regex can prove a string matches the format, but it cannot say which of six blocks broke, in order, with positions, when more than one is wrong. The moment you need that, you are writing six checks anyway, and the regex has already made positions awkward.

Option 4 was refused for the opposite reason to a guessed table. It passes `XX` and `ZZZ`, so the page would say "valid format" about a code that cannot exist. Saying less and being right beats saying more and being wrong, especially to an audience that files documents for a living.

The tradeoff accepted is the false negative: a real company carrying a legacy code we could not verify is reported invalid, with a message that says so. That is a better failure than quietly accepting a code on a guess, and it is visible in the interview rather than hidden.

## References

**Project sources** (verifiable, in this repo):
- `docs/user/briefing.md`, the state and type tables, the tricky input list, and the twelve type codes
- `docs/user/major-error.md`, traps T1 to T6, which became AC-3, AC-4, AC-2, AC-5 and AC-6
- `docs/scope/scope.md`, feature 3, which sets the done condition and the required contents
- `AGENTS.md`, the rule that domain logic lives in `lib/` and imports no React
- `docs/specs/0002-decode-rules-and-reference-data/index.md`, this spec's build contract

**Practices & standards**:
- Parse strictly and report the failing block rather than a blanket invalid, because a compliance reader needs the character to fix
- Treat an identifier as characters, never as a number, so leading zeros survive
- Validate at the boundary: clean paste habits, then check meaning, never clean away a fault
- A discriminated union makes an impossible state unrepresentable, which is stronger than a test asserting it does not happen
- Inject the clock rather than reading it, so a time dependent rule can be tested without expiring

**Links** (web verified during this session):
- State codes and CIN format guide, CS Pratik K Shah: https://learn.cspratik.com/docs/other-resources/state-codes-cin-format/
- MCA changed the CIN of Telangana companies from `AP` to `TG`, TaxGuru, 5 June 2014: https://taxguru.in/company-law/mca-cin-companies-located-telangana-state.html
- Corporate Identification Number, Wikipedia (structure confirmation only, no state table): https://en.wikipedia.org/wiki/Corporate_Identification_Number
- MCA Find CIN portal, the existence authority the page explicitly does not replace: https://www.mca.gov.in/content/mca/global/en/mca/fo-llp-services/findCinFinalSingleCom.html
