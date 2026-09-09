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

      <h2 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-text-primary md:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-text-secondary md:text-lg md:leading-8">
          {description}
        </p>
      )}

    </div>
  );
}
