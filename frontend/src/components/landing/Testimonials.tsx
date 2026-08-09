import Card from "../ui/Card";
import SectionTitle from "../ui/SectionTitle";

const testimonials = [
  {
    quote:
      "CopyCoach AI helped me understand why my copy was weak instead of just giving me another rewrite.",
    name: "Sarah Ahmed",
    role: "Beginner Copywriter",
  },
  {
    quote:
      "The feedback feels like having a personal mentor reviewing my work every day.",
    name: "Michael Johnson",
    role: "Freelance Marketer",
  },
  {
    quote:
      "I improved my headlines and emails because I finally understood the principles behind good copy.",
    name: "David Williams",
    role: "Content Creator",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">

        <SectionTitle
          title="Loved By People Learning Copywriting"
          description="Real improvement comes from feedback, practice, and consistency."
        />


        <div className="mt-16 grid gap-6 md:grid-cols-3">

          {testimonials.map((testimonial) => (
            <Card key={testimonial.name}>

              <p className="text-lg leading-8 text-gray-300">
                &quot;{testimonial.quote}&quot;
              </p>


              <div className="mt-6">

                <h3 className="font-bold text-white">
                  {testimonial.name}
                </h3>

                <p className="text-sm text-gray-400">
                  {testimonial.role}
                </p>

              </div>

            </Card>
          ))}

        </div>

      </div>
    </section>
  );
}