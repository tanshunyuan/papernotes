CREATE TABLE IF NOT EXISTS "papernotes_organisation_team_members" (
	"organisation_team_id" text NOT NULL,
	"membership_id" text NOT NULL,
	"joined_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"left_at" timestamp,
	CONSTRAINT "papernotes_organisation_team_members_organisation_team_id_membership_id_pk" PRIMARY KEY("organisation_team_id","membership_id")
);
--> statement-breakpoint
DROP TABLE "papernotes_organisation_team_users";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "papernotes_organisation_team_members" ADD CONSTRAINT "papernotes_organisation_team_members_organisation_team_id_papernotes_organisation_teams_id_fk" FOREIGN KEY ("organisation_team_id") REFERENCES "papernotes_organisation_teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "papernotes_organisation_team_members" ADD CONSTRAINT "papernotes_organisation_team_members_membership_id_papernotes_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "papernotes_memberships"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
