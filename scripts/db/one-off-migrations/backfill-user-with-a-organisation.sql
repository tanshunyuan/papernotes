BEGIN;

-- Create a temporary table to store intermediate results
CREATE TEMPORARY TABLE temp_new_organisations AS
SELECT 
  gen_random_uuid() AS id,
  'Personal Organization' AS name,
  'Personal organization for ' || u.name AS description,
  CURRENT_TIMESTAMP AS plan_duration_start,
  CURRENT_TIMESTAMP + INTERVAL '90 years' AS plan_duration_end,
  1 AS max_seats,
  CURRENT_TIMESTAMP AS created_at,
  CURRENT_TIMESTAMP AS updated_at,
  u.id AS user_id
FROM papernotes_users u
LEFT JOIN papernotes_organisation_users ou ON u.id = ou.user_id
WHERE ou.id IS NULL;

-- Insert into the target table using the temporary table
INSERT INTO papernotes_organisations (id, name, description, plan_duration_start, plan_duration_end, max_seats, created_at, updated_at)
SELECT id, name, description, plan_duration_start, plan_duration_end, max_seats, created_at, updated_at
FROM temp_new_organisations;

-- Associate users with their personal organizations
INSERT INTO papernotes_organisation_users (id, organisation_id, user_id, role, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  tno.id,
  tno.user_id,
  'ADMIN',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM temp_new_organisations tno;

-- Verify the inserted data
SELECT * 
FROM papernotes_users pu
LEFT JOIN papernotes_organisation_users pou ON pu.id = pou.user_id 
LEFT JOIN papernotes_organisations po ON pou.organisation_id = po.id;

DROP TABLE IF EXISTS temp_new_organisations;

COMMIT;