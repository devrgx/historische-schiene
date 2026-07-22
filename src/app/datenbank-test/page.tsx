import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DatenbankTestPage() {
  const posts = await prisma.newsPost.findMany({
    include: {
      author: {
        include: {
          member: {
            include: {
              functions: {
                include: {
                  function: true,
                },
                where: {
                  OR: [
                    {
                      validUntil: null,
                    },
                    {
                      validUntil: {
                        gte: new Date(),
                      },
                    },
                  ],
                },
                orderBy: [
                  {
                    isPrimary: "desc",
                  },
                  {
                    displayOrder: "asc",
                  },
                ],
              },
            },
          },
        },
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  return (
    <section className="section-spacing">
      <div className="site-container">
        <h1 className="text-4xl font-bold text-content">
          Datenbanktest
        </h1>

        <p className="mt-4 text-muted">
          Gefundene Beiträge: {posts.length}
        </p>

        <div className="mt-10 space-y-5">
          {posts.map((post) => {
            const primaryFunction =
              post.author.member?.functions[0]?.function.name;

            return (
              <article
                key={post.id}
                className="surface-card p-6"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-accent-light">
                  {post.category}
                </p>

                <h2 className="mt-3 text-2xl font-bold text-content">
                  {post.title}
                </h2>

                <p className="mt-3 leading-7 text-muted">
                  {post.excerpt}
                </p>

                <p className="mt-5 text-sm text-subtle">
                  Autor:{" "}
                  <span className="font-medium text-content">
                    {post.author.displayName}
                  </span>

                  {primaryFunction ? (
                    <> · {primaryFunction}</>
                  ) : null}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}