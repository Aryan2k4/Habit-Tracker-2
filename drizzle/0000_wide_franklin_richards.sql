CREATE TABLE `circles` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `circles_code_unique` ON `circles` (`code`);--> statement-breakpoint
CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`why` text DEFAULT '' NOT NULL,
	`color` text DEFAULT 'sage' NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `goals_owner` ON `goals` (`owner`);--> statement-breakpoint
CREATE TABLE `habits` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`goal` text NOT NULL,
	`milestone` text NOT NULL,
	`name` text NOT NULL,
	`days` text NOT NULL,
	`time` text DEFAULT '' NOT NULL,
	`created` text NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`goal`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `habits_owner` ON `habits` (`owner`);--> statement-breakpoint
CREATE TABLE `journals` (
	`owner` text NOT NULL,
	`date` text NOT NULL,
	`mood` integer NOT NULL,
	`body` text NOT NULL,
	PRIMARY KEY(`owner`, `date`)
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`owner` text NOT NULL,
	`habit` text NOT NULL,
	`date` text NOT NULL,
	PRIMARY KEY(`owner`, `habit`, `date`),
	FOREIGN KEY (`habit`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `members` (
	`circle` text NOT NULL,
	`owner` text NOT NULL,
	PRIMARY KEY(`circle`, `owner`),
	FOREIGN KEY (`circle`) REFERENCES `circles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`owner` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pot` text DEFAULT 'clay' NOT NULL,
	`plant` text DEFAULT 'cosmos' NOT NULL,
	`timezone` text DEFAULT 'Asia/Kolkata' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`started` integer NOT NULL,
	`minutes` integer NOT NULL,
	`date` text NOT NULL,
	`finished` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sessions_owner` ON `sessions` (`owner`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`priority` text NOT NULL,
	`done` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tasks_owner` ON `tasks` (`owner`);