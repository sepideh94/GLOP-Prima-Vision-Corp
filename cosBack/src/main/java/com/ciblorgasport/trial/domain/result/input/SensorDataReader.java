package com.ciblorgasport.trial.domain.result.input;

import java.util.List;

/**
 * Port secondaire (interface de sortie) pour la lecture de données capteur.
 * L'implémentation concrète (fichier JSON, endpoint simulé...) est fournie
 * par la couche infrastructure, sans que le domaine en soit dépendant.
 */
public interface SensorDataReader {

    /**
     * Lit les données capteur pour une épreuve donnée.
     *
     * @param trialId identifiant de l'épreuve
     * @return liste de données brutes mesurées par le capteur
     */
    List<SensorData> readForTrial(Long trialId);
}
