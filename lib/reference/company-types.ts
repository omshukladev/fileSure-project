export type CompanyTypeEntry = {
  code: string;
  name: string;
};

export const COMPANY_TYPES: readonly CompanyTypeEntry[] = [
  { code: "PTC", name: "Private limited company" },
  { code: "PLC", name: "Public limited company" },
  { code: "OPC", name: "One person company" },
  { code: "NPL", name: "Not for profit company, Section 8" },
  { code: "FTC", name: "Subsidiary of a foreign company" },
  { code: "GOI", name: "Government of India company" },
  { code: "SGC", name: "State government company" },
  { code: "ULL", name: "Public limited company with unlimited liability" },
  { code: "ULT", name: "Private limited company with unlimited liability" },
  { code: "GAP", name: "General association, public" },
  { code: "GAT", name: "General association, private" },
  { code: "FLC", name: "Financial leasing company" },
];

const BY_CODE = new Map(COMPANY_TYPES.map((entry) => [entry.code, entry]));

export function findCompanyType(code: string): CompanyTypeEntry | undefined {
  return BY_CODE.get(code);
}

export function isCompanyTypeCode(code: string): boolean {
  return BY_CODE.has(code);
}
