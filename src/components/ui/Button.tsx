import Link from "next/link";
import { ReactNode } from "react";

type ButtonVariant = "primary" | "outline";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
}

const base =
  "inline-flex items-center justify-center min-h-[46px] px-6 text-xs font-medium uppercase tracking-[0.08em] transition-all duration-[420ms] cursor-pointer";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-green-dark)] text-white hover:bg-[#1d2e24]",
  outline:
    "bg-transparent border border-[rgba(50,45,38,0.25)] text-[var(--color-text-main)] hover:bg-[var(--color-green-dark)] hover:text-white hover:border-[var(--color-green-dark)]",
};

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
  onClick,
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
