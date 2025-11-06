import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Policy Pulse — GAILP',
  description: 'Live snapshots of policy activity across regions.',
};

export default function PolicyPulsePage() {
  return (
    <div className="mx-auto max-w-7xl px-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Policy Pulse</h1>
        <p className="text-sm text-muted-foreground">Live snapshots of policy activity across regions.</p>
      </header>

      {/* Replace with real feed/cards when ready */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-lg border p-4">Card A</article>
        <article className="rounded-lg border p-4">Card B</article>
        <article className="rounded-lg border p-4">Card C</article>
      </section>
    </div>
  );
}
