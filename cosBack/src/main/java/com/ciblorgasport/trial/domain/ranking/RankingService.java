package com.ciblorgasport.trial.domain.ranking;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ciblorgasport.trial.domain.result.Result;

/**
 * Service de domaine calculant le classement d'une épreuve.
 * <p>
 * Règle ex aequo (olympique) : deux participants ex aequo en position 1
 * reçoivent tous deux le rang 1, et le rang suivant attribué est 3
 * (le rang 2 est sauté).
 * <p>
 * Exemple :
 * <pre>
 *   performances : 10.01 / 10.01 / 10.05
 *   rangs        :    1  /    1  /    3
 * </pre>
 * Le tri est délégué à chaque implémentation de {@link com.ciblorgasport.trial.domain.result.Performance}
 * via {@code compareTo}, sans aucun if/else sur le type.
 */
@Service
public class RankingService {

    /**
     * Trie les résultats par performance, attribue les rangs et marque les ex aequo.
     *
     * @param results liste brute des résultats (rank et tie ignorés en entrée)
     * @return nouvelle liste triée avec rank et tie renseignés
     */
    public List<Result> rank(List<Result> results) {
        if (results.isEmpty()) return List.of();

        List<Result> sorted = new ArrayList<>(results);
        sorted.sort((a, b) -> a.getPerformance().compareTo(b.getPerformance()));

        int position = 1;
        for (int i = 0; i < sorted.size(); i++) {
            Result current = sorted.get(i);
            if (i > 0) {
                Result previous = sorted.get(i - 1);
                boolean exAequo = current.getPerformance().compareTo(previous.getPerformance()) == 0;
                if (exAequo) {
                    current.setRank(previous.getRank()); // même rang
                    current.setTie(true);
                    previous.setTie(true);
                } else {
                    current.setRank(position); // rang = position réelle (ex aequo précédents comptent)
                }
            } else {
                current.setRank(1);
            }
            position++;
        }

        return sorted;
    }
}
