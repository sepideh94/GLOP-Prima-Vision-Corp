-- Align schema of trial_participant with TrialParticipant entity mapping.
-- Current DB appears to have athlete_id only; the backend expects:
-- competitor_id, competitor_type, status.
--
-- Strategy:
-- - Add missing columns (IF NOT EXISTS)
-- - Backfill competitor_id from athlete_id (existing rows are ATHLETE)
-- - Make athlete_id nullable (so TEAM rows can be inserted later)
-- - Replace legacy unique constraint (trial_id, athlete_id) with
--   (trial_id, competitor_id, competitor_type)

BEGIN;

ALTER TABLE trial_participant
    ADD COLUMN IF NOT EXISTS competitor_id BIGINT;

ALTER TABLE trial_participant
    ADD COLUMN IF NOT EXISTS competitor_type VARCHAR(20) NOT NULL DEFAULT 'ATHLETE';

ALTER TABLE trial_participant
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

-- Backfill competitor_id for existing rows (athlete-only schema)
UPDATE trial_participant
SET competitor_id = athlete_id
WHERE competitor_id IS NULL;

-- Enforce non-null for the backend mapping
ALTER TABLE trial_participant
    ALTER COLUMN competitor_id SET NOT NULL;

-- Allow TEAM participants (the entity does not use athlete_id anymore)
ALTER TABLE trial_participant
    ALTER COLUMN athlete_id DROP NOT NULL;

-- Remove legacy uniqueness (known name from current DB)
ALTER TABLE trial_participant
    DROP CONSTRAINT IF EXISTS ukliiekvf7tuu3uyd8xrvbu2a3s;

-- Add expected uniqueness
ALTER TABLE trial_participant
    ADD CONSTRAINT uq_trial_participant_trial_competitor UNIQUE (trial_id, competitor_id, competitor_type);

COMMIT;

