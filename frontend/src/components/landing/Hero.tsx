import Link from "next/link";
import { GradientButton } from "../ui/gradient-button";
import Badge from "../ui/Badge";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24">

      {/* Background Glow */}
      <div className="absolute left-1/2 top-20 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />

      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 text-center">

        {/* Badge */}
        <Badge variant="success">
          AI-powered copywriting coach
        </Badge>


        {/* Heading */}
        <h1 className="mt-8 max-w-5xl text-5xl font-extrabold leading-tight text-text-primary md:text-7xl">

          Master Copywriting Skills

          <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-300 bg-clip-text text-transparent">
            With Your Personal AI Coach
          </span>

        </h1>


        {/* Description */}
        <p className="mt-8 max-w-3xl text-lg leading-8 text-text-secondary md:text-xl">

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
        <div className="mt-16 grid gap-8 text-center sm:grid-cols-3">

          <div>
            <p className="text-3xl font-bold text-text-primary">
              10+
            </p>

            <p className="mt-2 text-sm text-text-muted">
              Copywriting Frameworks
            </p>
          </div>


          <div>
            <p className="text-3xl font-bold text-text-primary">
              AI
            </p>

            <p className="mt-2 text-sm text-text-muted">
              Personal Feedback System
            </p>
          </div>


          <div>
            <p className="text-3xl font-bold text-text-primary">
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
