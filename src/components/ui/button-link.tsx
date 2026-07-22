import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:ring-offset-2 focus-visible:ring-offset-page";

  const variantClasses = {
    primary:
      "bg-accent text-white shadow-lg shadow-black/20 hover:bg-accent-light",
    secondary:
      "border border-line-strong bg-white/5 text-content hover:border-accent-border hover:bg-accent-soft",
    ghost: "text-muted hover:bg-white/5 hover:text-content",
  };

  return (
    <Link
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}