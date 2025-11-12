CREATE TABLE `credit_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`credit_id` integer NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`description` text,
	`transaction_date` integer DEFAULT (unixepoch()) NOT NULL,
	`due_date` integer,
	FOREIGN KEY (`credit_id`) REFERENCES `credits`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `credits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_name` text NOT NULL,
	`client_type` text DEFAULT 'garage',
	`total_owed` real DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`employee_type` text NOT NULL,
	`shop` text,
	`base_salary` integer,
	`daily_rate` real,
	`qualifications` text,
	`start_date` integer DEFAULT (unixepoch()) NOT NULL,
	`is_active` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`shop` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`min_threshold` integer DEFAULT 5,
	`last_updated` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payroll` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`employee_id` integer NOT NULL,
	`pay_period` text NOT NULL,
	`base_pay` real,
	`transport_allowance` real DEFAULT 0,
	`meal_allowance` real DEFAULT 0,
	`uniform_deduction` real DEFAULT 0,
	`total_pay` real NOT NULL,
	`pay_date` integer DEFAULT (unixepoch()) NOT NULL,
	`is_paid` integer DEFAULT 0,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`sku` text,
	`category` text,
	`unit_price` real NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE TABLE `sales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`shop` text NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	`total_amount` real NOT NULL,
	`sale_date` integer DEFAULT (unixepoch()) NOT NULL,
	`notes` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
