type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
}: PageHeaderProps) {
  return (
    <section className="accent-gradient border-b border-line">
      <div className="site-container py-20 sm:py-28">
        {eyebrow ? (
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-accent-light">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-content sm:text-5xl lg:text-6xl">
          {title}
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
          {description}
        </p>
      </div>
    </section>
  );
}