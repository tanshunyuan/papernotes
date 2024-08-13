CREATE TABLE IF NOT EXISTS "papernotes_organisation_team_users" (
	"organisation_id" text NOT NULL,
	"organisation_user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"left_at" timestamp,
	CONSTRAINT "papernotes_organisation_team_users_organisation_id_organisation_user_id_pk" PRIMARY KEY("organisation_id","organisation_user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "papernotes_organisation_teams" (
	"id" text PRIMARY KEY NOT NULL,
	"organisation_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "papernotes_organisation_team_users" ADD CONSTRAINT "papernotes_organisation_team_users_organisation_id_papernotes_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "papernotes_organisations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "papernotes_organisation_team_users" ADD CONSTRAINT "papernotes_organisation_team_users_organisation_user_id_papernotes_organisation_users_id_fk" FOREIGN KEY ("organisation_user_id") REFERENCES "papernotes_organisation_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "papernotes_organisation_teams" ADD CONSTRAINT "papernotes_organisation_teams_organisation_id_papernotes_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "papernotes_organisations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
