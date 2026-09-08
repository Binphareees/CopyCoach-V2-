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

      <h2 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
        {title}
      </h2>

      {description && (
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
          {description}
        </p>
      )}

    </div>
  );
}
