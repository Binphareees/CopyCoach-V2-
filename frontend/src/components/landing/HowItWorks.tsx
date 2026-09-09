import SectionTitle from "../ui/SectionTitle";

const steps = [
  {
    number: "01",
    title: "Write Your Copy",
    description:
      "Choose a challenge and write your own headline, email, advertisement, or sales message.",
  },
  {
    number: "02",
    title: "Receive AI Coaching",
    description:
      "Your AI coach analyzes your work and explains your strengths, weaknesses, and opportunities.",
  },
  {
    number: "03",
    title: "Improve & Level Up",
    description:
      "Apply feedback, rewrite your copy, increase your score, and build professional skills.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        <SectionTitle
          title="How CopyCoach AI Works"
          description="A simple learning loop designed to turn beginners into confident copywriters."
        />


        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">

          {steps.map((step) => (
            <div key={step.number} className="border-t border-border pt-6">
              <p className="text-sm font-bold tracking-widest text-text-muted">
                Step {step.number}
              </p>

              <h3 className="mt-3 text-xl font-semibold tracking-tight text-text-primary">
                {step.title}
              </h3>

              <p className="mt-3 leading-7 text-text-secondary">
                {step.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
