ALTER TABLE "papernotes_organisation_users" ADD COLUMN "role" "roles_enum";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "papernotes_projects" ADD CONSTRAINT "papernotes_projects_user_id_papernotes_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "papernotes_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
