CREATE TABLE `rooms` (
	`id` varchar(128) NOT NULL,
	`server_id` varchar(32) NOT NULL,
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `servers` (
	`id` varchar(36) NOT NULL,
	`connection` varchar(2048) NOT NULL,
	`discord_url_mapping` varchar(2048) NOT NULL,
	`max_rooms` int unsigned NOT NULL,
	CONSTRAINT `servers_id` PRIMARY KEY(`id`)
);
