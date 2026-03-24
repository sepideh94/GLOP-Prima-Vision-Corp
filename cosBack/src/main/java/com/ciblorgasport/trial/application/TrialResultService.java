package com.ciblorgasport.trial.application;

import java.util.List;

import com.ciblorgasport.trial.dto.CompetitionResultsResponse;
import com.ciblorgasport.trial.dto.PublicCompetitionSummaryResponse;
import com.ciblorgasport.trial.dto.ResultResponse;

public interface TrialResultService {

    List<ResultResponse> getResultsByTrialId(Long trialId);

    /** Resultats de l'athlete (participation directe ou via equipe), toutes epreuves. */
    List<ResultResponse> getResultsByAthleteId(Long athleteId);

    /**
     * Resultats des autres participants aux memes epreuves que l'athlete
     * (meme demi-serie / meme epreuve programme), sans ses propres performances.
     */
    List<ResultResponse> getCompetitorResultsByAthleteId(Long athleteId);

    /** Resultats de toutes les epreuves d'une competition, groupes par epreuve. */
    List<CompetitionResultsResponse> getResultsByCompetitionId(Long competitionId);

    /** Liste publique des competitions qui ont au moins un resultat. */
    List<PublicCompetitionSummaryResponse> getPublicCompetitionsWithResults();
}
