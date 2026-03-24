-- Multi-billets spectateurs: table de jointure + reprise de l'existant.
-- PostgreSQL

BEGIN;

CREATE TABLE IF NOT EXISTS public.spectator_ticket_documents (
    spectator_id BIGINT NOT NULL,
    document_id BIGINT NOT NULL
);

-- Index/contraintes de base
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'pk_spectator_ticket_documents'
    ) THEN
        ALTER TABLE public.spectator_ticket_documents
            ADD CONSTRAINT pk_spectator_ticket_documents
            PRIMARY KEY (spectator_id, document_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_spectator_ticket_docs_spectator'
    ) THEN
        ALTER TABLE public.spectator_ticket_documents
            ADD CONSTRAINT fk_spectator_ticket_docs_spectator
            FOREIGN KEY (spectator_id)
            REFERENCES public.spectator(id)
            ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_spectator_ticket_docs_document'
    ) THEN
        ALTER TABLE public.spectator_ticket_documents
            ADD CONSTRAINT fk_spectator_ticket_docs_document
            FOREIGN KEY (document_id)
            REFERENCES public.document(id)
            ON DELETE CASCADE;
    END IF;
END $$;

-- Un document ne peut appartenir qu'à un seul spectateur
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uk_spectator_ticket_docs_document'
    ) THEN
        ALTER TABLE public.spectator_ticket_documents
            ADD CONSTRAINT uk_spectator_ticket_docs_document
            UNIQUE (document_id);
    END IF;
END $$;

-- Reprise des billets historiques (ancien champ spectator.ticket_document_id)
INSERT INTO public.spectator_ticket_documents (spectator_id, document_id)
SELECT s.id, s.ticket_document_id
FROM public.spectator s
WHERE s.ticket_document_id IS NOT NULL
ON CONFLICT (spectator_id, document_id) DO NOTHING;

COMMIT;
