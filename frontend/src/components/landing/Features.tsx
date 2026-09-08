import Card from "../ui/Card";
import SectionTitle from "../ui/SectionTitle";
import {
  PenLine,
  Bot,
  TrendingUp,
  Target,
  Flame,
  Trophy,
  type LucideIcon,
} from "lucide-react";

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: PenLine,
    title: "Practice Real Copywriting",
    description:
      "Write emails, ads, landing pages, headlines, and sales copy through realistic challenges.",
  },
  {
    icon: Bot,
    title: "AI Coaching Feedback",
    description:
      "Understand your mistakes with detailed explanations instead of simply receiving rewritten copy.",
  },
  {
    icon: TrendingUp,
    title: "Track Your Growth",
    description:
      "Monitor your progress, improve your scores, and build your copywriting skills over time.",
  },
  {
    icon: Target,
    title: "Learn Proven Frameworks",
    description:
      "Master AIDA, PAS, FAB, storytelling, and other professional copywriting methods.",
  },
  {
    icon: Flame,
    title: "Build Daily Habits",
    description:
      "Practice consistently with challenges, streaks, and personalized recommendations.",
  },
  {
    icon: Trophy,
    title: "Become Job Ready",
    description:
      "Develop practical skills you can use for freelance work, business, or marketing roles.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        <SectionTitle
          title="Everything You Need To Master Copywriting"
          description="A complete training system that helps you learn, practice, and improve like a professional copywriter."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => (
            <Card key={feature.title} className="group p-7">

              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent-hover shadow-accent-soft transition-transform duration-300 group-hover:-translate-y-0.5">
                <feature.icon className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-semibold tracking-tight text-text-primary">
                {feature.title}
              </h3>

              <p className="mt-3 leading-7 text-text-secondary">
                {feature.description}
              </p>

            </Card>
          ))}

        </div>

      </div>
    </section>
  );
}