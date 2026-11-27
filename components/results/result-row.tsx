import type { Reading } from "@/lib/types";
import { blockByLabel } from "@/lib/results/blocks";
import { ResultCode } from "./result-code";
import { ResultOutcome } from "./outcome";
import { ResultBlocks } from "./result-blocks";
import { ResultReading } from "./result-reading";

function Cell({
  label,
  value,
  meaning,
  absent = false,
}: {
  label: string;
  value: string;
  meaning: string;
  absent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="legend text-ink-muted sm:hidden">{label}</span>
      {absent ? (
        <span className="font-mono text-sm text-ink-muted">
          <span aria-hidden="true">—</span>
          <span className="sr-only">Not applicable</span>
        </span>
      ) : (
        <>
          <span className="font-mono text-sm tabular text-ink">{value}</span>
          {meaning ? (
            <span className="text-xs leading-snug text-ink-muted">
              {meaning}
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}

export function ResultRow({ reading }: { reading: Reading }) {
  const faults = reading.valid ? [] : reading.faults;
  const state = blockByLabel(reading, "State");
  const year = blockByLabel(reading, "Year");
  const type = blockByLabel(reading, "Type");

  return (
    <details className="group border-b border-rule">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-3 px-1 py-4 marker:content-none sm:flex-nowrap">
        <span className="w-full font-mono text-sm break-all text-ink sm:w-auto sm:min-w-0 sm:flex-1">
          {reading.cleaned}
        </span>
        <ResultOutcome reading={reading} />
        {/* Fixed columns so a row with no state, year or type keeps the
            same rhythm as one with all three. */}
        <div className="grid w-full grid-cols-3 gap-x-4 sm:w-[20rem] sm:shrink-0">
          <Cell
            label="State"
            value={state?.value ?? ""}
            meaning={state?.meaning ?? ""}
            absent={!state}
          />
          {/* The year's stored meaning is "Year of registration", which the
              column label already says, so the cell shows the value alone. */}
          <Cell
            label="Year"
            value={year?.value ?? ""}
            meaning=""
            absent={!year}
          />
          <Cell
            label="Type"
            value={type?.value ?? ""}
            meaning={type?.meaning ?? ""}
            absent={!type}
          />
        </div>
        <span
          aria-hidden="true"
          className="hidden w-10 shrink-0 text-end font-mono text-xs text-ink-muted sm:block"
        >
          <span className="group-open:hidden">Open</span>
          <span className="hidden group-open:inline">Close</span>
        </span>
      </summary>

      <div className="flex flex-col gap-4 px-1 pb-6">
        <ResultCode cleaned={reading.cleaned} faults={faults} />
        <ResultReading reading={reading} />
        <ResultBlocks reading={reading} />
      </div>
    </details>
  );
}
