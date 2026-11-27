import type { Reading } from "@/lib/types";
import { plainSentence } from "@/lib/results/summary";

export function ResultReading({ reading }: { reading: Reading }) {
  const faults = reading.valid ? [] : reading.faults;
  const notes = reading.valid ? reading.notes : [];

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-[60ch] text-base leading-relaxed text-ink">
        {plainSentence(reading)}
      </p>

      {reading.input !== reading.cleaned ? (
        <p className="font-mono text-xs leading-relaxed text-ink-muted">
          Pasted as {reading.input}
        </p>
      ) : null}

      {faults.length > 0 ? (
        <ul className="flex flex-col gap-3 border-s-2 border-ink ps-4">
          {faults.map((fault, index) => (
            <li key={`${fault.code}-${index}`} className="flex flex-col gap-1">
              <p className="text-sm leading-relaxed text-ink">{fault.message}</p>
              {fault.suggestion ? (
                <p className="text-sm leading-relaxed text-ink-muted">
                  {fault.suggestion}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {notes.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {notes.map((note, index) => (
            <li
              key={index}
              className="max-w-[60ch] text-sm leading-relaxed text-ink-muted"
            >
              {note}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
