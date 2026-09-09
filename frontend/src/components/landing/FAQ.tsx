import SectionTitle from "../ui/SectionTitle";
import { getServerT } from "@/i18n/server";

export default async function FAQ() {
  const { t } = await getServerT("landing");

  const questions = [
    {
      question: t("faqQ1"),
      answer: t("faqA1"),
    },
    {
      question: t("faqQ2"),
      answer: t("faqA2"),
    },
    {
      question: t("faqQ3"),
      answer: t("faqA3"),
    },
    {
      question: t("faqQ4"),
      answer: t("faqA4"),
    },
    {
      question: t("faqQ5"),
      answer: t("faqA5"),
    },
  ];

  return (
    <section
      id="faq"
      className="py-24"
    >
      <div className="mx-auto max-w-5xl px-6">

        <SectionTitle
          title={t("faqTitle")}
          description={t("faqSubtitle")}
        />

        <div className="mt-16 max-w-3xl mx-auto divide-y divide-border rounded-2xl border border-border bg-surface">

          {questions.map((item) => (
            <div key={item.question} className="px-6 py-6 sm:px-8">

              <h3 className="text-lg font-semibold tracking-tight text-text-primary">
                {item.question}
              </h3>

              <p className="mt-2 leading-7 text-text-secondary">
                {item.answer}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}