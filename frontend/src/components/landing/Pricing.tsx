import Link from "next/link";
import { GradientButton } from "../ui/gradient-button";
import Card from "../ui/Card";
import SectionTitle from "../ui/SectionTitle";

const plans = [
  {
    name: "The Spark",
    subtitle: "(Free)",
    price: "$0",
    quota: "3 drills / mo",
    description: "Start learning the fundamentals of copywriting.",
    features: [
      "3 drills per month",
      "Basic 1-10 overall score",
      "Standard AIDA / PAS frameworks",
      "General improvement suggestions",
    ],
  },
  {
    name: "The Apprentice",
    subtitle: "(Starter)",
    price: "$19",
    quota: "25 drills / mo",
    description: "For developing copywriters aiming for structured practice.",
    features: [
      "25 drills per month",
      "Hook / Clarity / CTA breakdown",
      "Line-by-line red-pen annotations",
      "50+ static client brief library",
    ],
  },
  {
    name: "The Pro",
    subtitle: "(Popular)",
    price: "$39",
    quota: "Unlimited drills",
    description: "For serious copywriters wanting accelerated mastery.",
    features: [
      "Unlimited AI drills & reviews",
      "Real-time rewrite engine",
      "Dynamic client brief generator",
      "Niche angle simulator",
      "Verified portfolio badge",
    ],
    popular: true,
  },
  {
    name: "The Studio",
    subtitle: "(Agency)",
    price: "$119",
    quota: "Unlimited (5 seats)",
    description: "For teams, agencies, and high-volume copy teams.",
    features: [
      "Unlimited drills (5 seats included)",
      "Team progress dashboard",
      "Custom brief uploader",
      "Agency brand voice calibration",
      "Priority ticket handling",
    ],
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        <SectionTitle
          title="Subscription Tiers & Pricing"
          description="Strategic plans centered on drill quotas, critique depth, and agency capabilities."
        />


        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.popular
                  ? "border-accent shadow-xl shadow-accent/10"
                  : ""
              }
            >

              {plan.popular && (
                <div className="mb-4 text-xs font-bold tracking-wider text-success uppercase">
                  MOST POPULAR
                </div>
              )}


              <h3 className="text-xl font-bold text-text-primary flex items-center justify-between">
                <span>{plan.name}</span>
                <span className="text-xs font-normal text-text-muted">{plan.subtitle}</span>
              </h3>


              <div className="mt-4 text-3xl font-black text-text-primary">
                {plan.price}
                <span className="text-sm font-normal text-text-muted">
                  /month
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
                    {plan.price === "$0" ? "Start Free" : "Subscribe Tier"}
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
