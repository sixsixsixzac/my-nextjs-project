-- Migration: Add uuid column to manga_ep table
-- This migration adds a uuid column with auto-generation for new records
-- and backfills existing records with UUIDs

-- Step 1: Add the uuid column (nullable first to allow backfilling)
ALTER TABLE `manga_ep` 
ADD COLUMN `uuid` CHAR(36) NULL AFTER `p_id`;

-- Step 2: Backfill existing records with UUIDs
UPDATE `manga_ep` 
SET `uuid` = UUID() 
WHERE `uuid` IS NULL OR `uuid` = '';

-- Step 3: Make the column NOT NULL and add default for new records
ALTER TABLE `manga_ep` 
MODIFY COLUMN `uuid` CHAR(36) NOT NULL DEFAULT (UUID());

-- Step 4: Add index on uuid for better query performance
CREATE INDEX `manga_ep_uuid_idx` ON `manga_ep`(`uuid`);

