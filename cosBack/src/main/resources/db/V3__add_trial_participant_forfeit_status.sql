ALTER TABLE trial_participant
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE trial_participant
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

UPDATE trial_participant
SET status = 'ACTIVE'
WHERE status IS NULL;
