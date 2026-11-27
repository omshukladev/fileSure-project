import type { Fault } from "../types";

export type Segment = {
  text: string;
  fault: boolean;
};

type Range = {
  start: number;
  end: number;
};

function toRanges(cleaned: string, faults: Fault[]): Range[] {
  const ranges: Range[] = [];

  for (const fault of faults) {
    const start = Math.max(0, Math.min(fault.start, cleaned.length));
    const end = Math.max(start, Math.min(fault.start + fault.length, cleaned.length));
    if (end > start) {
      ranges.push({ start, end });
    }
  }

  return ranges.sort((a, b) => a.start - b.start);
}

function merge(ranges: Range[]): Range[] {
  const merged: Range[] = [];

  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }

  return merged;
}

export function markSpans(cleaned: string, faults: Fault[]): Segment[] {
  const ranges = merge(toRanges(cleaned, faults));
  if (ranges.length === 0) {
    return cleaned.length === 0 ? [] : [{ text: cleaned, fault: false }];
  }

  const segments: Segment[] = [];
  let cursor = 0;

  for (const range of ranges) {
    if (range.start > cursor) {
      segments.push({ text: cleaned.slice(cursor, range.start), fault: false });
    }
    segments.push({ text: cleaned.slice(range.start, range.end), fault: true });
    cursor = range.end;
  }

  if (cursor < cleaned.length) {
    segments.push({ text: cleaned.slice(cursor), fault: false });
  }

  return segments;
}
