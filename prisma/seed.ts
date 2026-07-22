import "dotenv/config";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import {
  NewsCategory,
  NewsStatus,
  PrismaClient,
  UserStatus,
} from "../src/generated/prisma/client";
import { getMariaDbConfig } from "../src/lib/database-config";

const adapter = new PrismaMariaDb(getMariaDbConfig());

const prisma = new PrismaClient({
  adapter,
});

const permissionDefinitions = [
  {
    key: "news.read.internal",
    name: "Interne Nachrichten lesen",
    description:
      "Erlaubt das Lesen interner Nachrichten im Mitgliederportal.",
  },
  {
    key: "news.create",
    name: "Nachrichten erstellen",
    description:
      "Erlaubt das Erstellen neuer Nachrichtenentwürfe.",
  },
  {
    key: "news.edit.own",
    name: "Eigene Nachrichten bearbeiten",
    description:
      "Erlaubt das Bearbeiten eigener Nachrichten.",
  },
  {
    key: "news.edit.all",
    name: "Alle Nachrichten bearbeiten",
    description:
      "Erlaubt das Bearbeiten aller Nachrichten.",
  },
  {
    key: "news.review",
    name: "Nachrichten prüfen",
    description:
      "Erlaubt das Prüfen eingereichter Nachrichten.",
  },
  {
    key: "news.publish",
    name: "Nachrichten veröffentlichen",
    description:
      "Erlaubt das Veröffentlichen freigegebener Nachrichten.",
  },
  {
    key: "news.archive",
    name: "Nachrichten archivieren",
    description:
      "Erlaubt das Archivieren von Nachrichten.",
  },
  {
    key: "members.read",
    name: "Mitglieder einsehen",
    description:
      "Erlaubt den Zugriff auf die Mitgliederübersicht.",
  },
  {
    key: "members.edit",
    name: "Mitglieder bearbeiten",
    description:
      "Erlaubt das Bearbeiten von Mitgliederdaten.",
  },
  {
    key: "roles.manage",
    name: "Rollen verwalten",
    description:
      "Erlaubt die Verwaltung technischer Rollen und Berechtigungen.",
  },
  {
    key: "settings.manage",
    name: "Einstellungen verwalten",
    description:
      "Erlaubt die Verwaltung allgemeiner Systemeinstellungen.",
  },
] as const;

const roleDefinitions = [
  {
    key: "SYSTEM",
    name: "System",
    description:
      "Interne Rolle für automatisch erstellte Inhalte.",
    isSystem: true,
    permissionKeys: [],
  },
  {
    key: "MEMBER",
    name: "Mitglied",
    description:
      "Standardrolle für registrierte Vereinsmitglieder.",
    isSystem: true,
    permissionKeys: [
      "news.read.internal",
    ],
  },
  {
    key: "EDITOR",
    name: "Redaktion",
    description:
      "Darf Nachrichten erstellen und eigene Beiträge bearbeiten.",
    isSystem: true,
    permissionKeys: [
      "news.read.internal",
      "news.create",
      "news.edit.own",
    ],
  },
  {
    key: "PUBLISHER",
    name: "Veröffentlichung",
    description:
      "Darf Nachrichten prüfen, bearbeiten und veröffentlichen.",
    isSystem: true,
    permissionKeys: [
      "news.read.internal",
      "news.create",
      "news.edit.own",
      "news.edit.all",
      "news.review",
      "news.publish",
      "news.archive",
    ],
  },
  {
    key: "ADMIN",
    name: "Administration",
    description:
      "Besitzt alle derzeit eingerichteten Berechtigungen.",
    isSystem: true,
    permissionKeys: permissionDefinitions.map(
      (permission) => permission.key,
    ),
  },
] as const;

const clubFunctionDefinitions = [
  {
    name: "Vorsitz",
    description:
      "Mitglied des vertretungsberechtigten Vorstands.",
  },
  {
    name: "Stellvertretender Vorsitz",
    description:
      "Stellvertretendes Mitglied des Vorstands.",
  },
  {
    name: "Kassenwart",
    description:
      "Verantwortlich für Finanzen und Buchhaltung.",
  },
  {
    name: "Schriftführung",
    description:
      "Verantwortlich für Protokolle und Dokumentation.",
  },
  {
    name: "Presse und Öffentlichkeitsarbeit",
    description:
      "Verantwortlich für öffentliche Kommunikation und Medienarbeit.",
  },
  {
    name: "Datenschutz",
    description:
      "Ansprechperson für Datenschutzangelegenheiten.",
  },
] as const;

