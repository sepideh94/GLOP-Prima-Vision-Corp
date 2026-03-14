package com.ciblorgasport.common.exception;

import com.ciblorgasport.common.model.Status;

public class TrialNotCompletedException extends RuntimeException {

    public TrialNotCompletedException(Long trialId, Status currentStatus) {
        super("Impossible d'enregistrer un résultat : l'épreuve " + trialId
                + " n'est pas terminée (statut actuel : " + currentStatus.getLabel() + ").");
    }
}
