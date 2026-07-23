-- CreateTable
CREATE TABLE `number_sequences` (
    `key` VARCHAR(191) NOT NULL,
    `nextValue` INTEGER NOT NULL DEFAULT 1,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
