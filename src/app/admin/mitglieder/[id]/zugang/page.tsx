import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  Clock3,
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { sendMail } from "@/lib/mail";
import { createPortalActivationMail } from "@/lib/mail-templates/portal-activation";
import { generatePortalActivationCode } from "@/lib/portal-activation";
import { prisma } from "@/lib/prisma";

import {
  AccessManagement,
  type AccessActionState,
} from "./access-management";

type AdminMemberAccessPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const userStatusConfig = {
  PENDING: {
    label: "Nicht aktiviert",
    description:
      "Das Konto wurde vorbereitet, aber noch nicht durch das Mitglied aktiviert.",
    className:
      "border-amber-400/30 bg-amber-400/10 text-amber-200",
  },
  ACTIVE: {
    label: "Aktiv",
    description:
      "Das Mitglied kann sich im Portal anmelden.",
    className:
      "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  },
  BLOCKED: {
    label: "Gesperrt",
    description:
      "Das Benutzerkonto ist derzeit gesperrt.",
    className:
      "border-red-400/30 bg-red-400/10 text-red-200",
  },
  DISABLED: {
    label: "Deaktiviert",
    description:
      "Das Benutzerkonto wurde dauerhaft deaktiviert.",
    className:
      "border-line bg-page-soft text-subtle",
  },
} as const;

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: AdminMemberAccessPageProps): Promise<Metadata> {
  const { id } = await params;
  const memberId = Number(id);

  if (!Number.isInteger(memberId)) {
    return {
      title: "Portalzugang",
    };
  }

  const member = await prisma.member.findUnique({
    where: {
      id: memberId,
    },
    select: {
      firstName: true,
      lastName: true,
    },
  });

  if (!member) {
    return {
      title: "Portalzugang",
    };
  }

  return {
    title: `Portalzugang · ${member.firstName} ${member.lastName}`,
  };
}