async function seedPermissions(): Promise<void> {
  for (const definition of permissionDefinitions) {
    await prisma.permission.upsert({
      where: {
        key: definition.key,
      },
      update: {
        name: definition.name,
        description: definition.description,
      },
      create: {
        key: definition.key,
        name: definition.name,
        description: definition.description,
      },
    });
  }
}

async function seedRoles(): Promise<void> {
  for (const definition of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: {
        key: definition.key,
      },
      update: {
        name: definition.name,
        description: definition.description,
        isSystem: definition.isSystem,
      },
      create: {
        key: definition.key,
        name: definition.name,
        description: definition.description,
        isSystem: definition.isSystem,
      },
    });

    await prisma.rolePermission.deleteMany({
      where: {
        roleId: role.id,
      },
    });

    if (definition.permissionKeys.length === 0) {
      continue;
    }

    const permissions = await prisma.permission.findMany({
      where: {
        key: {
          in: [...definition.permissionKeys],
        },
      },
    });

    await prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId: role.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });
  }
}

async function seedClubFunctions(): Promise<void> {
  for (const definition of clubFunctionDefinitions) {
    await prisma.clubFunction.upsert({
      where: {
        name: definition.name,
      },
      update: {
        description: definition.description,
        isPublic: true,
      },
      create: {
        name: definition.name,
        description: definition.description,
        isPublic: true,
      },
    });
  }
}

async function seedSystemUser(): Promise<number> {
  const systemUser = await prisma.user.upsert({
    where: {
      email: "system@historische-schiene.local",
    },
    update: {
      displayName: "System",
      passwordHash: null,
      status: UserStatus.ACTIVE,
      isSystemUser: true,
    },
    create: {
      email: "system@historische-schiene.local",
      displayName: "System",
      passwordHash: null,
      status: UserStatus.ACTIVE,
      isSystemUser: true,
    },
  });

  const systemRole = await prisma.role.findUniqueOrThrow({
    where: {
      key: "SYSTEM",
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: systemUser.id,
        roleId: systemRole.id,
      },
    },
    update: {},
    create: {
      userId: systemUser.id,
      roleId: systemRole.id,
    },
  });

  return systemUser.id;
}

