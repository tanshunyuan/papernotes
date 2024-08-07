DO $$ BEGIN
 CREATE TYPE "user_plan_enum" AS ENUM('FREE', 'ENTERPRISE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "papernotes_users" RENAME COLUMN "role" TO "user_plan";--> statement-breakpoint
ALTER TABLE "papernotes_users" ALTER COLUMN "user_plan" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "papernotes_users" ALTER COLUMN "user_plan" SET DATA TYPE user_plan_enum USING ("user_plan"::text::user_plan_enum);--> statement-breakpoint
ALTER TABLE "papernotes_users" ALTER COLUMN "user_plan" SET DEFAULT 'FREE';
