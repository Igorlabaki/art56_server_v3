-- AlterTable
ALTER TABLE `proposal` ADD COLUMN `eventCategory` ENUM(
    'CORPORATE',
    'BIRTHDAY',
    'BACHELOR_PARTY',
    'WEDDING',
    'COFFEE_BREAK',
    'OTHER'
) NULL;
