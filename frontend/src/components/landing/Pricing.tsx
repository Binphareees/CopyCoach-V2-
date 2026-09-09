import Link from "next/link";
import { GradientButton } from "../ui/gradient-button";
import Card from "../ui/Card";
import SectionTitle from "../ui/SectionTitle";
import { getServerT } from "@/i18n/server";

export default async function Pricing() {
  const { t } = await getServerT("landing");

  const plans = [
    {
      name: t("pricingName1"),
      subtitle: t("pricingSub1"),
      price: "$0",
      quota: t("pricingQuotaDrills", { count: 3 }),
      description: t("pricingDesc1"),
      features: [
        t("pricingFeatureCount", { count: 3 }),
        t("pricingBasicScore"),
        t("pricingStandardFrameworks"),
        t("pricingGeneralSuggestions"),
      ],
    },
    {
      name: t("pricingName2"),
      subtitle: t("pricingSub2"),
      price: "$19",
      quota: t("pricingQuotaDrills", { count: 25 }),
      description: t("pricingDesc2"),
      features: [
        t("pricingFeatureCount", { count: 25 }),
        t("pricingBreakdown"),
        t("pricingRedPenAnnotations"),
        t("pricingBriefLibrary"),
      ],
    },
    {
      name: t("pricingName3"),
      subtitle: t("pricingSub3"),
      price: "$39",
      quota: t("pricingUnlimitedDrills"),
      description: t("pricingDesc3"),
      features: [
        t("pricingUnlimitedReviews"),
        t("pricingRewriteEngine"),
        t("pricingBriefGenerator"),
        t("pricingNicheSimulator"),
        t("pricingPortfolioBadge"),
      ],
      popular: true,
    },
    {
      name: t("pricingName4"),
      subtitle: t("pricingSub4"),
      price: "$119",
      quota: t("pricingUnlimitedSeats", { count: 5 }),
      description: t("pricingDesc4"),
      features: [
        t("pricingUnlimitedSeatsIncluded"),
        t("pricingTeamDashboard"),
        t("pricingCustomUploader"),
        t("pricingAgencyVoice"),
        t("pricingPriorityTickets"),
      ],
    },
  ];

  return (
    <section
      id="pricing"
      className="py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        <SectionTitle
          title={t("pricingTitle")}
          description={t("pricingSubtitle")}
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.popular
                  ? "border-accent/60 ring-1 ring-accent/30"
                  : ""
              }
            >

              {plan.popular && (
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {t("pricingMostPopular")}
                </div>
              )}


              <h3 className="text-xl font-bold text-text-primary flex items-center justify-between">
                <span>{plan.name}</span>
                <span className="text-xs font-normal text-text-muted">{plan.subtitle}</span>
              </h3>


              <div className="mt-4 text-3xl font-black text-text-primary">
                {plan.price}
                <span className="text-sm font-normal text-text-muted">
                  {t("pricingPerMonth")}
                </span>
              </div>

              <div className="mt-1 text-xs font-semibold text-accent">
                {plan.quota}
              </div>


              <p className="mt-3 text-xs text-text-secondary min-h-[36px]">
                {plan.description}
              </p>


              <ul className="mt-6 space-y-2.5 text-xs text-text-secondary">

                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-1.5">
                    <span className="text-success font-bold shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}

              </ul>


              <div className="mt-8">
                <GradientButton
                  asChild
                  variant={plan.popular ? "default" : "variant"}
                  className="w-full text-xs"
                >
                  <Link href="/auth/signup">
                    {plan.price === "$0" ? t("pricingStartFree") : t("pricingSubscribeTier")}
                  </Link>
                </GradientButton>
              </div>


            </Card>
          ))}

        </div>

      </div>
    </section>
  );
}