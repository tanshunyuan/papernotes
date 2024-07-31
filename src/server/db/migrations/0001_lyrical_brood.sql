DO $$ BEGIN
 CREATE TYPE "roles_enum" AS ENUM('ADMIN', 'MEMBER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "papernotes_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"role" "roles_enum" DEFAULT 'MEMBER'
);
--> statement-breakpoint
DROP TABLE "papernotes_post";