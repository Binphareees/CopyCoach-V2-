import Card from "../ui/Card";
import SectionTitle from "../ui/SectionTitle";

const features = [
  {
    icon: "✍️",
    title: "Practice Real Copywriting",
    description:
      "Write emails, ads, landing pages, headlines, and sales copy through realistic challenges.",
  },
  {
    icon: "🤖",
    title: "AI Coaching Feedback",
    description:
      "Understand your mistakes with detailed explanations instead of simply receiving rewritten copy.",
  },
  {
    icon: "📈",
    title: "Track Your Growth",
    description:
      "Monitor your progress, improve your scores, and build your copywriting skills over time.",
  },
  {
    icon: "🎯",
    title: "Learn Proven Frameworks",
    description:
      "Master AIDA, PAS, FAB, storytelling, and other professional copywriting methods.",
  },
  {
    icon: "🔥",
    title: "Build Daily Habits",
    description:
      "Practice consistently with challenges, streaks, and personalized recommendations.",
  },
  {
    icon: "🏆",
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
            <Card key={feature.title}>

              <div className="mb-5 text-4xl">
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-white">
                {feature.title}
              </h3>

              <p className="mt-3 leading-7 text-gray-300">
                {feature.description}
              </p>

            </Card>
          ))}

        </div>

      </div>
    </section>
  );
}