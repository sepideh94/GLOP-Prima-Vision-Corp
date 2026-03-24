-- Aligne la contrainte CHECK avec les valeurs actuelles de NotificationType
ALTER TABLE notification
DROP CONSTRAINT IF EXISTS notification_type_check;

ALTER TABLE notification
ADD CONSTRAINT notification_type_check
CHECK (
    type IN (
        'ACCREDITATION_VALIDATED',
        'ACCREDITATION_REFUSED',
        'ACCREDITATION_SUBMITTED',
        'PARTICIPATION_SUBMITTED',
        'PARTICIPATION_VALIDATED',
        'PARTICIPATION_REFUSED',
        'TEAM_PARTICIPATION_VALIDATED',
        'INCIDENT',
        'COMPETITION_RESULTS'
    )
);
