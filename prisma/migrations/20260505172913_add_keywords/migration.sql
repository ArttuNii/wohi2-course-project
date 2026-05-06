-- CreateTable
CREATE TABLE `Keyword` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `word` VARCHAR(100) NOT NULL,
    `quizId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Keyword` ADD CONSTRAINT `Keyword_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quizes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
