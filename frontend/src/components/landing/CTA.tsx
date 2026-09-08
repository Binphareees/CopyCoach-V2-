import Link from "next/link";
import { GradientButton } from "../ui/gradient-button";

export default function CTA() {
  return (
    <section className="py-24">

      <div className="mx-auto max-w-5xl px-6">

        <div className="relative glass-panel-elevated overflow-hidden px-8 py-16 text-center">

          {/* Glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-accent/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-accent-deep/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-[#6d5eff]/15 blur-[100px]" />

          <div className="relative z-10">

            <h2 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
              Ready To Become A Better Copywriter?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
              Start practicing today and turn every piece of copy you write
              into an opportunity to improve your skills.
            </p>

            <div className="mt-10 flex justify-center">

              <GradientButton asChild>
                <Link href="/auth/signup">Start Learning Free</Link>
              </GradientButton>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
