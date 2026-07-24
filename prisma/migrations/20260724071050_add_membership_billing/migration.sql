/*
  Bestehende Mitgliedschaftsarten werden zuerst um die neuen
  Werte erweitert, anschließend umgewandelt und zuletzt werden
  die alten Enum-Werte entfernt.

  Zuordnung:
  REGULAR    -> ADULT
  SUPPORTING -> ADULT
*/

-- Bestehendes Enum der Mitglieder vorübergehend erweitern
ALTER TABLE `members`
MODIFY `membershipType`
ENUM(
  'REGULAR',
  'SUPPORTING',
  'REDUCED',
  'HONORARY',
  'ADULT',
  'LEGAL_ENTITY'
)
NOT NULL;

-- Bestehende Mitgliederdaten umwandeln
UPDATE `members`
SET `membershipType` = 'ADULT'
WHERE `membershipType` = 'REGULAR';

UPDATE `members`
SET `membershipType` = 'ADULT'
WHERE `membershipType` = 'SUPPORTING';

-- Altes Enum endgültig ersetzen
ALTER TABLE `members`
MODIFY `membershipType`
ENUM(
  'ADULT',
  'REDUCED',
  'LEGAL_ENTITY',
  'HONORARY'
)
NOT NULL;


-- Bestehendes Enum der Mitgliedsanträge vorübergehend erweitern
ALTER TABLE `membership_applications`
MODIFY `membershipType`
ENUM(
  'REGULAR',
  'SUPPORTING',
  'REDUCED',
  'HONORARY',
  'ADULT',
  'LEGAL_ENTITY'
)
NOT NULL;

-- Bestehende Anträge umwandeln
UPDATE `membership_applications`
SET `membershipType` = 'ADULT'
WHERE `membershipType` = 'REGULAR';

UPDATE `membership_applications`
SET `membershipType` = 'ADULT'
WHERE `membershipType` = 'SUPPORTING';

-- Altes Enum endgültig ersetzen
ALTER TABLE `membership_applications`
MODIFY `membershipType`
ENUM(
  'ADULT',
  'REDUCED',
  'LEGAL_ENTITY',
  'HONORARY'
)
NOT NULL;
-- CreateTable
CREATE TABLE `member_billing_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `selectedMonthlyAmountCents` INTEGER NULL,
    `monthlyFeeOverrideCents` INTEGER NULL,
    `admissionFeeOverrideCents` INTEGER NULL,
    `admissionFeeChargedAt` DATETIME(3) NULL,
    `contributionExemptUntil` DATETIME(3) NULL,
    `preferredPaymentMethod` ENUM('BANK_TRANSFER', 'SEPA_DIRECT_DEBIT', 'CASH', 'CARD', 'OTHER') NOT NULL DEFAULT 'BANK_TRANSFER',
    `sepaMandateReference` VARCHAR(191) NULL,
    `sepaMandateSignedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `member_billing_profiles_memberId_key`(`memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `membership_charges` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `billingYear` INTEGER NOT NULL,
    `billingMonth` INTEGER NOT NULL,
    `membershipType` ENUM('ADULT', 'REDUCED', 'LEGAL_ENTITY', 'HONORARY') NOT NULL,
    `membershipLabel` VARCHAR(191) NOT NULL,
    `monthlyAmountCents` INTEGER NOT NULL,
    `admissionFeeCents` INTEGER NOT NULL DEFAULT 0,
    `totalAmountCents` INTEGER NOT NULL,
    `invoiceId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `membership_charges_invoiceId_key`(`invoiceId`),
    INDEX `membership_charges_billingYear_billingMonth_idx`(`billingYear`, `billingMonth`),
    INDEX `membership_charges_memberId_idx`(`memberId`),
    UNIQUE INDEX `membership_charges_memberId_billingYear_billingMonth_key`(`memberId`, `billingYear`, `billingMonth`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `memberId` INTEGER NOT NULL,
    `status` ENUM('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `billingYear` INTEGER NOT NULL,
    `billingMonth` INTEGER NOT NULL,
    `issueDate` DATETIME(3) NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'EUR',
    `subtotalCents` INTEGER NOT NULL,
    `totalCents` INTEGER NOT NULL,
    `paidCents` INTEGER NOT NULL DEFAULT 0,
    `openCents` INTEGER NOT NULL,
    `recipientMembershipNumber` VARCHAR(191) NOT NULL,
    `recipientName` VARCHAR(191) NOT NULL,
    `recipientStreet` VARCHAR(191) NOT NULL,
    `recipientHouseNumber` VARCHAR(191) NOT NULL,
    `recipientPostalCode` VARCHAR(191) NOT NULL,
    `recipientCity` VARCHAR(191) NOT NULL,
    `recipientCountry` VARCHAR(191) NOT NULL,
    `issuerName` VARCHAR(191) NOT NULL,
    `issuerStreet` VARCHAR(191) NOT NULL,
    `issuerHouseNumber` VARCHAR(191) NOT NULL,
    `issuerPostalCode` VARCHAR(191) NOT NULL,
    `issuerCity` VARCHAR(191) NOT NULL,
    `issuerCountry` VARCHAR(191) NOT NULL,
    `issuerEmail` VARCHAR(191) NULL,
    `issuerPhone` VARCHAR(191) NULL,
    `issuerWebsite` VARCHAR(191) NULL,
    `issuerAccountHolder` VARCHAR(191) NULL,
    `issuerIban` VARCHAR(191) NULL,
    `issuerBic` VARCHAR(191) NULL,
    `issuerBankName` VARCHAR(191) NULL,
    `contributionResolutionNote` TEXT NULL,
    `pdfStoragePath` VARCHAR(191) NULL,
    `pdfSha256` VARCHAR(191) NULL,
    `pdfSizeBytes` INTEGER NULL,
    `pdfGeneratedAt` DATETIME(3) NULL,
    `finalizedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `cancelledReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoices_invoiceNumber_key`(`invoiceNumber`),
    INDEX `invoices_memberId_idx`(`memberId`),
    INDEX `invoices_billingYear_billingMonth_idx`(`billingYear`, `billingMonth`),
    INDEX `invoices_status_idx`(`status`),
    INDEX `invoices_issueDate_idx`(`issueDate`),
    INDEX `invoices_dueDate_idx`(`dueDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `position` INTEGER NOT NULL,
    `type` ENUM('MEMBERSHIP_FEE', 'ADMISSION_FEE', 'OTHER', 'CREDIT') NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unitAmountCents` INTEGER NOT NULL,
    `totalAmountCents` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `invoice_items_invoiceId_idx`(`invoiceId`),
    INDEX `invoice_items_type_idx`(`type`),
    UNIQUE INDEX `invoice_items_invoiceId_position_key`(`invoiceId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `amountCents` INTEGER NOT NULL,
    `method` ENUM('BANK_TRANSFER', 'SEPA_DIRECT_DEBIT', 'CASH', 'CARD', 'OTHER') NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    `paidAt` DATETIME(3) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `note` TEXT NULL,
    `recordedByUserId` INTEGER NULL,
    `recordedByName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `payments_invoiceId_idx`(`invoiceId`),
    INDEX `payments_status_idx`(`status`),
    INDEX `payments_paidAt_idx`(`paidAt`),
    INDEX `payments_reference_idx`(`reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `member_billing_profiles` ADD CONSTRAINT `member_billing_profiles_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `membership_charges` ADD CONSTRAINT `membership_charges_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `membership_charges` ADD CONSTRAINT `membership_charges_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_items` ADD CONSTRAINT `invoice_items_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
