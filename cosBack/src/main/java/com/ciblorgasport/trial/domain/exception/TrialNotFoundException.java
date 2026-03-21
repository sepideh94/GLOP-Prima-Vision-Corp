package com.ciblorgasport.trial.domain.exception;

public class TrialNotFoundException extends RuntimeException {

    public TrialNotFoundException(Long id) {
        super("Épreuve introuvable avec l'ID: " + id);
    }
}
