ALTER TABLE "papernotes_organisation_users" RENAME TO "papernotes_memberships";--> statement-breakpoint
ALTER TABLE "papernotes_organisation_team_users" DROP CONSTRAINT "papernotes_organisation_team_users_organisation_user_id_papernotes_organisation_users_id_fk";
--> statement-breakpoint
ALTER TABLE "papernotes_memberships" DROP CONSTRAINT "papernotes_organisation_users_organisation_id_papernotes_organisations_id_fk";
--> statement-breakpoint
ALTER TABLE "papernotes_memberships" DROP CONSTRAINT "papernotes_organisation_users_user_id_papernotes_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "papernotes_organisation_team_users" ADD CONSTRAINT "papernotes_organisation_team_users_organisation_user_id_papernotes_memberships_id_fk" FOREIGN KEY ("organisation_user_id") REFERENCES "papernotes_memberships"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "papernotes_memberships" ADD CONSTRAINT "papernotes_memberships_organisation_id_papernotes_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "papernotes_organisations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "papernotes_memberships" ADD CONSTRAINT "papernotes_memberships_user_id_papernotes_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "papernotes_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
