import type { Block, Reading } from "@/lib/types";

const CIN_ORDER = ["Listing", "Industry", "State", "Year", "Type", "Serial"];

function order(blocks: Block[]) {
  return [...blocks].sort(
    (a, b) => CIN_ORDER.indexOf(a.label) - CIN_ORDER.indexOf(b.label),
  );
}

export function ResultBlocks({ reading }: { reading: Reading }) {
  if (!("blocks" in reading) || reading.blocks.length === 0) {
    return null;
  }

  const isLlp = reading.kind === "llpin";
  const blocks = isLlp ? reading.blocks : order(reading.blocks);

  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {blocks.map((block) => (
        <div key={block.label} className="flex flex-col gap-1">
          <dt className="legend text-ink-muted">{block.label}</dt>
          {/* An LLPIN's one block holds the same serial shown as the code
              above it, so it prints its meaning only rather than twice. */}
          {isLlp ? null : (
            <dd className="font-mono text-base tabular text-ink">
              {block.value}
            </dd>
          )}
          <dd className="text-sm leading-snug text-ink-muted">
            {block.meaning}
          </dd>
        </div>
      ))}
    </dl>
  );
}
