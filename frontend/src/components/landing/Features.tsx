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
import { getServerT } from "@/i18n/server";

export default async function Features() {
  const { t } = await getServerT("landing");

  const features: { icon: LucideIcon; title: string; description: string }[] = [
    {
      icon: PenLine,
      title: t("featuresPracticeTitle"),
      description: t("featuresPracticeDesc"),
    },
    {
      icon: Bot,
      title: t("featuresAiFeedbackTitle"),
      description: t("featuresAiFeedbackDesc"),
    },
    {
      icon: TrendingUp,
      title: t("featuresTrackTitle"),
      description: t("featuresTrackDesc"),
    },
    {
      icon: Target,
      title: t("featuresProvenTitle"),
      description: t("featuresProvenDesc"),
    },
    {
      icon: Flame,
      title: t("featuresHabitsTitle"),
      description: t("featuresHabitsDesc"),
    },
    {
      icon: Trophy,
      title: t("featuresJobTitle"),
      description: t("featuresJobDesc"),
    },
  ];

  return (
    <section
      id="features"
      className="py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        <SectionTitle
          title={t("featuresTitle")}
          description={t("featuresSubtitle")}
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group p-7 transition-colors hover:border-border-strong"
            >

              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface-elevated text-accent">
                <feature.icon className="h-5 w-5" />
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