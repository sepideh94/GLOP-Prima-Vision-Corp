-- Fix activation_token_type_check constraint to include INVITE_ATHLETE
-- The CHECK constraint was created before INVITE_ATHLETE was added to the TokenType enum.
-- Run: docker exec -i ciblorgasport-postgres psql -U postgres -d ciblorgasport < cosBack/src/main/resources/db/V2__fix_activation_token_type_check.sql

ALTER TABLE activation_token DROP CONSTRAINT IF EXISTS activation_token_type_check;

ALTER TABLE activation_token
    ADD CONSTRAINT activation_token_type_check
    CHECK (type IN ('ACTIVATION', 'PASSWORD_RESET', 'INVITE_COMMISSIONNER', 'INVITE_ATHLETE'));
