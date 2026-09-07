import Link from "next/link";
import { GradientButton } from "../ui/gradient-button";

export default function CTA() {
  return (
    <section className="py-24">

      <div className="mx-auto max-w-5xl px-6">

        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-8 py-16 text-center">

          {/* Glow */}
          <div className="absolute left-1/2 top-0 -z-0 h-40 w-40 -translate-x-1/2 rounded-full bg-accent/30 blur-3xl" />


          <div className="relative z-10">

            <h2 className="text-4xl font-bold text-text-primary md:text-5xl">
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
