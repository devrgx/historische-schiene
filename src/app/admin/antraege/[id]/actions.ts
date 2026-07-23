"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  MemberStatus,
  MembershipApplicationHistoryAction,
  MembershipApplicationStatus,
} from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { createNextMemberNumber } from "@/lib/member-number";
import { prisma } from "@/lib/prisma";

async function requireAdministrator() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/portal/login");
  }

  if (!currentUser.roleKeys.includes("ADMIN")) {
    redirect("/portal/app");
  }

  return currentUser;
}

export async function startApplicationReviewAction(
  formData: FormData,
): Promise<void> {
  const applicationId = getApplicationId(formData);
  const currentUser = await requireAdministrator();

  const result = await prisma.$transaction(
    async (transaction) => {
      const application =
        await transaction.membershipApplication.findUnique({
          where: {
            id: applicationId,
          },
          select: {
            id: true,
            status: true,
            memberId: true,
          },
        });

      if (!application) {
        return {
          status: "NOT_FOUND" as const,
        };
      }

      if (
        application.status !==
          MembershipApplicationStatus.PENDING ||
        application.memberId !== null
      ) {
        return {
          status: "UNAVAILABLE" as const,
        };
      }

      const updateResult =
        await transaction.membershipApplication.updateMany({
          where: {
            id: applicationId,
            status: MembershipApplicationStatus.PENDING,
            memberId: null,
          },
          data: {
            status: MembershipApplicationStatus.IN_REVIEW,
            reviewedById: currentUser.id,
            reviewedAt: new Date(),
          },
        });

      if (updateResult.count === 0) {
        return {
          status: "UNAVAILABLE" as const,
        };
      }

      await transaction.membershipApplicationHistory.create({
        data: {
          applicationId,
          action:
            MembershipApplicationHistoryAction.REVIEW_STARTED,
          previousStatus:
            MembershipApplicationStatus.PENDING,
          newStatus:
            MembershipApplicationStatus.IN_REVIEW,
          message: "Die formelle Prüfung des Antrags wurde begonnen.",
          actorUserId: currentUser.id,
        },
      });

      return {
        status: "SUCCESS" as const,
      };
    },
  );

  if (result.status === "NOT_FOUND") {
    redirect("/admin/antraege");
  }

  if (result.status === "UNAVAILABLE") {
    redirect(
      `/admin/antraege/${applicationId}?error=review-unavailable`,
    );
  }

  revalidateApplicationPages(applicationId);

  redirect(
    `/admin/antraege/${applicationId}?success=review-started`,
  );
}

