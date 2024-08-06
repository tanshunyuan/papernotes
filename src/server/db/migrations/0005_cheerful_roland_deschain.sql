CREATE TABLE IF NOT EXISTS "papernotes_organisations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"plan_duration_start" timestamp NOT NULL,
	"plan_duration_end" timestamp NOT NULL,
	"max_seats" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "papernotes_organisation_users" (
	"id" text PRIMARY KEY NOT NULL,
	"organisation_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "papernotes_organisation_users" ADD CONSTRAINT "papernotes_organisation_users_organisation_id_papernotes_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "papernotes_organisations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "papernotes_organisation_users" ADD CONSTRAINT "papernotes_organisation_users_user_id_papernotes_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "papernotes_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
