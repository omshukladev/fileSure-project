import type { Reading } from "@/lib/types";
import { layoutFor } from "@/lib/results/layout";
import { ResultCard } from "./result-card";
import { ResultList } from "./result-list";

export function Results({ readings }: { readings: Reading[] }) {
  const layout = layoutFor(readings.length);

  if (layout === "cards") {
    return (
      <div className="mt-8 flex flex-col gap-5">
        {readings.map((reading, index) => (
          <ResultCard key={`${reading.cleaned}-${index}`} reading={reading} />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8">
      <ResultList readings={readings} />
    </div>
  );
}
