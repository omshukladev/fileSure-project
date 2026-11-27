import type {
  Block,
  DecodeOptions,
  Fault,
  FaultCode,
  List,
  Reading,
} from "./types";
import { findState, isStateCode, stateBlock } from "./reference/states";
import { findCompanyType } from "./reference/company-types";

const CIN_LENGTH = 21;
const LLPIN_LENGTH = 7;
const MIN_YEAR = 1850;

const INVISIBLE = [
  "\u200B",
  "\u200C",
  "\u200D",
  "\uFEFF",
  "\u00A0",
  "\u2028",
  "\u2029",
];

const NEAR_MISS_STATES: Record<string, string> = {
  OD: "OR",
};

const LLPIN_NOTE =
  "An LLPIN is a plain serial number. It identifies the LLP but it does not encode a state, a year, a listing status or a company type, so none of those can be read from it.";

const LISTING_MEANINGS: Record<string, string> = {
  L: "Listed company",
  U: "Unlisted company",
};

export function clean(raw: string): string {
  let value = raw;
  for (const char of INVISIBLE) {
    value = value.split(char).join("");
  }
  return value.replace(/\s+/g, "").toUpperCase();
}

function hyphenless(value: string): string {
  return value.split("-").join("");
}

function isDigits(value: string): boolean {
  return /^[0-9]+$/.test(value);
}

function isLetters(value: string): boolean {
  return /^[A-Z]+$/.test(value);
}

function fault(
  code: FaultCode,
  message: string,
  start: number,
  length: number,
  suggestion?: string,
): Fault {
  return suggestion
    ? { code, message, start, length, suggestion }
    : { code, message, start, length };
}

function currentYear(options: DecodeOptions | undefined): number {
  return (options?.now ?? new Date()).getFullYear();
}

function cinBlocks(value: string): Block[] {
  return [
    {
      label: "Listing",
      value: value.slice(0, 1),
      meaning: LISTING_MEANINGS[value.slice(0, 1)] ?? "Unknown listing status",
      start: 0,
      length: 1,
    },
    {
      label: "Industry",
      value: value.slice(1, 6),
      meaning: "Industry code, following the national industrial classification",
      start: 1,
      length: 5,
    },
    stateBlock(value.slice(6, 8), 6),
    {
      label: "Year",
      value: value.slice(8, 12),
      meaning: "Year of registration",
      start: 8,
      length: 4,
    },
    {
      label: "Type",
      value: value.slice(12, 15),
      meaning: findCompanyType(value.slice(12, 15))?.name ?? "Unknown company type",
      start: 12,
      length: 3,
    },
    {
      label: "Serial",
      value: value.slice(15, 21),
      meaning: "Registration number given by the registrar",
      start: 15,
      length: 6,
    },
  ];
}

function lineFaults(value: string, expected: number): Fault[] {
  const allowed = /^[A-Z0-9]*$/;
  if (!allowed.test(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (!/[A-Z0-9]/.test(value[index])) {
        const show = value[index];
        const reason =
          show === "-"
            ? "A CIN never contains a hyphen. Remove it and paste again."
            : `The character ${show} is not allowed.`;
        return [
          fault(
            "ILLEGAL_CHARACTER",
            `${reason} Found at position ${index + 1}.`,
            index,
            1,
          ),
        ];
      }
    }
  }

  if (value.length !== expected) {
    return [
      fault(
        "LENGTH",
        `This line has ${value.length} characters. ${expected} are expected.`,
        0,
        value.length,
      ),
    ];
  }

  return [];
}

