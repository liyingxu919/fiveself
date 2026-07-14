interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`text-center mb-16 ${className}`}>
      {subtitle && (
        <p className="eyebrow mb-4">{subtitle}</p>
      )}
      <h2 className="mb-4">{title}</h2>
      <div className="mx-auto mt-6 h-px w-12 bg-[var(--color-border)]" />
    </div>
  );
}
