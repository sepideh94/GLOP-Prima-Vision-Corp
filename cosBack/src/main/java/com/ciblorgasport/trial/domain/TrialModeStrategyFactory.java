package com.ciblorgasport.trial.domain;

import java.util.EnumMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.ciblorgasport.common.exception.BusinessValidationException;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

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
@RequiredArgsConstructor
public final class TrialModeStrategyFactory {

	private final IndividualTrialModeStrategy individualStrategy;
    private final TeamTrialModeStrategy teamStrategy; 

    private static final Map<TrialMode, TrialModeStrategy> STRATEGIES = new EnumMap<>(TrialMode.class);

    @PostConstruct
    public void init() {
        STRATEGIES.put(TrialMode.INDIVIDUAL, individualStrategy);
        STRATEGIES.put(TrialMode.TEAM, teamStrategy); 
    }

    /**
     * Retourne la stratégie associée au mode donné.
     *
     * @param mode le mode d'épreuve (non null)
     * @return la stratégie correspondante
     * @throws IllegalArgumentException si aucune stratégie n'est définie pour ce mode
     */
    public static TrialModeStrategy getStrategy(TrialMode mode) {
        TrialModeStrategy strategy = STRATEGIES.get(mode);
        if (strategy == null) {
            throw new BusinessValidationException(
                "Aucune stratégie définie pour le mode d'épreuve : " + mode
                + ". Vérifiez que ce mode est enregistré dans TrialModeStrategyFactory.");
        }
        return strategy;
    }
}
