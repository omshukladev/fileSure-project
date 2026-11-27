import type { Fault } from "@/lib/types";
import { markSpans } from "@/lib/results/spans";

export function ResultCode({
  cleaned,
  faults = [],
}: {
  cleaned: string;
  faults?: Fault[];
}) {
  const segments = markSpans(cleaned, faults);

  return (
    <p className="break-all font-mono text-base leading-[1.5] tracking-wide text-ink">
      {segments.map((segment, index) =>
        segment.fault ? (
          <mark key={index} className="fault-mark">
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </p>
  );
}
