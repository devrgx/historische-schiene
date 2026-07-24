-- CreateTable
CREATE TABLE `payment_attempts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `method` ENUM('BANK_TRANSFER', 'SEPA_DIRECT_DEBIT', 'CASH', 'CARD', 'OTHER') NOT NULL,
    `status` ENUM('PENDING', 'SUBMITTED', 'SUCCEEDED', 'FAILED', 'RETURNED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `amountCents` INTEGER NOT NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `scheduledFor` DATETIME(3) NULL,
    `submittedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `failedAt` DATETIME(3) NULL,
    `returnedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `providerReference` VARCHAR(191) NULL,
    `endToEndId` VARCHAR(191) NULL,
    `failureCode` VARCHAR(191) NULL,
    `failureMessage` TEXT NULL,
    `bankReturnFeeCents` INTEGER NOT NULL DEFAULT 0,
    `chargeableReturnFeeCents` INTEGER NOT NULL DEFAULT 0,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `payment_attempts_invoiceId_idx`(`invoiceId`),
    INDEX `payment_attempts_status_idx`(`status`),
    INDEX `payment_attempts_scheduledFor_idx`(`scheduledFor`),
    INDEX `payment_attempts_endToEndId_idx`(`endToEndId`),
    INDEX `payment_attempts_providerReference_idx`(`providerReference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reminders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `reminderNumber` VARCHAR(191) NOT NULL,
    `level` ENUM('PAYMENT_REMINDER', 'FIRST_REMINDER', 'FINAL_REMINDER') NOT NULL,
    `status` ENUM('DRAFT', 'ISSUED', 'SENT', 'SETTLED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `issuedAt` DATETIME(3) NOT NULL,
    `dueAt` DATETIME(3) NOT NULL,
    `principalCents` INTEGER NOT NULL,
    `reminderFeeCents` INTEGER NOT NULL DEFAULT 0,
    `returnFeeCents` INTEGER NOT NULL DEFAULT 0,
    `interestCents` INTEGER NOT NULL DEFAULT 0,
    `totalOpenCents` INTEGER NOT NULL,
    `recipientMembershipNumber` VARCHAR(191) NOT NULL,
    `recipientName` VARCHAR(191) NOT NULL,
    `recipientStreet` VARCHAR(191) NOT NULL,
    `recipientHouseNumber` VARCHAR(191) NOT NULL,
    `recipientPostalCode` VARCHAR(191) NOT NULL,
    `recipientCity` VARCHAR(191) NOT NULL,
    `recipientCountry` VARCHAR(191) NOT NULL,
    `note` TEXT NULL,
    `pdfStoragePath` VARCHAR(191) NULL,
    `pdfSha256` VARCHAR(191) NULL,
    `pdfSizeBytes` INTEGER NULL,
    `pdfGeneratedAt` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NULL,
    `settledAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `cancellationReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reminders_reminderNumber_key`(`reminderNumber`),
    INDEX `reminders_invoiceId_idx`(`invoiceId`),
    INDEX `reminders_status_idx`(`status`),
    INDEX `reminders_level_idx`(`level`),
    INDEX `reminders_dueAt_idx`(`dueAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payment_attempts` ADD CONSTRAINT `payment_attempts_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reminders` ADD CONSTRAINT `reminders_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