export default async function AdminMemberAccessPage({
  params,
}: AdminMemberAccessPageProps) {
  const { id } = await params;
  const memberId = Number(id);

  if (!Number.isInteger(memberId)) {
    notFound();
  }

  await requireAdministrator();

  const member = await prisma.member.findUnique({
    where: {
      id: memberId,
    },
    include: {
      user: {
        include: {
          roles: {
            include: {
              role: {
                select: {
                  key: true,
                  name: true,
                },
              },
            },
          },

          activationTokens: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!member) {
    notFound();
  }

  async function prepareAccessAction(
    previousState: AccessActionState,
    formData: FormData,
  ): Promise<AccessActionState> {
    "use server";

    void previousState;
    void formData;

    const administrator =
      await requireAdministrator();

    const currentMember =
      await prisma.member.findUnique({
        where: {
          id: memberId,
        },
        include: {
          user: true,
        },
      });

    if (!currentMember) {
      return {
        status: "ERROR",
        message:
          "Das Mitglied wurde nicht gefunden.",
      };
    }

    const email =
      currentMember.email
        ?.trim()
        .toLowerCase();

    if (!email) {
      return {
        status: "ERROR",
        message:
          "Für dieses Mitglied ist keine E-Mail-Adresse hinterlegt. Bitte ergänze zuerst die Mitgliedsdaten.",
      };
    }

    const generatedCode =
      generatePortalActivationCode();

    try {
      await prisma.$transaction(
        async (transaction) => {
          const memberRole =
            await transaction.role.upsert({
              where: {
                key: "MEMBER",
              },
              update: {
                name: "Mitglied",
                description:
                  "Standardrolle für Mitglieder mit Portalzugang.",
              },
              create: {
                key: "MEMBER",
                name: "Mitglied",
                description:
                  "Standardrolle für Mitglieder mit Portalzugang.",
                isSystem: true,
              },
            });

          let userId =
            currentMember.userId;

          if (!userId) {
            const existingUser =
              await transaction.user.findUnique({
                where: {
                  email,
                },
                include: {
                  member: {
                    select: {
                      id: true,
                    },
                  },
                },
              });

            if (
              existingUser?.member &&
              existingUser.member.id !==
                currentMember.id
            ) {
              throw new Error(
                "EMAIL_ALREADY_LINKED",
              );
            }

            if (existingUser) {
              userId = existingUser.id;

              await transaction.member.update({
                where: {
                  id: currentMember.id,
                },
                data: {
                  userId,
                },
              });

              if (
                existingUser.status ===
                "DISABLED"
              ) {
                await transaction.user.update({
                  where: {
                    id: existingUser.id,
                  },
                  data: {
                    status: "PENDING",
                    displayName:
                      `${currentMember.firstName} ${currentMember.lastName}`,
                  },
                });
              }
            } else {
              const createdUser =
                await transaction.user.create({
                  data: {
                    email,
                    displayName:
                      `${currentMember.firstName} ${currentMember.lastName}`,
                    status: "PENDING",
                  },
                });

              userId = createdUser.id;

              await transaction.member.update({
                where: {
                  id: currentMember.id,
                },
                data: {
                  userId,
                },
              });
            }
          }

          if (!userId) {
            throw new Error(
              "USER_ID_MISSING",
            );
          }

          await transaction.userRole.upsert({
            where: {
              userId_roleId: {
                userId,
                roleId: memberRole.id,
              },
            },
            update: {},
            create: {
              userId,
              roleId: memberRole.id,
            },
          });

          await transaction.portalActivationToken.updateMany({
            where: {
              userId,
              usedAt: null,
              revokedAt: null,
            },
            data: {
              revokedAt: new Date(),
            },
          });

          await transaction.portalActivationToken.create({
            data: {
              userId,
              tokenHash:
                generatedCode.tokenHash,
              expiresAt:
                generatedCode.expiresAt,
              createdByUserId:
                administrator.id,
              createdByName:
                administrator.displayName,
            },
          });
        },
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "EMAIL_ALREADY_LINKED"
      ) {
        return {
          status: "ERROR",
          message:
            "Die E-Mail-Adresse ist bereits mit einem anderen Mitgliedskonto verknüpft.",
        };
      }

      console.error(
        "Portalzugang konnte nicht vorbereitet werden:",
        error,
      );

      return {
        status: "ERROR",
        message:
          "Beim Vorbereiten des Portalzugangs ist ein Fehler aufgetreten.",
      };
    }

    revalidateMemberAccessPages(
      memberId,
    );

    const mailTemplate =
      createPortalActivationMail({
        firstName:
          currentMember.firstName,
        lastName:
          currentMember.lastName,
        membershipNumber:
          currentMember.membershipNumber,
        activationCode:
          generatedCode.code,
        expiresAt:
          generatedCode.expiresAt,
      });

    try {
      const mailResult =
        await sendMail({
          to: email,
          subject:
            mailTemplate.subject,
          text: mailTemplate.text,
          html: mailTemplate.html,
        });

      const accepted =
        mailResult.accepted.length > 0;

      if (!accepted) {
        console.error(
          "SMTP hat keinen Empfänger akzeptiert:",
          {
            memberId:
              currentMember.id,
            rejected:
              mailResult.rejected,
            response:
              mailResult.response,
          },
        );

        return {
          status: "SUCCESS",
          message:
            "Der Portalzugang wurde vorbereitet.",
          activationCode:
            generatedCode.code,
          expiresAt:
            generatedCode.expiresAt.toISOString(),
          mailStatus: "FAILED",
          mailMessage:
            "Der Mailserver hat die Nachricht nicht zur Zustellung angenommen. Der Aktivierungscode ist trotzdem gültig.",
        };
      }

      return {
        status: "SUCCESS",
        message:
          "Der Portalzugang wurde vorbereitet und die Aktivierungsmail wurde versendet.",
        activationCode:
          generatedCode.code,
        expiresAt:
          generatedCode.expiresAt.toISOString(),
        mailStatus: "SENT",
        mailMessage:
          `Die Begrüßungsmail wurde an ${email} versendet.`,
      };
    } catch (error) {
      console.error(
        "Aktivierungsmail konnte nicht versendet werden:",
        error,
      );

      return {
        status: "SUCCESS",
        message:
          "Der Portalzugang wurde vorbereitet.",
        activationCode:
          generatedCode.code,
        expiresAt:
          generatedCode.expiresAt.toISOString(),
        mailStatus: "FAILED",
        mailMessage:
          "Die Begrüßungsmail konnte nicht versendet werden. Prüfe den lokalen Mailserver und die SMTP-Konfiguration.",
      };
    }
  }

  async function revokeAccessCodesAction(
    previousState: AccessActionState,
    formData: FormData,
  ): Promise<AccessActionState> {
    "use server";

    void previousState;
    void formData;

    await requireAdministrator();

    const currentMember =
      await prisma.member.findUnique({
        where: {
          id: memberId,
        },
        select: {
          userId: true,
        },
      });

    if (!currentMember) {
      return {
        status: "ERROR",
        message:
          "Das Mitglied wurde nicht gefunden.",
      };
    }

    if (!currentMember.userId) {
      return {
        status: "ERROR",
        message:
          "Für dieses Mitglied existiert noch kein Portalzugang.",
      };
    }

    const result =
      await prisma.portalActivationToken.updateMany({
        where: {
          userId:
            currentMember.userId,
          usedAt: null,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

    revalidateMemberAccessPages(
      memberId,
    );

    return {
      status: "SUCCESS",
      message:
        result.count === 1
          ? "Der aktive Aktivierungscode wurde widerrufen."
          : `${result.count} aktive Aktivierungscodes wurden widerrufen.`,
    };
  }

  const activeActivationToken =
    member.user?.activationTokens.find(
      (token) =>
        !token.usedAt &&
        !token.revokedAt &&
        token.expiresAt > new Date(),
    );

  const userStatus = member.user
    ? userStatusConfig[
        member.user.status
      ]
    : null;

  return (
    <>
      <Link
        href={`/admin/mitglieder/${member.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-content"
      >
        <ArrowLeft size={17} />
        Zurück zur Mitgliedsakte
      </Link>

      <section className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-light">
              <KeyRound size={26} />
            </span>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-accent-light">
                Mitglied{" "}
                {member.membershipNumber}
              </p>

              <h1 className="mt-1 break-words text-3xl font-bold tracking-tight text-content sm:text-4xl">
                Portalzugang
              </h1>

              <p className="mt-2 text-sm text-muted">
                {member.firstName}{" "}
                {member.lastName}
              </p>
            </div>
          </div>

          {userStatus ? (
            <span
              className={[
                "inline-flex rounded-full border px-4 py-2 text-sm font-semibold",
                userStatus.className,
              ].join(" ")}
            >
              {userStatus.label}
            </span>
          ) : (
            <span className="inline-flex rounded-full border border-line bg-page-soft px-4 py-2 text-sm font-semibold text-subtle">
              Nicht angelegt
            </span>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-surface">
            <div className="border-b border-line px-5 py-5 sm:px-6">
              <h2 className="font-bold text-content">
                Benutzerkonto
              </h2>

              <p className="mt-1 text-sm text-muted">
                Kontoinformationen und zugewiesene Rollen
              </p>
            </div>

            <div className="p-5 sm:p-6">
              {member.user &&
              userStatus ? (
                <>
                  <div className="rounded-xl border border-line bg-page-soft p-4">
                    <div className="flex items-start gap-3">
                      <UserRound
                        size={20}
                        className="mt-0.5 shrink-0 text-muted"
                      />

                      <div>
                        <p className="font-semibold text-content">
                          {
                            member.user
                              .displayName
                          }
                        </p>

                        <p className="mt-1 text-sm text-muted">
                          {
                            userStatus.description
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                    <InfoItem
                      label="Login-E-Mail"
                      value={
                        member.user.email
                      }
                      icon={Mail}
                    />

                    <InfoItem
                      label="Kontostatus"
                      value={
                        userStatus.label
                      }
                      icon={ShieldCheck}
                    />

                    <InfoItem
                      label="Konto angelegt"
                      value={formatDateTime(
                        member.user
                          .createdAt,
                      )}
                      icon={CalendarDays}
                    />

                    <InfoItem
                      label="Zuletzt geändert"
                      value={formatDateTime(
                        member.user
                          .updatedAt,
                      )}
                      icon={Clock3}
                    />
                  </dl>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
                      Zugewiesene Rollen
                    </p>

                    {member.user.roles
                      .length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {member.user.roles.map(
                          (entry) => (
                            <span
                              key={
                                entry.role
                                  .key
                              }
                              className="rounded-full border border-accent-border bg-accent-soft px-3 py-1.5 text-sm font-semibold text-accent-light"
                            >
                              {
                                entry.role
                                  .name
                              }
                            </span>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-muted">
                        Keine Rollen
                        zugeordnet.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-5">
                  <CircleAlert
                    size={22}
                    className="text-amber-200"
                  />

                  <p className="mt-3 font-semibold text-content">
                    Noch kein
                    Benutzerkonto
                  </p>

                  <p className="mt-2 text-sm leading-6 text-muted">
                    Beim Vorbereiten des
                    Portalzugangs wird
                    automatisch ein
                    Benutzerkonto mit der
                    Rolle „Mitglied“
                    angelegt.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface">
            <div className="border-b border-line px-5 py-5 sm:px-6">
              <h2 className="font-bold text-content">
                Aktivierungscodes
              </h2>

              <p className="mt-1 text-sm text-muted">
                Bisher erstellte Codes und
                deren Status
              </p>
            </div>

            <div className="p-5 sm:p-6">
              {member.user
                ?.activationTokens
                .length ? (
                <div className="space-y-3">
                  {member.user.activationTokens.map(
                    (token) => {
                      const tokenStatus =
                        getTokenStatus(
                          token,
                        );

                      return (
                        <div
                          key={token.id}
                          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-page-soft p-4"
                        >
                          <div>
                            <p className="text-sm font-semibold text-content">
                              Erstellt am{" "}
                              {formatDateTime(
                                token.createdAt,
                              )}
                            </p>

                            <p className="mt-1 text-xs text-muted">
                              Gültig bis{" "}
                              {formatDateTime(
                                token.expiresAt,
                              )}
                            </p>

                            {token.createdByName ? (
                              <p className="mt-1 text-xs text-subtle">
                                Erstellt
                                von{" "}
                                {
                                  token.createdByName
                                }
                              </p>
                            ) : null}
                          </div>

                          <span
                            className={[
                              "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
                              tokenStatus.className,
                            ].join(" ")}
                          >
                            {
                              tokenStatus.label
                            }
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-line bg-page-soft p-4">
                  <p className="text-sm font-semibold text-content">
                    Noch keine Codes
                  </p>

                  <p className="mt-2 text-sm leading-6 text-muted">
                    Für dieses Konto wurde
                    bisher kein
                    Aktivierungscode
                    erzeugt.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <AccessManagement
            prepareAction={
              prepareAccessAction
            }
            revokeAction={
              revokeAccessCodesAction
            }
            hasUserAccount={Boolean(
              member.user,
            )}
            hasActiveActivationCode={Boolean(
              activeActivationToken,
            )}
          />

          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-bold text-content">
              Mitgliedsdaten
            </h2>

            <dl className="mt-5 space-y-4">
              <SidebarItem
                label="Mitgliedsnummer"
                value={
                  member.membershipNumber
                }
              />

              <SidebarItem
                label="E-Mail-Adresse"
                value={
                  member.email ??
                  "Nicht hinterlegt"
                }
              />

              <SidebarItem
                label="Postleitzahl"
                value={
                  member.postalCode
                }
              />

              <SidebarItem
                label="Geburtsdatum"
                value={formatDate(
                  member.birthDate,
                )}
              />
            </dl>

            {!member.email ? (
              <Link
                href={`/admin/mitglieder/${member.id}/bearbeiten`}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                E-Mail-Adresse ergänzen
              </Link>
            ) : null}
          </div>
        </aside>
      </section>
    </>
  );
}

async function requireAdministrator() {
  const currentUser =
    await getCurrentUser();

  if (!currentUser) {
    redirect("/portal/login");
  }

  if (
    !currentUser.roleKeys.includes(
      "ADMIN",
    )
  ) {
    redirect("/portal");
  }

  return currentUser;
}

function revalidateMemberAccessPages(
  memberId: number,
): void {
  revalidatePath("/admin");
  revalidatePath(
    "/admin/mitglieder",
  );
  revalidatePath(
    `/admin/mitglieder/${memberId}`,
  );
  revalidatePath(
    `/admin/mitglieder/${memberId}/zugang`,
  );
}

type InfoItemProps = {
  label: string;
  value: string;
  icon: typeof Mail;
};

function InfoItem({
  label,
  value,
  icon: Icon,
}: InfoItemProps) {
  return (
    <div className="rounded-xl border border-line bg-page-soft p-4">
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-subtle">
        <Icon size={14} />
        {label}
      </dt>

      <dd className="mt-2 break-words font-medium leading-6 text-content">
        {value}
      </dd>
    </div>
  );
}

type SidebarItemProps = {
  label: string;
  value: string;
};

function SidebarItem({
  label,
  value,
}: SidebarItemProps) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-subtle">
        {label}
      </dt>

      <dd className="mt-1 break-words text-sm font-medium leading-6 text-content">
        {value}
      </dd>
    </div>
  );
}

function getTokenStatus(token: {
  usedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date;
}) {
  if (token.usedAt) {
    return {
      label: "Verwendet",
      className:
        "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (token.revokedAt) {
    return {
      label: "Widerrufen",
      className:
        "border-red-400/30 bg-red-400/10 text-red-200",
    };
  }

  if (token.expiresAt <= new Date()) {
    return {
      label: "Abgelaufen",
      className:
        "border-line bg-page-soft text-subtle",
    };
  }

  return {
    label: "Aktiv",
    className:
      "border-blue-400/30 bg-blue-400/10 text-blue-200",
  };
}

function formatDate(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Europe/Berlin",
    },
  ).format(date);
}

function formatDateTime(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Berlin",
    },
  ).format(date);
}