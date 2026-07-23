-- CreateTable
CREATE TABLE `membership_application_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `applicationId` VARCHAR(191) NOT NULL,
    `action` ENUM('REVIEW_STARTED', 'APPROVED', 'REJECTED', 'WITHDRAWN', 'NOTE_ADDED') NOT NULL,
    `previousStatus` ENUM('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN') NULL,
    `newStatus` ENUM('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN') NULL,
    `message` TEXT NULL,
    `actorUserId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `membership_application_history_applicationId_createdAt_idx`(`applicationId`, `createdAt`),
    INDEX `membership_application_history_actorUserId_idx`(`actorUserId`),
    INDEX `membership_application_history_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `membership_application_history` ADD CONSTRAINT `membership_application_history_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `membership_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `membership_application_history` ADD CONSTRAINT `membership_application_history_actorUserId_fkey` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
