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
                  <span className="legend text-[0.5625rem] text-ink-muted">
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

      <section
        id="checker"
        aria-labelledby="checker-heading"
        className="mt-14 scroll-mt-6 border-y-2 border-ink py-10 sm:mt-20 sm:py-14"
      >
        <h2 id="checker-heading" className="sr-only">
          Check a list of identifiers
        </h2>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label htmlFor="codes" className="legend text-ink-muted">
              Paste your identifiers
            </label>
            <p
              id="codes-hint"
              className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ink-muted"
            >
              One per line. Spaces and lower case are cleaned up for you.
            </p>
          </div>
          <p className="font-mono text-xs text-ink-muted">
            A CIN is 21 characters. An LLPIN looks like AAA-1234.
          </p>
        </div>

        <div className="mt-6">
          <textarea
            id="codes"
            name="codes"
            rows={7}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="characters"
            aria-describedby="codes-hint"
            placeholder={"L17110MH1973PLC019786\nU72900KA2010PTC086596\nAAA-1234"}
            className="field-codes ruled block w-full resize-y border border-ink bg-white/70 px-4 py-3 font-mono text-base leading-[2] tracking-wide text-ink placeholder:text-ink-muted"
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <button
            type="button"
            aria-disabled="true"
            aria-describedby="checker-status"
            className="control-primary"
          >
            Read the list
          </button>
          <span id="checker-status" className="legend text-ink-muted">
            The checker is not built yet
          </span>
        </div>

        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {"0 identifiers read. 0 valid, 0 not valid."}
        </div>

        <dl className="mt-10 grid grid-cols-3 gap-x-6 border-t border-rule pt-6">
          {[
            { term: "Read", value: "0" },
            { term: "Valid", value: "0" },
            { term: "Not valid", value: "0" },
          ].map((reading) => (
            <div key={reading.term} className="flex flex-col gap-2">
              <dt className="legend text-ink-muted">{reading.term}</dt>
              <dd className="font-mono text-2xl tabular text-ink sm:text-3xl">
                <span key={reading.value} className="reading reading-write">
                  {reading.value}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

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
