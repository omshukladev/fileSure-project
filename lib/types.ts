export type Kind = "cin" | "llpin";

export type Block = {
  label: string;
  value: string;
  meaning: string;
  start: number;
  length: number;
};

export type FaultCode =
  | "LENGTH"
  | "ILLEGAL_CHARACTER"
  | "LLPIN_SHAPE"
  | "LISTING_INVALID"
  | "INDUSTRY_INVALID"
  | "STATE_UNKNOWN"
  | "YEAR_INVALID"
  | "YEAR_TOO_EARLY"
  | "YEAR_IN_FUTURE"
  | "TYPE_UNKNOWN"
  | "SERIAL_INVALID";

export type Fault = {
  code: FaultCode;
  message: string;
  start: number;
  length: number;
  suggestion?: string;
};

export type CinReading =
  | {
      kind: "cin";
      valid: true;
      input: string;
      cleaned: string;
      blocks: Block[];
      notes: string[];
    }
  | {
      kind: "cin";
      valid: false;
      input: string;
      cleaned: string;
      blocks: Block[];
      faults: Fault[];
    };

export type LlpinReading =
  | {
      kind: "llpin";
      valid: true;
      input: string;
      cleaned: string;
      blocks: Block[];
      notes: string[];
    }
  | {
      kind: "llpin";
      valid: false;
      input: string;
      cleaned: string;
      faults: Fault[];
    };

export type Reading = CinReading | LlpinReading;

export type DecodeOptions = {
  now?: Date;
};

export type List = {
  rows: Reading[];
  counts: { read: number; valid: number; invalid: number };
};
