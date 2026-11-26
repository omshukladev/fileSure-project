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
npm test        # unit tests over the decode rules
npm run e2e     # browser test against the built site
```

## Where things live

| Path | What it is |
|---|---|
| `app/page.tsx` | the static page shell |
| `lib/decode.ts` | the decode rules, pure TypeScript, no React |
| `lib/reference/` | the state and company type tables |
| `docs/scope/` | the feature plan |
| `docs/specs/` | the decisions behind the build |
| `docs/user/` | plain language notes, the error log and the session log |
