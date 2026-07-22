import type { Metadata } from "next";
import {
  ArrowLeft,
  CalendarDays,
  Newspaper,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { NewsAuthor } from "@/components/news/news-author";
import { NewsCategoryBadge } from "@/components/news/news-category-badge";
import { formatGermanDate } from "@/lib/date";
import {
  getAuthorFunction,
  getNewsPostBySlug,
} from "@/lib/news";

type NewsDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);

  if (!post) {
    return {
      title: "Beitrag nicht gefunden",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function NewsDetailPage({
  params,
}: NewsDetailPageProps) {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const authorFunction = getAuthorFunction(
    post.author,
  );

  const paragraphs = post.content
    .split(/\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <>
      <section className="accent-gradient border-b border-line">
        <div className="site-container py-16 sm:py-24">
          <Link
            href="/aktuelles"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-content"
          >
            <ArrowLeft size={17} />
            Zurück zu Aktuelles
          </Link>

          <div className="mt-10">
            <NewsCategoryBadge
              category={post.category}
            />

            <h1 className="mt-6 max-w-5xl text-4xl font-bold tracking-tight text-content sm:text-6xl">
              {post.title}
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-muted">
              {post.excerpt}
            </p>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-subtle">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} />
                {formatGermanDate(post.publishedAt)}
              </span>

              <NewsAuthor
                displayName={post.author.displayName}
                clubFunction={authorFunction}
              />
            </div>
          </div>
        </div>
      </section>

      {post.imageUrl ? (
        <div className="site-container -mt-1">
          <img
            src={post.imageUrl}
            alt=""
            className="max-h-[36rem] w-full rounded-b-3xl object-cover"
          />
        </div>
      ) : null}

      <section className="section-spacing">
        <div className="site-container">
          <article className="mx-auto max-w-3xl">
            <div className="space-y-6 text-lg leading-9 text-muted">
              {paragraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph}`}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-14 rounded-2xl border border-line bg-surface p-6">
              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                  <Newspaper size={23} />
                </span>

                <div>
                  <p className="text-sm text-subtle">
                    Verfasst von
                  </p>

                  <p className="mt-1 font-semibold text-content">
                    {post.author.displayName}

                    {authorFunction ? (
                      <span className="font-normal text-muted">
                        {" "}
                        · {authorFunction}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}