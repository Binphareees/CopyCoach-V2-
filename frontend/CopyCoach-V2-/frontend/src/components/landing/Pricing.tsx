import Button from "../ui/Button";
import Card from "../ui/Card";
import SectionTitle from "../ui/SectionTitle";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Start learning the fundamentals of copywriting.",
    features: [
      "Daily practice challenges",
      "Basic AI feedback",
      "Copywriting frameworks",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    description: "For serious learners who want faster improvement.",
    features: [
      "Advanced AI coaching",
      "Unlimited copy reviews",
      "Progress tracking",
      "Advanced frameworks",
    ],
    popular: true,
  },
  {
    name: "Master",
    price: "$49",
    description: "For professionals and freelancers.",
    features: [
      "Everything in Pro",
      "Deep copy analysis",
      "Portfolio feedback",
      "Priority features",
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
          title="Simple Pricing For Every Stage"
          description="Start free and upgrade when you are ready to accelerate your copywriting skills."
        />


        <div className="mt-16 grid gap-6 md:grid-cols-3">

          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.popular
                  ? "border-[#5B5CEB]"
                  : ""
              }
            >

              {plan.popular && (
                <div className="mb-4 text-sm font-semibold text-[#7CFFB2]">
                  MOST POPULAR
                </div>
              )}


              <h3 className="text-2xl font-bold text-white">
                {plan.name}
              </h3>


              <div className="mt-4 text-4xl font-bold text-white">
                {plan.price}
                <span className="text-lg text-gray-400">
                  /month
                </span>
              </div>


              <p className="mt-4 text-gray-300">
                {plan.description}
              </p>


              <ul className="mt-6 space-y-3 text-gray-300">

                {plan.features.map((feature) => (
                  <li key={feature}>
                    ✓ {feature}
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
                  className="w-full"
                >
                  Choose Plan
                </Button>
              </div>


            </Card>
          ))}

        </div>

      </div>
    </section>
  );
}