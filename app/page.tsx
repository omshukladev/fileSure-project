import { Checker } from "@/components/checker";

const CIN_BLOCKS = [
  { pos: "1", width: "w-6", label: "Listing", sample: "L" },
  { pos: "2 to 6", width: "w-20", label: "Industry", sample: "17110" },
  { pos: "7 to 8", width: "w-12", label: "State", sample: "MH" },
  { pos: "9 to 12", width: "w-16", label: "Year", sample: "1973" },
  { pos: "13 to 15", width: "w-14", label: "Type", sample: "PLC" },
  { pos: "16 to 21", width: "w-20", label: "Serial", sample: "019786" },
];

export default function Home() {
  return (
    <main id="content" className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-6 py-10 sm:px-10 sm:py-14">
      <a
        href="#checker"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-6 focus:z-50 focus:border-2 focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-ink"
      >
        Skip to the checker
      </a>

      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-rule pb-4">
        <span className="legend text-ink-muted">FileSure</span>
        <span className="legend text-ink-muted">Registry decoder</span>
      </header>

      <section className="pt-12 sm:pt-20">
        <h1 className="poster rise max-w-4xl text-[2.75rem] sm:text-[4rem] lg:text-[4.75rem]">
          Read any company
          <br />
          <span className="text-orange">number</span> in one paste
        </h1>

        <div className="rise rise-2 mt-10 grid gap-x-10 gap-y-8 sm:mt-14 sm:grid-cols-[1.15fr_1fr]">
          <p className="max-w-[60ch] text-lg leading-[1.6] text-pretty text-ink-muted">
            Paste a list of Indian company or LLP identifiers, one per line, and
            this page tells you what each one means. Listed or unlisted, which
            state, which year it was registered, and what kind of company it is.
            Nothing you paste leaves your browser.
          </p>

          <div className="border-t-2 border-ink pt-4 sm:border-t-0 sm:border-s-2 sm:ps-8 sm:pt-0">
            <h2 className="legend text-ink-muted">A CIN, in its six blocks</h2>
            <ol className="mt-4 flex flex-wrap gap-x-3 gap-y-4">
              {CIN_BLOCKS.map((block, index) => (
                <li key={block.label} className="flex flex-col gap-1">
                  <span
                    style={{ "--block-index": index } as React.CSSProperties}
                    className={`specimen-rule ${block.width} pb-1 font-mono text-sm font-medium tabular tracking-wide`}
                  >
                    {block.sample}
                  </span>
                  <span className="legend text-ink-muted">
                    {block.label}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 font-mono text-xs leading-relaxed text-ink-muted">
              Positions 1 to 21, in this order. Any other order is not a CIN.
            </p>
          </div>
        </div>
      </section>

      <Checker />

      <footer className="mt-auto flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-10">
        <p className="font-mono text-xs text-ink-muted">
          A valid format is not a real company. Only MCA can confirm that.
        </p>
        <p className="legend text-[0.625rem] text-ink-muted">
          Built for FileSure
        </p>
      </footer>
    </main>
  );
}
