import {
  ArrowRight,
  CalendarDays,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";

import type {
  NewsCategory,
} from "@/generated/prisma/client";
import { formatGermanDate } from "@/lib/date";

import { NewsAuthor } from "./news-author";
import { NewsCategoryBadge } from "./news-category-badge";

type NewsCardProps = {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    imageUrl: string | null;
    category: NewsCategory;
    publishedAt: Date | null;
    author: {
      displayName: string;
    };
    authorFunction?: string | null;
  };
};

export function NewsCard({
  post,
}: NewsCardProps) {
  return (
    <article className="group surface-card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-accent-border hover:bg-surface-hover">
      <div className="relative flex h-52 items-center justify-center overflow-hidden border-b border-line bg-page-soft">
        {post.imageUrl ? (
          // Später durch next/image ersetzen, sobald echte Bilder vorliegen.
          <img
            src={post.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--accent-soft),transparent_60%)]" />

            <ImageIcon
              size={56}
              strokeWidth={1.2}
              className="relative text-accent-light"
            />
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <NewsCategoryBadge category={post.category} />

        <h2 className="mt-5 text-2xl font-bold tracking-tight text-content">
          {post.title}
        </h2>

        <p className="mt-4 flex-1 leading-7 text-muted">
          {post.excerpt}
        </p>

        <div className="mt-6 space-y-3 border-t border-line pt-5 text-sm text-subtle">
          <p className="flex items-center gap-2">
            <CalendarDays size={16} />
            {formatGermanDate(post.publishedAt)}
          </p>

          <p>
            <NewsAuthor
              displayName={post.author.displayName}
              clubFunction={post.authorFunction}
            />
          </p>
        </div>

        <Link
          href={`/aktuelles/${post.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-content transition hover:text-accent-light"
        >
          Weiterlesen
          <ArrowRight
            size={17}
            className="transition group-hover:translate-x-1"
          />
        </Link>
      </div>
    </article>
  );
}