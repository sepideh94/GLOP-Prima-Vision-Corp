-- Add missing column charter_accepted to participation (required by entity Participation).
-- Run once if the table was created before this field existed.
-- With Docker: docker exec -i ciblorgasport-postgres psql -U postgres -d ciblorgasport < cosBack/src/main/resources/db/V1__add_charter_accepted_to_participation.sql
-- Or: docker exec -i ciblorgasport-postgres psql -U postgres -d ciblorgasport -c "ALTER TABLE participation ADD COLUMN IF NOT EXISTS charter_accepted BOOLEAN NOT NULL DEFAULT false;"
ALTER TABLE participation ADD COLUMN IF NOT EXISTS charter_accepted BOOLEAN NOT NULL DEFAULT false;
