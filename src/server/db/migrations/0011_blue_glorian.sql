ALTER TABLE "papernotes_projects" ADD COLUMN "organisation_id" text;--> statement-breakpoint
ALTER TABLE "papernotes_projects" ADD COLUMN "organisation_team_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "papernotes_projects" ADD CONSTRAINT "papernotes_projects_organisation_id_papernotes_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "papernotes_organisations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "papernotes_projects" ADD CONSTRAINT "papernotes_projects_organisation_team_id_papernotes_organisation_teams_id_fk" FOREIGN KEY ("organisation_team_id") REFERENCES "papernotes_organisation_teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
