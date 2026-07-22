import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarDays,
  Newspaper,
} from "lucide-react";
import Link from "next/link";

import { NewsAuthor } from "@/components/news/news-author";
import { NewsCard } from "@/components/news/news-card";
import { NewsCategoryBadge } from "@/components/news/news-category-badge";
import { PageHeader } from "@/components/ui/page-header";
import { formatGermanDate } from "@/lib/date";
import {
  getAuthorFunction,
  getPublishedNewsPosts,
} from "@/lib/news";

export const metadata: Metadata = {
  title: "Aktuelles",
  description:
    "Neuigkeiten, Projektberichte und Veranstaltungen der Historischen Schiene.",
};

export const dynamic = "force-dynamic";

export default async function AktuellesPage() {
  const posts = await getPublishedNewsPosts();

  const featuredPost =
    posts.find((post) => post.featured) ?? posts[0];

  const otherPosts = featuredPost
    ? posts.filter((post) => post.id !== featuredPost.id)
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Neuigkeiten"
        title="Aktuelles aus dem Verein"
        description="Berichte über unsere Projekte, Veranstaltungen und die Entwicklung der Historischen Schiene."
      />

      {posts.length === 0 ? (
        <section className="section-spacing">
          <div className="site-container">
            <div className="surface-card p-10 text-center">
              <Newspaper
                size={44}
                className="mx-auto text-accent-light"
              />

              <h2 className="mt-6 text-2xl font-bold text-content">
                Noch keine Beiträge vorhanden
              </h2>

              <p className="mt-4 text-muted">
                Hier erscheinen künftig Neuigkeiten der
                Historischen Schiene.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {featuredPost ? (
        <section className="section-spacing">
          <div className="site-container">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-light">
              Hervorgehobener Beitrag
            </p>

            <article className="mt-6 overflow-hidden rounded-3xl border border-accent-border bg-surface">
              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <div className="flex min-h-80 items-center justify-center bg-page-soft">
                  {featuredPost.imageUrl ? (
                    <img
                      src={featuredPost.imageUrl}
                      alt=""
                      className="h-full min-h-80 w-full object-cover"
                    />
                  ) : (
                    <Newspaper
                      size={96}
                      strokeWidth={1}
                      className="text-accent-light"
                    />
                  )}
                </div>

                <div className="flex flex-col justify-center p-8 sm:p-12">
                  <NewsCategoryBadge
                    category={featuredPost.category}
                  />

                  <h2 className="mt-6 text-3xl font-bold tracking-tight text-content sm:text-5xl">
                    {featuredPost.title}
                  </h2>

                  <p className="mt-6 text-lg leading-8 text-muted">
                    {featuredPost.excerpt}
                  </p>

                  <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-subtle">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={16} />
                      {formatGermanDate(
                        featuredPost.publishedAt,
                      )}
                    </span>

                    <NewsAuthor
                      displayName={
                        featuredPost.author.displayName
                      }
                      clubFunction={getAuthorFunction(
                        featuredPost.author,
                      )}
                    />
                  </div>

                  <Link
                    href={`/aktuelles/${featuredPost.slug}`}
                    className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-light"
                  >
                    Beitrag lesen
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {otherPosts.length > 0 ? (
        <section className="border-t border-line bg-page-soft">
          <div className="site-container section-spacing">
            <h2 className="text-3xl font-bold tracking-tight text-content">
              Weitere Meldungen
            </h2>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {otherPosts.map((post) => (
                <NewsCard
                  key={post.id}
                  post={{
                    ...post,
                    authorFunction: getAuthorFunction(
                      post.author,
                    ),
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}