export async function approveApplicationAction(
  formData: FormData,
): Promise<void> {
  const applicationId = getApplicationId(formData);
  const currentUser = await requireAdministrator();

  const confirmationAccepted =
    formData.get("approvalConfirmed") === "yes";

  const decisionNote = getOptionalText(
    formData,
    "decisionNote",
  );

  if (!confirmationAccepted) {
    redirect(
      `/admin/antraege/${applicationId}?error=approval-confirmation`,
    );
  }

  const result = await prisma.$transaction(
    async (transaction) => {
      const application =
        await transaction.membershipApplication.findUnique({
          where: {
            id: applicationId,
          },
        });

      if (!application) {
        return {
          status: "NOT_FOUND" as const,
        };
      }

      if (
        application.status !==
          MembershipApplicationStatus.IN_REVIEW ||
        application.memberId !== null
      ) {
        return {
          status: "UNAVAILABLE" as const,
        };
      }

      const claim =
        await transaction.membershipApplication.updateMany({
          where: {
            id: applicationId,
            status: MembershipApplicationStatus.IN_REVIEW,
            memberId: null,
          },
          data: {
            status: MembershipApplicationStatus.APPROVED,
            reviewedById: currentUser.id,
            reviewedAt: new Date(),
            decisionNote,
            rejectionReason: null,
          },
        });

      if (claim.count === 0) {
        return {
          status: "UNAVAILABLE" as const,
        };
      }

      const membershipNumber =
        await createNextMemberNumber(transaction);

      const member = await transaction.member.create({
        data: {
          membershipNumber,
          membershipType: application.membershipType,

          firstName: application.firstName,
          lastName: application.lastName,
          birthDate: application.birthDate,

          email: application.email,
          phone: application.phone,

          street: application.street,
          houseNumber: application.houseNumber,
          postalCode: application.postalCode,
          city: application.city,
          country: application.country,

          occupation: application.occupation,
          railwayQualification:
            application.railwayQualification,
          telegramUsername: application.telegramUsername,

          emergencyContactName:
            application.emergencyContactName,
          emergencyContactPhone:
            application.emergencyContactPhone,

          isMinor: application.isMinor,

          guardianFirstName: application.guardianFirstName,
          guardianLastName: application.guardianLastName,
          guardianEmail: application.guardianEmail,
          guardianPhone: application.guardianPhone,
          guardianRelationship:
            application.guardianRelationship,

          joinedAt: new Date(),
          status: MemberStatus.ACTIVE,
        },
      });

      await transaction.membershipApplication.update({
        where: {
          id: applicationId,
        },
        data: {
          memberId: member.id,
        },
      });

      const historyMessage = [
        `Der Antrag wurde genehmigt.`,
        `Das Mitglied wurde mit der Mitgliedsnummer ${membershipNumber} angelegt.`,
        decisionNote
          ? `Interner Vermerk: ${decisionNote}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

      await transaction.membershipApplicationHistory.create({
        data: {
          applicationId,
          action:
            MembershipApplicationHistoryAction.APPROVED,
          previousStatus:
            MembershipApplicationStatus.IN_REVIEW,
          newStatus:
            MembershipApplicationStatus.APPROVED,
          message: historyMessage,
          actorUserId: currentUser.id,
        },
      });

      return {
        status: "SUCCESS" as const,
        memberId: member.id,
      };
    },
  );

  if (result.status === "NOT_FOUND") {
    redirect("/admin/antraege");
  }

  if (result.status === "UNAVAILABLE") {
    redirect(
      `/admin/antraege/${applicationId}?error=approval-unavailable`,
    );
  }

  revalidateApplicationPages(applicationId);
  revalidatePath("/admin/mitglieder");
  revalidatePath(`/admin/mitglieder/${result.memberId}`);

  redirect(
    `/admin/mitglieder/${result.memberId}?success=application-approved`,
  );
}

export async function rejectApplicationAction(
  formData: FormData,
): Promise<void> {
  const applicationId = getApplicationId(formData);
  const currentUser = await requireAdministrator();

  const rejectionReason = getRequiredText(
    formData,
    "rejectionReason",
  );

  const decisionNote = getOptionalText(
    formData,
    "rejectionDecisionNote",
  );

  const confirmationAccepted =
    formData.get("rejectionConfirmed") === "yes";

  if (rejectionReason.length < 5) {
    redirect(
      `/admin/antraege/${applicationId}?error=rejection-reason`,
    );
  }

  if (!confirmationAccepted) {
    redirect(
      `/admin/antraege/${applicationId}?error=rejection-confirmation`,
    );
  }

  const result = await prisma.$transaction(
    async (transaction) => {
      const application =
        await transaction.membershipApplication.findUnique({
          where: {
            id: applicationId,
          },
          select: {
            id: true,
            status: true,
            memberId: true,
          },
        });

      if (!application) {
        return {
          status: "NOT_FOUND" as const,
        };
      }

      if (
        application.status !==
          MembershipApplicationStatus.IN_REVIEW ||
        application.memberId !== null
      ) {
        return {
          status: "UNAVAILABLE" as const,
        };
      }

      const updateResult =
        await transaction.membershipApplication.updateMany({
          where: {
            id: applicationId,
            status: MembershipApplicationStatus.IN_REVIEW,
            memberId: null,
          },
          data: {
            status: MembershipApplicationStatus.REJECTED,
            rejectionReason,
            decisionNote,
            reviewedById: currentUser.id,
            reviewedAt: new Date(),
          },
        });

      if (updateResult.count === 0) {
        return {
          status: "UNAVAILABLE" as const,
        };
      }

      const historyMessage = [
        `Ablehnungsgrund: ${rejectionReason}`,
        decisionNote
          ? `Interner Vermerk: ${decisionNote}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

      await transaction.membershipApplicationHistory.create({
        data: {
          applicationId,
          action:
            MembershipApplicationHistoryAction.REJECTED,
          previousStatus:
            MembershipApplicationStatus.IN_REVIEW,
          newStatus:
            MembershipApplicationStatus.REJECTED,
          message: historyMessage,
          actorUserId: currentUser.id,
        },
      });

      return {
        status: "SUCCESS" as const,
      };
    },
  );

  if (result.status === "NOT_FOUND") {
    redirect("/admin/antraege");
  }

  if (result.status === "UNAVAILABLE") {
    redirect(
      `/admin/antraege/${applicationId}?error=rejection-unavailable`,
    );
  }

  revalidateApplicationPages(applicationId);

  redirect(
    `/admin/antraege/${applicationId}?success=application-rejected`,
  );
}

function getApplicationId(formData: FormData): string {
  const applicationId = String(
    formData.get("applicationId") ?? "",
  ).trim();

  if (!applicationId) {
    throw new Error("Die Antrags-ID fehlt.");
  }

  return applicationId;
}

function getRequiredText(
  formData: FormData,
  name: string,
): string {
  return String(formData.get(name) ?? "").trim();
}

function getOptionalText(
  formData: FormData,
  name: string,
): string | null {
  const value = String(formData.get(name) ?? "").trim();

  return value || null;
}

function revalidateApplicationPages(
  applicationId: string,
): void {
  revalidatePath("/admin");
  revalidatePath("/admin/antraege");
  revalidatePath(`/admin/antraege/${applicationId}`);
}