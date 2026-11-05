-- AlterTable
ALTER TABLE `contact` ADD COLUMN `category` ENUM(
    'BUFFET',
    'CHURRASCO',
    'BAR',
    'DJ',
    'MUSICA_AO_VIVO',
    'FOTOGRAFIA',
    'FILMAGEM',
    'DECORACAO',
    'CENOGRAFIA',
    'BOLOS_DOCES',
    'RECREACAO',
    'ENTRETENIMENTO',
    'CERIMONIAL',
    'AUDIOVISUAL',
    'MOBILIARIO',
    'BRINDES',
    'OUTROS'
) NULL;

UPDATE `contact`
SET `category` = 'OUTROS'
WHERE `type` = 'SUPPLIER' AND `category` IS NULL;
