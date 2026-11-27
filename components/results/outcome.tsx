import type { Reading } from "@/lib/types";

export function ResultOutcome({ reading }: { reading: Reading }) {
  const pass = reading.valid;
  return (
    <p className={pass ? "stamp stamp-pass" : "stamp stamp-fail"}>
      <span>{pass ? "Valid" : "Not valid"}</span>
      {reading.kind === "llpin" ? (
        <span className="stamp-kind">LLP</span>
      ) : null}
    </p>
  );
}
