-- Already applied on PlanetScale main by deploy request 49; do not reapply there.
-- AlterTable
ALTER TABLE `expense` ADD COLUMN `trafficSource` ENUM('AIRBNB', 'GOOGLE', 'INSTAGRAM', 'TIKTOK', 'OTHER', 'FRIEND', 'FACEBOOK') NULL;

-- CreateIndex
CREATE INDEX `expense_venueId_category_idx` ON `expense`(`venueId`, `category`);
