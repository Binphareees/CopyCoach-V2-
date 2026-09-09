import Card from "../ui/Card";
import SectionTitle from "../ui/SectionTitle";
import { GraduationCap, Gauge, Library } from "lucide-react";
import { getServerT } from "@/i18n/server";

export default async function Testimonials() {
  const { t } = await getServerT("landing");

  const points = [
    {
      icon: GraduationCap,
      title: t("testiTeachesTitle"),
      description: t("testiTeachesDesc"),
    },
    {
      icon: Gauge,
      title: t("testiFeedbackTitle"),
      description: t("testiFeedbackDesc"),
    },
    {
      icon: Library,
      title: t("testiPracticeTitle"),
      description: t("testiPracticeDesc"),
    },
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">

        <SectionTitle
          title={t("testiTitle")}
          description={t("testiSubtitle")}
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