async function seedNewsPosts(
  systemUserId: number,
): Promise<void> {
  await prisma.newsPost.upsert({
    where: {
      slug: "willkommen-bei-der-historischen-schiene",
    },
    update: {
      title: "Willkommen bei der Historischen Schiene",
      excerpt:
        "Unsere neue Website befindet sich im Aufbau. Hier informieren wir künftig über den Verein, unsere Projekte und geplante Veranstaltungen.",
      content: [
        "Willkommen auf der neuen Website der Historischen Schiene.",
        "",
        "Unser Verein setzt sich für den Erhalt historischer Eisenbahnfahrzeuge, regionaler Eisenbahngeschichte und lebendiger Eisenbahnkultur ein.",
        "",
        "Die Website wird schrittweise erweitert. Künftig finden sich hier Neuigkeiten zu unseren Fahrzeugprojekten, Veranstaltungen, Sonderfahrten und Möglichkeiten zur Unterstützung des Vereins.",
      ].join("\n"),
      category: NewsCategory.CLUB,
      status: NewsStatus.PUBLISHED,
      featured: true,
      authorId: systemUserId,
      lastEditorId: systemUserId,
      publishedById: systemUserId,
    },
    create: {
      title: "Willkommen bei der Historischen Schiene",
      slug: "willkommen-bei-der-historischen-schiene",
      excerpt:
        "Unsere neue Website befindet sich im Aufbau. Hier informieren wir künftig über den Verein, unsere Projekte und geplante Veranstaltungen.",
      content: [
        "Willkommen auf der neuen Website der Historischen Schiene.",
        "",
        "Unser Verein setzt sich für den Erhalt historischer Eisenbahnfahrzeuge, regionaler Bahngeschichte und lebendiger Eisenbahnkultur ein.",
        "",
        "Die Website wird schrittweise erweitert. Künftig finden sich hier Neuigkeiten zu unseren Fahrzeugprojekten, Veranstaltungen, Sonderfahrten und Möglichkeiten zur Unterstützung des Vereins.",
      ].join("\n"),
      category: NewsCategory.CLUB,
      status: NewsStatus.PUBLISHED,
      featured: true,
      authorId: systemUserId,
      lastEditorId: systemUserId,
      publishedById: systemUserId,
      publishedAt: new Date(),
    },
  });

  await prisma.newsPost.upsert({
    where: {
      slug: "unsere-ersten-projektziele",
    },
    update: {
      title: "Unsere ersten Projektziele",
      excerpt:
        "Von der Baureihe 629 bis zu einer langfristigen eigenen Infrastruktur: Wir stellen unsere geplanten Projekte vor.",
      content: [
        "Die Historische Schiene verfolgt mehrere Projekte mit unterschiedlicher Priorität.",
        "",
        "Unser Kernprojekt ist die mögliche Erhaltung der Baureihe 629 „Anna & Maria“. Weitere Ziele sind ein historischer Zugverband aus einer Baureihe 218 und drei IC-Wagen sowie langfristig die Erhaltung einer Baureihe 120.",
        "",
        "In weiter Zukunft möchten wir außerdem eine geeignete Abstell- und Restaurierungsanlage finden oder aufbauen.",
        "",
        "Bei allen dargestellten Vorhaben handelt es sich zunächst um Projektziele. Ihre Umsetzung hängt insbesondere von Finanzierung, Verfügbarkeit, Fahrzeugzustand und geeigneter Infrastruktur ab.",
      ].join("\n"),
      category: NewsCategory.PROJECT,
      status: NewsStatus.PUBLISHED,
      featured: false,
      authorId: systemUserId,
      lastEditorId: systemUserId,
      publishedById: systemUserId,
    },
    create: {
      title: "Unsere ersten Projektziele",
      slug: "unsere-ersten-projektziele",
      excerpt:
        "Von der Baureihe 629 bis zu einer langfristigen eigenen Infrastruktur: Wir stellen unsere geplanten Projekte vor.",
      content: [
        "Die Historische Schiene verfolgt mehrere Projekte mit unterschiedlicher Priorität.",
        "",
        "Unser Kernprojekt ist die mögliche Erhaltung der Baureihe 629 „Anna & Maria“. Weitere Ziele sind ein historischer Zugverband aus einer Baureihe 218 und drei IC-Wagen sowie langfristig die Erhaltung einer Baureihe 120.",
        "",
        "In weiter Zukunft möchten wir außerdem eine geeignete Abstell- und Restaurierungsanlage finden oder aufbauen.",
        "",
        "Bei allen dargestellten Vorhaben handelt es sich zunächst um Projektziele. Ihre Umsetzung hängt insbesondere von Finanzierung, Verfügbarkeit, Fahrzeugzustand und geeigneter Infrastruktur ab.",
      ].join("\n"),
      category: NewsCategory.PROJECT,
      status: NewsStatus.PUBLISHED,
      featured: false,
      authorId: systemUserId,
      lastEditorId: systemUserId,
      publishedById: systemUserId,
      publishedAt: new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ),
    },
  });
}

async function main(): Promise<void> {
  console.log("Starte Datenbank-Seed …");

  await seedPermissions();
  console.log("Berechtigungen erstellt.");

  await seedRoles();
  console.log("Rollen erstellt.");

  await seedClubFunctions();
  console.log("Vereinsfunktionen erstellt.");

  const systemUserId = await seedSystemUser();
  console.log("Systembenutzer erstellt.");

  await seedNewsPosts(systemUserId);
  console.log("Testbeiträge erstellt.");

  console.log("Datenbank-Seed erfolgreich abgeschlossen.");
}

main()
  .catch((error: unknown) => {
    console.error("Datenbank-Seed fehlgeschlagen:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });