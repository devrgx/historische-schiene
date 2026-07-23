-- AlterTable
ALTER TABLE `membership_applications` ADD COLUMN `contributionRulesVersion` VARCHAR(191) NULL,
    ADD COLUMN `guardianAuthorityConfirmed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `guardianCity` VARCHAR(191) NULL,
    ADD COLUMN `guardianConsentAccepted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `guardianConsentAt` DATETIME(3) NULL,
    ADD COLUMN `guardianEmail` VARCHAR(191) NULL,
    ADD COLUMN `guardianFirstName` VARCHAR(191) NULL,
    ADD COLUMN `guardianHouseNumber` VARCHAR(191) NULL,
    ADD COLUMN `guardianLastName` VARCHAR(191) NULL,
    ADD COLUMN `guardianNameConfirmation` VARCHAR(191) NULL,
    ADD COLUMN `guardianPhone` VARCHAR(191) NULL,
    ADD COLUMN `guardianPostalCode` VARCHAR(191) NULL,
    ADD COLUMN `guardianRelationship` VARCHAR(191) NULL,
    ADD COLUMN `guardianStreet` VARCHAR(191) NULL,
    ADD COLUMN `isMinor` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `privacyVersion` VARCHAR(191) NULL,
    ADD COLUMN `statutesVersion` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `membership_applications_isMinor_idx` ON `membership_applications`(`isMinor`);
