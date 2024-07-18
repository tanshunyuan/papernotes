CREATE TABLE IF NOT EXISTS "papernotes_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "papernotes_post" ("name");