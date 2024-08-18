BEGIN;
	
UPDATE papernotes_projects p
SET organisation_id = ou.organisation_id
FROM papernotes_organisation_users ou
WHERE p.user_id = ou.user_id
AND p.organisation_id IS NULL;

COMMIT;
