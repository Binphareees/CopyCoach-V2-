import Button from "../ui/Button";
import Badge from "../ui/Badge";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24">

      {/* Background Glow */}
      <div className="absolute left-1/2 top-20 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-[#5B5CEB]/30 blur-3xl" />

      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 text-center">

        {/* Badge */}
        <Badge variant="success">
          AI-powered copywriting coach
        </Badge>


        {/* Heading */}
        <h1 className="mt-8 max-w-5xl text-5xl font-extrabold leading-tight text-white md:text-7xl">

          Master Copywriting Skills

          <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-300 bg-clip-text text-transparent">
            With Your Personal AI Coach
          </span>

        </h1>


        {/* Description */}
        <p className="mt-8 max-w-3xl text-lg leading-8 text-gray-300 md:text-xl">

          Practice real marketing scenarios, get instant AI feedback,
          improve your writing skills, and learn how professional
          copywriters create content that converts.

        </p>


        {/* Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">

          <Button size="lg" href="/auth/signup">
  Start Practicing Free
</Button>


          <Button
  size="lg"
  variant="outline"
  href="#how-it-works"
>
  See How It Works
</Button>

        </div>


        {/* Trust Indicators */}
        <div className="mt-16 grid gap-8 text-center sm:grid-cols-3">

          <div>
            <p className="text-3xl font-bold text-white">
              10+
            </p>

            <p className="mt-2 text-sm text-gray-400">
              Copywriting Frameworks
            </p>
          </div>


          <div>
            <p className="text-3xl font-bold text-white">
              AI
            </p>

            <p className="mt-2 text-sm text-gray-400">
              Personal Feedback System
            </p>
          </div>


          <div>
            <p className="text-3xl font-bold text-white">
              24/7
            </p>

            <p className="mt-2 text-sm text-gray-400">
              Unlimited Practice
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}