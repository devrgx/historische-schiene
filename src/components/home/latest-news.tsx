import {
  ArrowRight,
  CalendarDays,
  Newspaper,
} from "lucide-react";
import Link from "next/link";

import { NewsAuthor } from "@/components/news/news-author";
import { NewsCategoryBadge } from "@/components/news/news-category-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatGermanDate } from "@/lib/date";
import {
  getAuthorFunction,
  getLatestNewsPosts,
} from "@/lib/news";

export async function LatestNews() {
  const posts = await getLatestNewsPosts(3);

  return (
    <section className="border-y border-line bg-page-soft">
      <div className="site-container section-spacing">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Neuigkeiten"
            title="Aktuelles aus dem Verein"
            description="Projektberichte, Vereinsmeldungen und Hinweise zu kommenden Veranstaltungen."
          />

          <Link
            href="/aktuelles"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-content transition hover:text-accent-light"
          >
            Alle Meldungen ansehen
            <ArrowRight size={17} />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-line bg-surface p-8 text-center">
            <Newspaper
              size={40}
              className="mx-auto text-accent-light"
            />

            <h3 className="mt-5 text-xl font-bold text-content">
              Noch keine Meldungen vorhanden
            </h3>

            <p className="mt-3 text-muted">
              Hier erscheinen künftig aktuelle Nachrichten der
              Historischen Schiene.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const authorFunction = getAuthorFunction(
                post.author,
              );

              return (
                <article
                  key={post.id}
                  className="group surface-card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-accent-border hover:bg-surface-hover"
                >
                  <div className="relative flex h-48 items-center justify-center overflow-hidden border-b border-line bg-page">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--accent-soft),transparent_65%)]" />

                        <Newspaper
                          size={54}
                          strokeWidth={1.2}
                          className="relative text-accent-light"
                        />
                      </>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <NewsCategoryBadge
                      category={post.category}
                    />

                    <h3 className="mt-5 text-2xl font-bold tracking-tight text-content">
                      {post.title}
                    </h3>

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
                          clubFunction={authorFunction}
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
            })}
          </div>
        )}
      </div>
    </section>
  );
}