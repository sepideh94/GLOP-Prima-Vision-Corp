package com.ciblorgasport.trial.domain.exception;

/**
 * Lancée lorsqu'un commissaire tente de modifier des résultats
 * après la date de fin de l'épreuve.
 * <p>
 * Règle métier : la modification n'est autorisée que le jour même de l'épreuve
 * (comparaison sur {@code trial.endDate == LocalDate.now()}).
 */
public class ResultModificationNotAllowedException extends RuntimeException {

    public ResultModificationNotAllowedException(Long trialId) {
        super("La modification des résultats de l'épreuve " + trialId
                + " n'est plus autorisée : la date de l'épreuve est dépassée.");
    }
}
