CREATE TABLE `analytic_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text,
	`open_rate` integer DEFAULT false,
	`reply_rate` integer DEFAULT false,
	`opt_out_rate` integer DEFAULT false,
	`opt_out_url` text,
	`bounce_rate` integer DEFAULT false,
	`click_through_rate` integer DEFAULT false,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `campaigns_contacts` (
	`campaign` text NOT NULL,
	`contact` text NOT NULL,
	PRIMARY KEY(`campaign`, `contact`),
	FOREIGN KEY (`campaign`) REFERENCES `campaign`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`contact`) REFERENCES `contact`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `campaign_sender_email_link` (
	`campaign_id` text NOT NULL,
	`sender_email_id` text NOT NULL,
	PRIMARY KEY(`campaign_id`, `sender_email_id`),
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sender_email_id`) REFERENCES `sender_email`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `campaign` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(256),
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deadline` integer DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	`sequence` text,
	FOREIGN KEY (`sequence`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cart` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cart_item` (
	`id` text PRIMARY KEY NOT NULL,
	`cart_id` text NOT NULL,
	`name` text,
	FOREIGN KEY (`cart_id`) REFERENCES `cart`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `contabo_token` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`refresh_token` text NOT NULL,
	`refresh_token_expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contact` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company_name` text,
	`created_at` integer DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `domain` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`user_id` text NOT NULL,
	`purchased_at` integer DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`splitbox_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`splitbox_id`) REFERENCES `splitbox`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `domain_purchase_form_info` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`registrant_first_name` text,
	`registrant_last_name` text,
	`registrant_address_1` text,
	`registrant_city` text,
	`registrant_state_province` text,
	`registrant_postal_code` text,
	`registrant_country` text,
	`registrant_email_address` text,
	`registrant_phone_country_code` text,
	`registrant_phone_number` text,
	`tech_first_name` text,
	`tech_last_name` text,
	`tech_address_1` text,
	`tech_city` text,
	`tech_state_province` text,
	`tech_postal_code` text,
	`tech_country` text,
	`tech_email_address` text,
	`tech_phone_country_code` text,
	`tech_phone_number` text,
	`admin_first_name` text,
	`admin_last_name` text,
	`admin_address_1` text,
	`admin_city` text,
	`admin_state_province` text,
	`admin_postal_code` text,
	`admin_country` text,
	`admin_email_address` text,
	`admin_phone_country_code` text,
	`admin_phone_number` text,
	`billing_first_name` text,
	`billing_last_name` text,
	`billing_address_1` text,
	`billing_city` text,
	`billing_state_province` text,
	`billing_postal_code` text,
	`billing_country` text,
	`billing_email_address` text,
	`billing_phone_country_code` text,
	`billing_phone_number` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `email_bounce_event` (
	`id` text PRIMARY KEY NOT NULL,
	`target_email` text NOT NULL,
	`sequence_step_id` text,
	`created_at` integer DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`name` text NOT NULL,
	`sec` text NOT NULL,
	FOREIGN KEY (`sequence_step_id`) REFERENCES `sequence_step`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `email_link_click_event` (
	`id` text PRIMARY KEY NOT NULL,
	`target_email` text NOT NULL,
	`sequence_id` text,
	`link` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`sequence_id`) REFERENCES `sequence_step`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `email_open_event` (
	`id` text PRIMARY KEY NOT NULL,
	`target_email` text NOT NULL,
	`sequence_id` text,
	`created_at` integer DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`sequence_id`) REFERENCES `sequence_step`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `email_opt_out_event` (
	`id` text PRIMARY KEY NOT NULL,
	`target_email` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`campaign_id` text NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `campaign_google_email_link` (
	`campaign_id` text NOT NULL,
	`google_user_id` text NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`google_user_id`) REFERENCES `google_user_info`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `google_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`google_id` text NOT NULL,
	`access_token` text NOT NULL,
	`expires_in` integer NOT NULL,
	`refresh_token` text NOT NULL,
	`scope` text NOT NULL,
	`token_type` text NOT NULL,
	`id_token` text
);
--> statement-breakpoint
CREATE TABLE `google_user_info` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`google_id` text NOT NULL,
	`verified_email` integer NOT NULL,
	`name` text NOT NULL,
	`given_name` text,
	`family_name` text,
	`picture` text NOT NULL,
	`locale` text
);
--> statement-breakpoint
CREATE TABLE `post` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `sender_email` (
	`id` text PRIMARY KEY NOT NULL,
	`from_name` text NOT NULL,
	`from_email` text NOT NULL,
	`user_name` text NOT NULL,
	`password` text NOT NULL,
	`smtp_host` text NOT NULL,
	`smtp_port` integer NOT NULL,
	`imap_host` text NOT NULL,
	`imap_port` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sequence_break` (
	`id` text PRIMARY KEY NOT NULL,
	`length_in_hours` integer NOT NULL,
	`index` integer NOT NULL,
	`campaign_id` text,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sequence_step` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`content` text,
	`index` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` integer NOT NULL,
	`campaign_id` text NOT NULL,
	`state` text DEFAULT 'waiting' NOT NULL,
	`format` text DEFAULT 'html' NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `splitbox` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`compute_id_on_hosting_platform` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`oauth_ids` text,
	`password` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `analytic_settings_campaign_id_unique` ON `analytic_settings` (`campaign_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `cart_user_id_unique` ON `cart` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `cart_item_cart_id_name_unique` ON `cart_item` (`cart_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `domain_name_unique` ON `domain` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `domain_purchase_form_info_user_id_unique` ON `domain_purchase_form_info` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_open_event_sequence_id_target_email_unique` ON `email_open_event` (`sequence_id`,`target_email`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_opt_out_event_target_email_campaign_id_unique` ON `email_opt_out_event` (`target_email`,`campaign_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `google_tokens_google_id_unique` ON `google_tokens` (`google_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `google_user_info_email_unique` ON `google_user_info` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `google_user_info_google_id_unique` ON `google_user_info` (`google_id`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `post` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `splitbox_compute_id_on_hosting_platform_unique` ON `splitbox` (`compute_id_on_hosting_platform`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);