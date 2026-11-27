import type { Block } from "../types";

export type StateEntry = {
  code: string;
  name: string;
  note?: string;
};

const TELANGANA_NOTE =
  "Andhra Pradesh still uses AP. Telangana companies are coded TG here, because the codes for Telangana based companies were reissued from AP to TG in June 2014.";

const MERGED_TERRITORY_NOTE =
  "Daman and Diu and Dadra and Nagar Haveli merged into one territory in 2020, but no replacement code was issued, so older CINs keep this one.";

export const STATES: readonly StateEntry[] = [
  { code: "AN", name: "Andaman and Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh", note: TELANGANA_NOTE },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CG", name: "Chhattisgarh" },
  { code: "CH", name: "Chandigarh" },
  { code: "DD", name: "Daman and Diu", note: MERGED_TERRITORY_NOTE },
  { code: "DL", name: "Delhi" },
  { code: "DN", name: "Dadra and Nagar Haveli", note: MERGED_TERRITORY_NOTE },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "HR", name: "Haryana" },
  { code: "JH", name: "Jharkhand" },
  { code: "JK", name: "Jammu and Kashmir" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LD", name: "Lakshadweep" },
  { code: "MH", name: "Maharashtra" },
  { code: "ML", name: "Meghalaya" },
  { code: "MN", name: "Manipur" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OR", name: "Odisha" },
  { code: "PB", name: "Punjab" },
  { code: "PY", name: "Puducherry" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TG", name: "Telangana" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UT", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
];

const BY_CODE = new Map(STATES.map((state) => [state.code, state]));

export function findState(code: string): StateEntry | undefined {
  return BY_CODE.get(code);
}

export function isStateCode(code: string): boolean {
  return BY_CODE.has(code);
}

export function stateBlock(value: string, start: number): Block {
  const state = findState(value);
  return {
    label: "State",
    value,
    meaning: state ? state.name : "Unknown state code",
    start,
    length: 2,
  };
}
