ALTER TABLE public.spectator
ADD COLUMN IF NOT EXISTS ticket_document_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_spectator_ticket_document'
    ) THEN
        ALTER TABLE public.spectator
        ADD CONSTRAINT fk_spectator_ticket_document
        FOREIGN KEY (ticket_document_id)
        REFERENCES public.document(id);
    END IF;
END $$;