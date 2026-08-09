import SectionTitle from "../ui/SectionTitle";
import Card from "../ui/Card";

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


        <div className="mt-16 grid gap-6 md:grid-cols-3">

          {steps.map((step) => (
            <Card key={step.number}>

              <div className="mb-6 text-5xl font-bold text-[#5B5CEB]">
                {step.number}
              </div>


              <h3 className="text-2xl font-bold text-white">
                {step.title}
              </h3>


              <p className="mt-4 leading-7 text-gray-300">
                {step.description}
              </p>

            </Card>
          ))}

        </div>

      </div>
    </section>
  );
}