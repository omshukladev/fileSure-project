import { EXAMPLE_INPUT } from "@/lib/results/examples";

export function EmptyState({ onFill }: { onFill: (text: string) => void }) {
  return (
    <div className="mt-8 border-t-2 border-ink pt-6">
      <p className="legend text-ink-muted">Nothing pasted yet</p>
      <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-ink-muted">
        Paste one identifier per line, or try the example to see how a reading
        looks.
      </p>
      <button
        type="button"
        onClick={() => onFill(EXAMPLE_INPUT)}
        className="example-fill mt-4 inline-flex min-h-11 items-center gap-2 border border-ink px-3 py-2 font-mono text-xs tracking-wide text-ink"
      >
        Try the example
      </button>
    </div>
  );
}
