import {
  NewsCategory,
  NewsStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const newsCategoryLabels: Record<NewsCategory, string> = {
  CLUB: "Verein",
  PROJECT: "Projekt",
  EVENT: "Veranstaltung",
  IMPORTANT: "Wichtig",
  PRESS: "Presse",
};

const authorInclude = {
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
            isPrimary: "desc" as const,
          },
          {
            displayOrder: "asc" as const,
          },
        ],
      },
    },
  },
};

export async function getPublishedNewsPosts() {
  return prisma.newsPost.findMany({
    where: {
      status: NewsStatus.PUBLISHED,
      publishedAt: {
        not: null,
        lte: new Date(),
      },
    },
    include: {
      author: {
        include: authorInclude,
      },
    },
    orderBy: [
      {
        featured: "desc",
      },
      {
        publishedAt: "desc",
      },
    ],
  });
}

export async function getLatestNewsPosts(limit = 3) {
  return prisma.newsPost.findMany({
    where: {
      status: NewsStatus.PUBLISHED,
      publishedAt: {
        not: null,
        lte: new Date(),
      },
    },
    include: {
      author: {
        include: authorInclude,
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: limit,
  });
}

export async function getNewsPostBySlug(slug: string) {
  return prisma.newsPost.findFirst({
    where: {
      slug,
      status: NewsStatus.PUBLISHED,
      publishedAt: {
        not: null,
        lte: new Date(),
      },
    },
    include: {
      author: {
        include: authorInclude,
      },
      publishedBy: true,
    },
  });
}

export function getAuthorFunction(
  author: Awaited<
    ReturnType<typeof getPublishedNewsPosts>
  >[number]["author"],
): string | null {
  return author.member?.functions[0]?.function.name ?? null;
}