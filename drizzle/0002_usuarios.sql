CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_dias` (
	`usuario_id` text NOT NULL,
	`fecha` text NOT NULL,
	`almuerzo_id` text NOT NULL,
	`ensalada_id` text NOT NULL,
	`sustituto_id` text,
	`comensales` integer DEFAULT 3 NOT NULL,
	`vegetarianos` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`usuario_id`, `fecha`),
	FOREIGN KEY (`almuerzo_id`) REFERENCES `recetas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ensalada_id`) REFERENCES `recetas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sustituto_id`) REFERENCES `ingredientes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_dias`("usuario_id", "fecha", "almuerzo_id", "ensalada_id", "sustituto_id", "comensales", "vegetarianos") SELECT '__sin_usuario__', "fecha", "almuerzo_id", "ensalada_id", "sustituto_id", "comensales", "vegetarianos" FROM `dias`;--> statement-breakpoint
DROP TABLE `dias`;--> statement-breakpoint
ALTER TABLE `__new_dias` RENAME TO `dias`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_semanas` (
	`usuario_id` text NOT NULL,
	`inicio` text NOT NULL,
	`propuestas` text,
	`propuestas_desde` text,
	`seleccionada` integer,
	PRIMARY KEY(`usuario_id`, `inicio`)
);
--> statement-breakpoint
INSERT INTO `__new_semanas`("usuario_id", "inicio", "propuestas", "propuestas_desde", "seleccionada") SELECT '__sin_usuario__', "inicio", "propuestas", "propuestas_desde", "seleccionada" FROM `semanas`;--> statement-breakpoint
DROP TABLE `semanas`;--> statement-breakpoint
ALTER TABLE `__new_semanas` RENAME TO `semanas`;