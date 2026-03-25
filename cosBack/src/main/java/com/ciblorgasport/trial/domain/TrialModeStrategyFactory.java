package com.ciblorgasport.trial.domain;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

/**
 * Factory du Strategy Pattern pour les modes d'épreuve.
 * <p>
 * Transforme l'enum {@link TrialMode} (persisté en base) en
 * {@link TrialModeStrategy} (logique métier), sans exposer les
 * implémentations concrètes au reste du domaine.
 * <p>
 * Pour ajouter un nouveau mode :
 * <ol>
 *   <li>Ajouter la valeur dans {@link TrialMode}</li>
 *   <li>Créer l'implémentation {@link TrialModeStrategy} correspondante</li>
 *   <li>L'enregistrer dans {@link #STRATEGIES}</li>
 * </ol>
 * Aucun service métier n'a besoin d'être modifié.
 */
@Component
public final class TrialModeStrategyFactory {

    private final Map<TrialMode, TrialModeStrategy> strategies = new EnumMap<>(TrialMode.class);

    public TrialModeStrategyFactory(List<TrialModeStrategy> strategies) {
        for (TrialModeStrategy strategy : strategies) {
            TrialMode mode = strategy.getMode();
            if (this.strategies.containsKey(mode)) {
                throw new IllegalStateException("Stratégie dupliquée pour le mode : " + mode);
            }
            this.strategies.put(mode, strategy);
        }
    }

    /**
     * Retourne la stratégie associée au mode donné.
     *
     * @param mode le mode d'épreuve (non null)
     * @return la stratégie correspondante
     * @throws IllegalArgumentException si aucune stratégie n'est définie pour ce mode
     */
    public TrialModeStrategy getStrategy(TrialMode mode) {
        TrialModeStrategy strategy = strategies.get(mode);
        if (strategy == null) {
            throw new IllegalArgumentException(
                "Aucune stratégie définie pour le mode d'épreuve : " + mode
                + ". Vérifiez que ce mode est enregistré dans TrialModeStrategyFactory.");
        }
        return strategy;
    }
}
