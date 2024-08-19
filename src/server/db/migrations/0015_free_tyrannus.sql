DO $$ BEGIN
 CREATE TYPE "organisation_type_enum" AS ENUM('PERSONAL', 'COMPANY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "papernotes_organisations" ADD COLUMN "organisation_type" "organisation_type_enum";