import type { Reading } from "@/lib/types";
import { ResultCode } from "./result-code";
import { ResultOutcome } from "./outcome";
import { ResultBlocks } from "./result-blocks";
import { ResultReading } from "./result-reading";

export function ResultCard({ reading }: { reading: Reading }) {
  const faults = reading.valid ? [] : reading.faults;

  return (
    <article className="docket flex flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <ResultOutcome reading={reading} />
        <p className="legend text-ink-muted">
          {reading.kind === "cin" ? "CIN" : "LLPIN"}
        </p>
      </div>

      <ResultCode cleaned={reading.cleaned} faults={faults} />
      <ResultReading reading={reading} />

      <div className="border-t border-rule pt-4">
        <ResultBlocks reading={reading} />
      </div>
    </article>
  );
}
