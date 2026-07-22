import type { NewsCategory } from "@/generated/prisma/client";
import { newsCategoryLabels } from "@/lib/news";

type NewsCategoryBadgeProps = {
  category: NewsCategory;
};

export function NewsCategoryBadge({
  category,
}: NewsCategoryBadgeProps) {
  return (
    <span className="inline-flex rounded-full border border-accent-border bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent-light">
      {newsCategoryLabels[category]}
    </span>
  );
}