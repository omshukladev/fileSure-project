import type { Reading } from "@/lib/types";
import { ResultRow } from "./result-row";

export function ResultList({ readings }: { readings: Reading[] }) {
  return (
    <div className="border-t-2 border-ink">
      {readings.map((reading, index) => (
        <ResultRow key={`${reading.cleaned}-${index}`} reading={reading} />
      ))}
    </div>
  );
}
