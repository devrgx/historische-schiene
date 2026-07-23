/*
  Warnings:

  - A unique constraint covering the columns `[memberId]` on the table `membership_applications` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `birthDate` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `houseNumber` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membershipType` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `members` ADD COLUMN `birthDate` DATETIME(3) NOT NULL,
    ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `country` VARCHAR(191) NOT NULL DEFAULT 'Deutschland',
    ADD COLUMN `emergencyContactName` VARCHAR(191) NULL,
    ADD COLUMN `emergencyContactPhone` VARCHAR(191) NULL,
    ADD COLUMN `guardianEmail` VARCHAR(191) NULL,
    ADD COLUMN `guardianFirstName` VARCHAR(191) NULL,
    ADD COLUMN `guardianLastName` VARCHAR(191) NULL,
    ADD COLUMN `guardianPhone` VARCHAR(191) NULL,
    ADD COLUMN `guardianRelationship` VARCHAR(191) NULL,
    ADD COLUMN `houseNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `isMinor` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `leftAt` DATETIME(3) NULL,
    ADD COLUMN `membershipType` ENUM('REGULAR', 'REDUCED', 'SUPPORTING') NOT NULL,
    ADD COLUMN `occupation` VARCHAR(191) NULL,
    ADD COLUMN `railwayQualification` VARCHAR(191) NULL,
    ADD COLUMN `street` VARCHAR(191) NOT NULL,
    ADD COLUMN `telegramUsername` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `membership_applications` ADD COLUMN `decisionNote` TEXT NULL,
    ADD COLUMN `memberId` INTEGER NULL,
    ADD COLUMN `reviewedById` INTEGER NULL;

-- CreateIndex
CREATE INDEX `members_membershipType_idx` ON `members`(`membershipType`);

-- CreateIndex
CREATE INDEX `members_postalCode_idx` ON `members`(`postalCode`);

-- CreateIndex
CREATE UNIQUE INDEX `membership_applications_memberId_key` ON `membership_applications`(`memberId`);

-- CreateIndex
CREATE INDEX `membership_applications_reviewedById_idx` ON `membership_applications`(`reviewedById`);

-- AddForeignKey
ALTER TABLE `membership_applications` ADD CONSTRAINT `membership_applications_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `membership_applications` ADD CONSTRAINT `membership_applications_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
