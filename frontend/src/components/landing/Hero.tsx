import Link from "next/link";
import { GradientButton } from "../ui/gradient-button";
import Badge from "../ui/Badge";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-28">
      {/* Layered Ambient Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-8 h-[30rem] w-[56rem] max-w-none -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
        <div className="absolute -right-32 top-40 h-96 w-96 rounded-full bg-accent-deep/10 blur-[110px]" />
        <div className="absolute -left-40 top-64 h-96 w-96 rounded-full bg-[#6d5eff]/10 blur-[110px]" />
        <div className="absolute bottom-0 left-1/2 h-40 w-[40rem] max-w-none -translate-x-1/2 bg-accent/10 blur-[100px]" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 text-center">

        {/* Badge */}
        <Badge variant="primary" className="animate-fade-up">
          AI-powered copywriting coach
        </Badge>

        {/* Heading */}
        <h1 className="mt-8 max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight text-text-primary md:text-7xl">
          Master Copywriting Skills
          <span className="block bg-gradient-to-r from-[#e8eeff] via-accent-hover to-[#a08cff] bg-clip-text text-transparent">
            With Your Personal AI Coach
          </span>
        </h1>

        {/* Description */}
        <p className="mt-8 max-w-2xl text-lg leading-8 text-text-secondary md:text-xl">
          Practice real marketing scenarios, get instant AI feedback,
          improve your writing skills, and learn how professional
          copywriters create content that converts.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <GradientButton asChild>
            <Link href="/auth/signup">Start Practicing Free</Link>
          </GradientButton>

          <GradientButton asChild variant="variant">
            <Link href="#how-it-works">See How It Works</Link>
          </GradientButton>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid w-full max-w-2xl gap-px overflow-hidden rounded-2xl border border-glass-border-subtle bg-glass-bg-deep text-center backdrop-blur-glass sm:grid-cols-3 sm:gap-px">
          <div className="bg-glass-bg px-6 py-6">
            <p className="text-3xl font-bold tracking-tight text-text-primary">
              10+
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Copywriting Frameworks
            </p>
          </div>

          <div className="bg-glass-bg px-6 py-6">
            <p className="text-3xl font-bold tracking-tight text-text-primary">
              AI
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Personal Feedback System
            </p>
          </div>

          <div className="bg-glass-bg px-6 py-6">
            <p className="text-3xl font-bold tracking-tight text-text-primary">
              24/7
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Unlimited Practice
            </p>
          </div>
        </div>

      </div>

    </section>
  );
}