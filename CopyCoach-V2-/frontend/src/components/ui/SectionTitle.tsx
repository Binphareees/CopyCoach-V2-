type SectionTitleProps = {
  title: string;
  description?: string;
};

export default function SectionTitle({
  title,
  description,
}: SectionTitleProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">

      <h2 className="text-3xl font-bold text-white md:text-5xl">
        {title}
      </h2>

      {description && (
        <p className="mt-5 text-lg leading-8 text-gray-300">
          {description}
        </p>
      )}

    </div>
  );
}