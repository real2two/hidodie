CREATE TABLE `rooms` (
	`id` varchar(128) NOT NULL,
	`server_id` varchar(32),
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `servers` (
	`id` varchar(32) NOT NULL,
	`fqdn` varchar(255),
	`discord_url_mapping` varchar(2048),
	CONSTRAINT `servers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `rooms` ADD CONSTRAINT `rooms_server_id_servers_id_fk` FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON DELETE no action ON UPDATE no action;