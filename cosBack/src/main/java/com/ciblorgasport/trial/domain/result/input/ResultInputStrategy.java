package com.ciblorgasport.trial.domain.result.input;

import java.util.List;

import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.result.Result;

/**
 * Strategy Pattern pour la collecte des résultats d'une épreuve.
 * Abstrait la source des données (saisie manuelle, capteur...).
 * <p>
 * Pour ajouter une nouvelle source : implémenter cette interface
 * sans modifier le use case {@link com.ciblorgasport.trial.application.RecordTrialResultsUseCase}.
 */
public interface ResultInputStrategy {

    /**
     * Collecte et transforme les performances brutes en objets {@link Result}.
     * Les résultats retournés n'ont pas encore de rang (calculé ensuite par le classement).
     *
     * @param trial l'épreuve pour laquelle on collecte les résultats
     * @return liste de résultats sans rang
     */
    List<Result> collect(Trial trial);
}
