import Card from "../ui/Card";
import SectionTitle from "../ui/SectionTitle";

const questions = [
  {
    question: "Is CopyCoach AI a writing generator?",
    answer:
      "No. CopyCoach AI is designed to teach you copywriting skills through feedback, explanations, and practice.",
  },
  {
    question: "Can beginners use CopyCoach AI?",
    answer:
      "Yes. The platform is designed for complete beginners and also helps experienced writers improve.",
  },
  {
    question: "What type of copy can I practice?",
    answer:
      "You can practice emails, advertisements, landing pages, headlines, sales copy, and more.",
  },
  {
    question: "How does the AI feedback work?",
    answer:
      "The AI analyzes your copy based on clarity, persuasion, structure, emotional impact, and proven copywriting principles.",
  },
  {
    question: "Will the AI write my copy for me?",
    answer:
      "The AI focuses on coaching you. It provides guidance and suggestions so you develop your own writing ability.",
  },
];

export default function FAQ() {
  return (
    <section
      id="faq"
      className="py-24"
    >
      <div className="mx-auto max-w-5xl px-6">

        <SectionTitle
          title="Frequently Asked Questions"
          description="Everything you need to know about learning copywriting with CopyCoach AI."
        />


        <div className="mt-16 space-y-5">

          {questions.map((item) => (
            <Card key={item.question}>

              <h3 className="text-xl font-bold text-white">
                {item.question}
              </h3>

              <p className="mt-3 leading-7 text-gray-300">
                {item.answer}
              </p>

            </Card>
          ))}

        </div>

      </div>
    </section>
  );
}