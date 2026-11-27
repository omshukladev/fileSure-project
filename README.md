# FileSure CIN checker

A single page where you paste a list of Indian company identifiers (CINs) and LLP identifiers (LLPINs), one per line, and read what each one means.

The page is a static site. There is no server and no database, and nothing you paste is ever sent anywhere. Every answer is computed in your browser from the rules in `lib/`.

## What it reads

A CIN is 21 characters in six blocks:

```
L 17110 MH 1973 PLC 019786
│ │     │  │    │   └── 6 digits: registration number at the registrar
│ │     │  │    └────── 3 letters: company type
│ │     │  └─────────── 4 digits: year of incorporation
│ │     └────────────── 2 letters: state of the registered office
│ └──────────────────── 5 digits: industry code under NIC 2008
└────────────────────── 1 letter: L listed, U unlisted
```

An LLPIN is 7 characters, `AAA-1234`. It is a plain serial number and carries no state, year, listing status or company type.

A valid format does not mean the company exists. Only MCA can confirm that.

## The rules that decide valid or invalid

A CIN passes only if every block is one the registrar could actually have issued. The checker is strict on purpose: a wrong answer that says "valid" is worse than one that explains itself.

- **Listing** is `L` or `U`. Anything else fails.
- **Industry** is five digits. The page reports them but does not interpret them, because the NIC 2008 class list is too large to reproduce honestly and a guess would be worse than silence.
- **State** must be one of the 36 codes MCA issues. A code outside the table fails and suggests the near miss, so `OD` reports that `OR` is the code for Odisha.
- **Year** must be between 1850, when the first Indian company law arrived, and the current year. A future year fails.
- **Type** must be one of the 12 codes in use. Anything else fails.
- **Serial** must be six digits.

Strictness has a cost worth naming: a real company carrying a legacy state code that MCA no longer issues would be reported as invalid rather than accepted. That trade is deliberate, because accepting any well shaped code would let a typo pass as a real company.

## Why the state table is worth a second look

Telangana companies incorporated before June 2014 were given Andhra Pradesh codes, and MCA reissued them as `TG`. So `AP` and `TG` both appear in the table, and the page notes the history when it sees `AP`. Two legacy codes, `CT` and `UA`, are absent because they are no longer issued, so a company still carrying one is reported as invalid with an explanation.

Every entry in the state and type tables was fetched from a source and checked, not recalled. The links are in `docs/specs/0002-decode-rules-and-reference-data/index.md`.

## Run it

Node 22 and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build it

```bash
npm run build
```

The static files land in `out/`. That folder is the whole deployable site.

## Checks

```bash
npm run typecheck
npm run lint
npm test        # unit tests over the decode rules and the result display
```

The suite is 71 tests. It covers every CIN block's own named error, LLPIN recognition, cleaning of messy pastes, the card to row switch and the fault marks.

## Where things live

| Path | What it is |
|---|---|
| `app/page.tsx` | the static page shell |
| `lib/decode.ts` | the decode rules, pure TypeScript, no React |
| `lib/reference/` | the state and company type tables |
| `docs/scope/` | the feature plan |
| `docs/specs/` | the decisions behind the build |
| `docs/user/` | plain language notes, the error log and the session log |
