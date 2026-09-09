import Card from "../ui/Card";
import SectionTitle from "../ui/SectionTitle";
import { GraduationCap, Gauge, Library } from "lucide-react";

const points = [
  {
    icon: GraduationCap,
    title: "Teaches, never replaces",
    description:
      "You write the copy. The AI explains what works, why, and how to improve — so the skill stays with you.",
  },
  {
    icon: Gauge,
    title: "Feedback you can act on",
    description:
      "Every drill returns a 0–100 score with strengths, weaknesses, and line-by-line notes grounded in proven frameworks.",
  },
  {
    icon: Library,
    title: "Built for how you practice",
    description:
      "Keep drills, briefs, and client projects in a library of your own work, so every session builds on the last.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">

        <SectionTitle
          title="Why CopyCoach Is Different"
          description="Not a writing tool that generates for you — a coach that teaches you to write better."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">

          {points.map((point) => (
            <Card key={point.title} className="p-7">

              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface-elevated text-accent">
                <point.icon className="h-5 w-5" />
              </div>

              <h3 className="text-lg font-semibold tracking-tight text-text-primary">
                {point.title}
              </h3>

              <p className="mt-3 leading-7 text-text-secondary">
                {point.description}
              </p>

            </Card>
          ))}

        </div>

      </div>
    </section>
  );
}