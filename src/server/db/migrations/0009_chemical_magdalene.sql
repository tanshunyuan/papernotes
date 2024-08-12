CREATE TABLE IF NOT EXISTS "papernotes_organisation_resource_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"configuration" json NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "papernotes_organisation_resource_limits_org_id_unique" UNIQUE("org_id")
);
--> statement-breakpoint
ALTER TABLE "papernotes_organisation_users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "papernotes_organisation_resource_limits" ADD CONSTRAINT "papernotes_organisation_resource_limits_org_id_papernotes_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "papernotes_organisations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
