import Link from "next/link";
import { GradientButton } from "../ui/gradient-button";
import Badge from "../ui/Badge";

const verdictRows = [
  { label: "Hook", width: "86%" },
  { label: "Clarity", width: "78%" },
  { label: "Persuasion", width: "72%" },
  { label: "Call to Action", width: "64%" },
];

export default function Hero() {
  return (
    <section className="overflow-hidden pt-36 pb-24 md:pt-44 md:pb-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <Badge variant="primary" className="animate-fade-up">
            AI-powered copywriting coach
          </Badge>

          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl md:text-6xl">
            Master copywriting.
            <span className="block text-accent">With your personal AI coach.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-8 text-text-secondary lg:mx-0">
            Practice on real marketing scenarios, receive instant feedback
            on everything you write, and understand exactly why professional
            copy works.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
            <GradientButton asChild>
              <Link href="/auth/signup">Start Practicing Free</Link>
            </GradientButton>

            <GradientButton asChild variant="variant">
              <Link href="#how-it-works">See How It Works</Link>
            </GradientButton>
          </div>

          <dl className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border text-center sm:grid-cols-3 sm:text-left">
            <div className="bg-surface px-6 py-6">
              <dt className="order-2 mt-1 text-sm text-text-muted">Point AI review score</dt>
              <dd className="order-1 text-3xl font-bold tracking-tight text-text-primary">100</dd>
            </div>

            <div className="bg-surface px-6 py-6">
              <dt className="order-2 mt-1 text-sm text-text-muted">Core copy frameworks</dt>
              <dd className="order-1 text-3xl font-bold tracking-tight text-text-primary">5</dd>
            </div>

            <div className="bg-surface px-6 py-6">
              <dt className="order-2 mt-1 text-sm text-text-muted">AI-assisted support</dt>
              <dd className="order-1 text-3xl font-bold tracking-tight text-text-primary">24/7</dd>
            </div>
          </dl>
        </div>

        {/* Product preview */}
        <div
          role="img"
          aria-label="Example of a CopyCoach review showing an overall score of 82 out of 100 with breakdowns for Hook, Clarity, Persuasion, and Call to Action"
          className="mx-auto w-full max-w-md"
        >
          <div className="rounded-2xl border border-border bg-surface shadow-elevated">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <p className="text-xs font-semibold text-text-secondary">CopyCoach review</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-bold text-accent">
                Good copy
              </span>
            </div>

            <div className="px-6 py-6">
              <div className="flex items-end justify-between">
                <p className="text-6xl font-bold leading-none tracking-tight text-text-primary">82</p>
                <p className="text-sm font-medium text-text-muted">/ 100</p>
              </div>

              <div aria-hidden="true" className="mt-8 space-y-4">
                {verdictRows.map((row) => (
                  <div key={row.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span className="font-medium">{row.label}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: row.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border px-6 py-4">
              <p className="text-xs leading-6 text-text-muted">
                Every score comes with line-by-line notes on what works and what to improve.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}