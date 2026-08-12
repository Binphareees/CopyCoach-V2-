import Button from "../ui/Button";
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
                  ? "border-[#5B5CEB] shadow-xl shadow-indigo-500/10"
                  : ""
              }
            >

              {plan.popular && (
                <div className="mb-4 text-xs font-bold tracking-wider text-[#7CFFB2] uppercase">
                  MOST POPULAR
                </div>
              )}


              <h3 className="text-xl font-bold text-white flex items-center justify-between">
                <span>{plan.name}</span>
                <span className="text-xs font-normal text-gray-400">{plan.subtitle}</span>
              </h3>


              <div className="mt-4 text-3xl font-black text-white">
                {plan.price}
                <span className="text-sm font-normal text-gray-400">
                  /month
                </span>
              </div>

              <div className="mt-1 text-xs font-semibold text-cyan-400">
                {plan.quota}
              </div>


              <p className="mt-3 text-xs text-gray-300 min-h-[36px]">
                {plan.description}
              </p>


              <ul className="mt-6 space-y-2.5 text-xs text-gray-300">

                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}

              </ul>


              <div className="mt-8">
                <Button
                  variant={
                    plan.popular
                      ? "primary"
                      : "outline"
                  }
                  className="w-full text-xs"
                  href="/auth/signup"
                >
                  {plan.price === "$0" ? "Start Free" : "Subscribe Tier"}
                </Button>
              </div>


            </Card>
          ))}

        </div>

      </div>
    </section>
  );
}