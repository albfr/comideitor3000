CREATE TABLE `categorias` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`limite_semanal` integer,
	`orden` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dias` (
	`fecha` text PRIMARY KEY NOT NULL,
	`almuerzo_id` text NOT NULL,
	`ensalada_id` text NOT NULL,
	`sustituto_id` text,
	`comensales` integer DEFAULT 3 NOT NULL,
	FOREIGN KEY (`almuerzo_id`) REFERENCES `recetas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ensalada_id`) REFERENCES `recetas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sustituto_id`) REFERENCES `ingredientes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ingredientes` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`pasillo` text NOT NULL,
	`grupo` text,
	`basico_despensa` integer DEFAULT false NOT NULL,
	`unidad_singular` text,
	`unidad_plural` text,
	`gramos_por_unidad` real,
	`gramos_por_cucharada` real
);
--> statement-breakpoint
CREATE TABLE `receta_ingredientes` (
	`receta_id` text NOT NULL,
	`orden` integer NOT NULL,
	`ingrediente_id` text NOT NULL,
	`cantidad` real,
	`unidad` text,
	`opcional` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`receta_id`, `orden`),
	FOREIGN KEY (`receta_id`) REFERENCES `recetas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ingrediente_id`) REFERENCES `ingredientes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recetas` (
	`id` text PRIMARY KEY NOT NULL,
	`tipo` text NOT NULL,
	`nombre` text NOT NULL,
	`categoria_id` text,
	`dificultad` text NOT NULL,
	`tiempo_minutos` integer,
	`imagen_url` text,
	`preparacion` text NOT NULL,
	`eliminada_en` text,
	FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `semanas` (
	`inicio` text PRIMARY KEY NOT NULL,
	`propuestas` text,
	`propuestas_desde` text,
	`seleccionada` integer
);
--> statement-breakpoint
CREATE TABLE `sustitutos_carne` (
	`ingrediente_id` text PRIMARY KEY NOT NULL,
	`gramos_por_porcion` real NOT NULL,
	FOREIGN KEY (`ingrediente_id`) REFERENCES `ingredientes`(`id`) ON UPDATE no action ON DELETE no action
);
