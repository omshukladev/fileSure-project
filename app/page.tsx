export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        FileSure
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-balance">
        CIN and LLPIN checker
      </h1>
      <p className="max-w-prose text-lg leading-relaxed text-muted-foreground">
        Paste a list of company or LLP identifiers, one per line, and read what
        each one means. The scaffold is in place. The checker arrives in the next
        slice.
      </p>
    </main>
  );
}
