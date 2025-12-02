-- CreateTable
CREATE TABLE `announcements` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    `priority` ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
    `published_at` TIMESTAMP NULL,
    `expires_at` TIMESTAMP NULL,
    `created_by` INTEGER NOT NULL,
    `updated_by` INTEGER NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,

    INDEX `announcements_status_published_at_idx`(`status`, `published_at`),
    INDEX `announcements_priority_published_at_idx`(`priority`, `published_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `action` VARCHAR(100) NOT NULL,
    `resource_type` VARCHAR(50) NULL,
    `resource_id` VARCHAR(100) NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `request_data` JSON NULL,
    `response_data` JSON NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'success',
    `message` TEXT NULL,
    `metadata` JSON NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,

    INDEX `audit_logs_created_at_action_idx`(`created_at`, `action`),
    INDEX `audit_logs_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `audit_logs_resource_type_resource_id_idx`(`resource_type`, `resource_id`),
    INDEX `audit_logs_ip_address_created_at_idx`(`ip_address`, `created_at`),
    INDEX `audit_logs_user_id_idx`(`user_id`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_resource_type_idx`(`resource_type`),
    INDEX `audit_logs_resource_id_idx`(`resource_id`),
    INDEX `audit_logs_ip_address_idx`(`ip_address`),
    INDEX `audit_logs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cache` (
    `key` VARCHAR(255) NOT NULL,
    `value` MEDIUMTEXT NOT NULL,
    `expiration` INTEGER NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carousels` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `subtitle` VARCHAR(255) NULL,
    `image` VARCHAR(255) NOT NULL,
    `link` VARCHAR(255) NULL,
    `text_alignment` VARCHAR(255) NOT NULL DEFAULT 'center-center',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cartoons` (
    `p_id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` LONGTEXT NOT NULL,
    `description` LONGTEXT NOT NULL,
    `cover_image` VARCHAR(100) NOT NULL,
    `author_id` INTEGER NOT NULL,
    `p_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `uuid` CHAR(36) NOT NULL,
    `category_main` TINYINT NOT NULL DEFAULT 1,
    `category_sub` INTEGER NOT NULL DEFAULT 2,
    `type` ENUM('manga', 'novel') NOT NULL DEFAULT 'manga',
    `origin_type` INTEGER NOT NULL DEFAULT 3,
    `age_rate` VARCHAR(191) NOT NULL DEFAULT 'all',
    `publish_status` INTEGER NOT NULL DEFAULT 0,
    `completion_status` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('active', 'deleted') NOT NULL DEFAULT 'active',
    `banned` LONGTEXT NULL,

    INDEX `cartoons_title_idx`(`title`(255)),
    INDEX `cartoons_author_id_idx`(`author_id`),
    INDEX `cartoons_uuid_idx`(`uuid`),
    PRIMARY KEY (`p_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cartoon_comments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `cartoon_id` INTEGER NOT NULL,
    `episode_id` INTEGER NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `parent_id` BIGINT UNSIGNED NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('active', 'deleted', 'hidden') NOT NULL DEFAULT 'active',
    `likes_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `replies_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_name` VARCHAR(255) NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment_likes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `comment_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,

    INDEX `comment_likes_comment_id_idx`(`comment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ep_shop` (
    `eps_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ep_id` INTEGER NULL,
    `ep_no` INTEGER NOT NULL,
    `point` FLOAT NOT NULL DEFAULT 0,
    `remain_point` FLOAT NOT NULL DEFAULT 0,
    `user_id` INTEGER NOT NULL,
    `lock_after_datetime` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `ep_shop_ep_no_idx`(`ep_no`),
    INDEX `ep_shop_user_id_idx`(`user_id`),
    INDEX `ep_shop_ep_id_idx`(`ep_id`),
    PRIMARY KEY (`eps_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `manga_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `p_id` INTEGER NULL,
    `category_id` INTEGER NULL,

    INDEX `manga_categories_p_id_idx`(`p_id`),
    INDEX `manga_categories_category_id_idx`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cartoon_episodes` (
    `ep_id` INTEGER NOT NULL AUTO_INCREMENT,
    `p_id` INTEGER NOT NULL,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    `ep_name` VARCHAR(60) NOT NULL,
    `ep_content` LONGTEXT NULL,
    `ep_no` INTEGER NOT NULL,
    `ep_price` INTEGER NOT NULL DEFAULT 0,
    `total_image` INTEGER NOT NULL,
    `image_protection` ENUM('on', 'off') NOT NULL DEFAULT 'on',
    `publish_status` ENUM('now', 'schedule', 'hide') NOT NULL DEFAULT 'now',
    `schedule_datetime` DATETIME NULL,
    `lock_duration_days` INTEGER NULL,
    `status` ENUM('active', 'deleted') NOT NULL DEFAULT 'active',
    `create_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `cartoon_episodes_p_id_idx`(`p_id`),
    INDEX `cartoon_episodes_uuid_idx`(`uuid`),
    UNIQUE INDEX `cartoon_episodes_p_id_ep_no_key`(`p_id`, `ep_no`),
    PRIMARY KEY (`ep_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `manga_ep_image` (
    `epi_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ep_no` INTEGER NOT NULL,
    `p_id` INTEGER NOT NULL,
    `epi_image_name` VARCHAR(255) NOT NULL,
    `json` JSON NULL,

    INDEX `manga_ep_image_p_id_ep_no_idx`(`p_id`, `ep_no`),
    PRIMARY KEY (`epi_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `manga_ep_views` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `p_id` INTEGER NOT NULL,
    `ep_no` INTEGER NOT NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `manga_ep_views_p_id_idx`(`p_id`),
    INDEX `manga_ep_views_ep_no_idx`(`ep_no`),
    INDEX `manga_ep_views_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `manga_favorite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `p_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `migrations` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `migration` VARCHAR(255) NOT NULL,
    `batch` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `notifiable_type` VARCHAR(255) NOT NULL,
    `notifiable_id` BIGINT UNSIGNED NOT NULL,
    `data` TEXT NOT NULL,
    `read_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,

    INDEX `notifications_notifiable_type_notifiable_id_idx`(`notifiable_type`, `notifiable_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NULL,

    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `id` VARCHAR(191) NOT NULL,
    `user_profile_id` INTEGER NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `provider` VARCHAR(255) NOT NULL,
    `provider_account_id` VARCHAR(255) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(255) NULL,
    `scope` TEXT NULL,
    `id_token` TEXT NULL,
    `session_state` TEXT NULL,

    INDEX `accounts_user_profile_id_idx`(`user_profile_id`),
    UNIQUE INDEX `accounts_provider_provider_account_id_key`(`provider`, `provider_account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(255) NOT NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `payload` LONGTEXT NOT NULL,
    `last_activity` INTEGER NOT NULL,

    INDEX `sessions_user_id_idx`(`user_id`),
    INDEX `sessions_last_activity_idx`(`last_activity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shop_item` (
    `item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_title` VARCHAR(1000) NOT NULL,
    `item_detail` TEXT NOT NULL,
    `item_price` BIGINT NOT NULL DEFAULT 0,
    `item_img` VARCHAR(1000) NOT NULL,
    `item_type` VARCHAR(30) NOT NULL,
    `item_status` ENUM('on', 'off') NOT NULL DEFAULT 'on',

    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shop_item_user` (
    `siu_id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_id` INTEGER NOT NULL,
    `u_name` VARCHAR(255) NULL,
    `user_id` INTEGER NULL,
    `siu_date` DATE NOT NULL,
    `siu_time` TIME NOT NULL,
    `siu_status` VARCHAR(255) NOT NULL DEFAULT 'off',
    `item_type` VARCHAR(100) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`siu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `topup_packages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `coin_amount` INTEGER NOT NULL,
    `bonus` FLOAT NOT NULL DEFAULT 0,
    `price` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('deleted', 'show', 'hide') NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `topup_transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `package_id` INTEGER NOT NULL,
    `ref_id` VARCHAR(255) NOT NULL,
    `transaction_id` INTEGER NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `amount_paid` DECIMAL(10, 2) NOT NULL,
    `coins_added` INTEGER NOT NULL,
    `status` ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `topup_transactions_user_id_idx`(`user_id`),
    INDEX `topup_transactions_package_id_idx`(`package_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_bans` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `reason` TEXT NULL,
    `unbanned_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,

    INDEX `user_bans_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_detail` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `bank_number` VARCHAR(50) NOT NULL,
    `bank_name` VARCHAR(100) NOT NULL,
    `bank_type` VARCHAR(50) NULL,
    `bank_image` VARCHAR(255) NULL,
    `user_phone` VARCHAR(20) NULL,
    `user_prefix` VARCHAR(20) NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `fan_page_link` VARCHAR(500) NULL,
    `status` ENUM('pending', 'approve', 'reject') NOT NULL DEFAULT 'pending',
    `reject_reason` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `user_detail_user_id_key`(`user_id`),
    INDEX `user_detail_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_followers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `follower_id` INTEGER UNSIGNED NOT NULL,
    `following_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(1000) NOT NULL,
    `level` TINYINT NOT NULL DEFAULT 0,
    `u_status` TINYINT NOT NULL DEFAULT 1,
    `u_name` VARCHAR(50) NOT NULL,
    `display_name` VARCHAR(50) NOT NULL,
    `point` FLOAT NOT NULL DEFAULT 0,
    `sales` FLOAT NOT NULL DEFAULT 0,
    `p_word` TEXT NOT NULL,
    `u_flname` VARCHAR(255) NULL,
    `email` TEXT NOT NULL,
    `u_phone` VARCHAR(10) NULL,
    `user_img` VARCHAR(100) NOT NULL DEFAULT 'none.png',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `social_media` LONGTEXT NULL,

    INDEX `user_profile_uuid_idx`(`uuid`(255)),
    FULLTEXT INDEX `user_profile_u_name_idx`(`u_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_settings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `setting_key` VARCHAR(255) NOT NULL,
    `setting_value` JSON NOT NULL,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `user_settings_user_id_idx`(`user_id`),
    INDEX `user_settings_user_id_setting_key_idx`(`user_id`, `setting_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `web_contacts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(255) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `type` ENUM('email', 'phone', 'social', 'website', 'other') NOT NULL DEFAULT 'other',
    `description` TEXT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `web_contacts_is_active_display_order_idx`(`is_active`, `display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `web_setting` (
    `key` VARCHAR(64) NOT NULL,
    `value` TEXT NULL,
    `updated_at` DATETIME NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `withdraw_money` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `currentRate` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `fee` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `status` ENUM('success', 'deny', 'pending', 'deleted') NOT NULL DEFAULT 'pending',
    `reason` TEXT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `announcements` ADD CONSTRAINT `announcements_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `user_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `announcements` ADD CONSTRAINT `announcements_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `user_profile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user_profile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cartoons` ADD CONSTRAINT `cartoons_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `user_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cartoon_comments` ADD CONSTRAINT `cartoon_comments_cartoon_id_fkey` FOREIGN KEY (`cartoon_id`) REFERENCES `cartoons`(`p_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cartoon_comments` ADD CONSTRAINT `cartoon_comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `cartoon_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment_likes` ADD CONSTRAINT `comment_likes_comment_id_fkey` FOREIGN KEY (`comment_id`) REFERENCES `cartoon_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ep_shop` ADD CONSTRAINT `ep_shop_ep_id_fkey` FOREIGN KEY (`ep_id`) REFERENCES `cartoon_episodes`(`ep_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ep_shop` ADD CONSTRAINT `ep_shop_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user_profile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manga_categories` ADD CONSTRAINT `manga_categories_p_id_fkey` FOREIGN KEY (`p_id`) REFERENCES `cartoons`(`p_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manga_categories` ADD CONSTRAINT `manga_categories_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cartoon_episodes` ADD CONSTRAINT `cartoon_episodes_p_id_fkey` FOREIGN KEY (`p_id`) REFERENCES `cartoons`(`p_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manga_ep_views` ADD CONSTRAINT `manga_ep_views_p_id_fkey` FOREIGN KEY (`p_id`) REFERENCES `cartoons`(`p_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manga_ep_views` ADD CONSTRAINT `manga_ep_views_p_id_ep_no_fkey` FOREIGN KEY (`p_id`, `ep_no`) REFERENCES `cartoon_episodes`(`p_id`, `ep_no`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manga_favorite` ADD CONSTRAINT `manga_favorite_p_id_fkey` FOREIGN KEY (`p_id`) REFERENCES `cartoons`(`p_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_profile_id_fkey` FOREIGN KEY (`user_profile_id`) REFERENCES `user_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shop_item_user` ADD CONSTRAINT `shop_item_user_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `shop_item`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topup_transactions` ADD CONSTRAINT `topup_transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topup_transactions` ADD CONSTRAINT `topup_transactions_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `topup_packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_bans` ADD CONSTRAINT `user_bans_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_detail` ADD CONSTRAINT `user_detail_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
