import SectionTitle from "../ui/SectionTitle";
import { getServerT } from "@/i18n/server";

export default async function HowItWorks() {
  const { t } = await getServerT("landing");

  const steps = [
    {
      number: "01",
      title: t("howStep1Title"),
      description: t("howStep1Desc"),
    },
    {
      number: "02",
      title: t("howStep2Title"),
      description: t("howStep2Desc"),
    },
    {
      number: "03",
      title: t("howStep3Title"),
      description: t("howStep3Desc"),
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        <SectionTitle
          title={t("howTitle")}
          description={t("howSubtitle")}
        />

        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">

          {steps.map((step) => (
            <div key={step.number} className="border-t border-border pt-6">
              <p className="text-sm font-bold tracking-widest text-text-muted">
                {t("howStep", { number: step.number })}
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