function blockFaults(value: string, year: number): Fault[] {
  const faults: Fault[] = [];

  const listing = value.slice(0, 1);
  if (!isLetters(listing) || (listing !== "L" && listing !== "U")) {
    faults.push(
      fault(
        "LISTING_INVALID",
        `The first character must be L for listed or U for unlisted. Found ${listing || "nothing"}.`,
        0,
        1,
      ),
    );
  }

  const industry = value.slice(1, 6);
  if (!isDigits(industry)) {
    faults.push(
      fault("INDUSTRY_INVALID", "The industry block must be five digits.", 1, 5),
    );
  }

  const stateCode = value.slice(6, 8);
  if (!isStateCode(stateCode)) {
    const suggestion = NEAR_MISS_STATES[stateCode];
    const message = suggestion
      ? `${stateCode} is not a state code. ${suggestion} is the code for that state.`
      : `${stateCode} is not a state code in our table. A legacy code may exist, so check with MCA.`;
    faults.push(fault("STATE_UNKNOWN", message, 6, 2, suggestion));
  }

  const yearText = value.slice(8, 12);
  if (!isDigits(yearText)) {
    faults.push(
      fault("YEAR_INVALID", "The year block must be four digits.", 8, 4),
    );
  } else {
    const parsed = Number(yearText);
    if (parsed < MIN_YEAR) {
      faults.push(
        fault(
          "YEAR_TOO_EARLY",
          `The year ${yearText} is before ${MIN_YEAR}, which is too early for a company registration.`,
          8,
          4,
        ),
      );
    } else if (parsed > year) {
      faults.push(
        fault(
          "YEAR_IN_FUTURE",
          `The year ${yearText} is in the future. The latest possible year is ${year}.`,
          8,
          4,
        ),
      );
    }
  }

  const typeCode = value.slice(12, 15);
  if (!findCompanyType(typeCode)) {
    faults.push(
      fault(
        "TYPE_UNKNOWN",
        `${typeCode} is not a company type code in our table.`,
        12,
        3,
      ),
    );
  }

  const serial = value.slice(15, 21);
  if (!isDigits(serial)) {
    faults.push(
      fault("SERIAL_INVALID", "The serial number must be six digits.", 15, 6),
    );
  }

  return faults;
}

function decodeCin(input: string, value: string, options?: DecodeOptions): Reading {
  const line = lineFaults(value, CIN_LENGTH);
  if (value.length !== CIN_LENGTH || line.some((item) => item.code === "ILLEGAL_CHARACTER")) {
    return { kind: "cin", valid: false, input, cleaned: value, blocks: [], faults: line };
  }

  const faults = blockFaults(value, currentYear(options));
  const blocks = cinBlocks(value);

  if (faults.length > 0) {
    return { kind: "cin", valid: false, input, cleaned: value, blocks, faults };
  }

  const notes: string[] = [];
  for (const block of blocks) {
    if (block.label === "State") {
      const entry = findState(block.value);
      if (entry?.note) {
        notes.push(entry.note);
      }
    }
  }

  return { kind: "cin", valid: true, input, cleaned: value, blocks, notes };
}

function decodeLlpin(input: string, value: string): Reading {
  const bare = hyphenless(value);
  const faults: Fault[] = [];

  const allowed = /^[A-Z0-9-]*$/;
  if (!allowed.test(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (!/[A-Z0-9-]/.test(value[index])) {
        faults.push(
          fault(
            "ILLEGAL_CHARACTER",
            `The character ${value[index]} is not allowed. Found at position ${index + 1}.`,
            index,
            1,
          ),
        );
        break;
      }
    }
    return { kind: "llpin", valid: false, input, cleaned: value, faults };
  }

  const shape = /^[A-Z]{3}-?[0-9]{4}$/;
  if (!shape.test(value) || bare.length !== LLPIN_LENGTH) {
    faults.push(
      fault(
        "LLPIN_SHAPE",
        "An LLPIN is three letters, then four digits, for example AAA-1234.",
        0,
        value.length,
      ),
    );
    return { kind: "llpin", valid: false, input, cleaned: value, faults };
  }

  return {
    kind: "llpin",
    valid: true,
    input,
    cleaned: value,
    blocks: [
      {
        label: "LLPIN",
        value: bare,
        meaning: "Registration number given to the LLP",
        start: 0,
        length: value.length,
      },
    ],
    notes: [LLPIN_NOTE],
  };
}

export function decodeLine(raw: string, options?: DecodeOptions): Reading {
  const value = clean(raw);
  const bare = hyphenless(value);

  if (bare.length === LLPIN_LENGTH) {
    return decodeLlpin(raw, value);
  }

  return decodeCin(raw, value, options);
}

export function decodeList(text: string, options?: DecodeOptions): List {
  const rows: Reading[] = [];

  for (const line of text.split(/\r\n|\r|\n/)) {
    if (clean(line).length === 0) {
      continue;
    }
    rows.push(decodeLine(line, options));
  }

  let valid = 0;
  for (const row of rows) {
    if (row.valid) {
      valid += 1;
    }
  }

  return {
    rows,
    counts: { read: rows.length, valid, invalid: rows.length - valid },
  };
}

export { LLPIN_NOTE };
