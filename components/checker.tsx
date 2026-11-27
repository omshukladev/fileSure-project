"use client";

import { useEffect, useMemo, useState } from "react";
import { decodeList } from "@/lib/decode";
import type { Reading } from "@/lib/types";
import { countReadings, totalsSentence } from "@/lib/results/counts";
import { DEBOUNCE_MS } from "@/lib/results/layout";
import { EmptyState } from "./results/empty-state";
import { Results } from "./results/results";

export function Checker() {
  const [text, setText] = useState("");
  const [atRest, setAtRest] = useState("");

  useEffect(() => {
    if (text === atRest) {
      return;
    }
    const timer = setTimeout(() => setAtRest(text), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, atRest]);

  const readings = useMemo<Reading[]>(() => {
    if (atRest.trim().length === 0) {
      return [];
    }
    return decodeList(atRest).rows;
  }, [atRest]);

  const counts = countReadings(readings);

  return (
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
          value={text}
          onChange={(event) => setText(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="characters"
          aria-describedby="codes-hint"
          placeholder={"L17110MH1973PLC019786\nU72900KA2010PTC086596\nAAA-1234"}
          className="field-codes ruled block w-full resize-y border border-ink bg-white/70 px-4 pt-0 pb-3 font-mono text-base leading-[var(--ruled-line)] tracking-wide text-ink placeholder:text-ink-muted"
        />
      </div>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {totalsSentence(counts)}
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-rule pt-6 sm:grid-cols-4">
        {[
          { term: "Read", value: counts.read },
          { term: "Valid", value: counts.valid },
          { term: "Not valid", value: counts.invalid },
          { term: "LLP", value: counts.llp },
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

      {readings.length === 0 ? (
        <EmptyState onFill={setText} />
      ) : (
        <Results readings={readings} />
      )}
    </section>
  );
}
