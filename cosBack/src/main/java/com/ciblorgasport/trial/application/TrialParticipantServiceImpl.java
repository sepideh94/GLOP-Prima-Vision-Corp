package com.ciblorgasport.trial.application;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ciblorgasport.athlete.application.AthleteService;
import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.dto.AthleteResponse;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.trial.domain.Participant;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialModeStrategy;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.dto.TrialParticipantResponse;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import com.ciblorgasport.trial.round.domain.RoundName;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TrialParticipantServiceImpl implements TrialParticipantService {

    private final TrialRepository trialRepository;
    private final TrialParticipantRepository trialParticipantRepository;
    private final AthleteRepository athleteRepository;
    private final ParticipationRepository participationRepository;
    private final AthleteService athleteService;

    @Transactional
    @Override
    public List<TrialParticipantResponse> assignAthletes(Long trialId, List<Long> athleteIds) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new RuntimeException(
                    "Épreuve introuvable avec l'ID: " + trialId));

        if (trial.isCancelled()) {
            throw new IllegalStateException(
                "Impossible d'assigner des participants à une épreuve annulée.");
        }

        if (trial.hasStarted()) {
            throw new IllegalStateException(
                "Impossible d'assigner des participants à une série déjà commencée.");
        }

        // Seules les séries de qualification permettent l'assignation manuelle
        RoundName roundName = trial.getRound().getName();

        if (roundName == RoundName.DEMI_FINALE) {
            throw new IllegalStateException(
                "Les participants seront automatiquement déterminés "
                + "après les résultats des qualifications.");
        }

        if (roundName == RoundName.FINALE) {
            throw new IllegalStateException(
                "Les participants seront automatiquement déterminés "
                + "après les résultats des demi-finales.");
        }

        if (roundName != RoundName.QUALIFICATION_HEAT) {
            throw new IllegalStateException(
                "L'assignation manuelle de participants n'est autorisée "
                + "que pour les séries de qualification.");
        }

        // Résoudre la stratégie une seule fois pour toute l'opération
        TrialModeStrategy strategy = trial.getModeStrategy();

        // Dédupliquer les IDs en entrée
        List<Long> uniqueAthleteIds = athleteIds.stream().distinct().toList();

        // Vérifier le cap via la stratégie (plus de constante hardcodée)
        long currentCount = trialParticipantRepository.countByTrialId(trialId);
        int maxPerHeat = strategy.getMaxParticipantsPerHeat();

        if (currentCount + uniqueAthleteIds.size() > maxPerHeat) {
            throw new IllegalArgumentException(
                "Le nombre maximum de " + strategy.getParticipantTypeLabel()
                + "s par série est de " + maxPerHeat
                + ". Actuellement " + currentCount
                + " " + strategy.getParticipantTypeLabel() + "(s) assigné(s), "
                + "impossible d'en ajouter " + uniqueAthleteIds.size() + ".");
        }

        List<TrialParticipant> newParticipants = new ArrayList<>();

        for (Long athleteId : uniqueAthleteIds) {
            Athlete athlete = athleteRepository.findById(athleteId)
                    .orElseThrow(() -> new RuntimeException(
                        "Athlète introuvable avec l'ID: " + athleteId));

            // Adapter Athlete → Participant (couche applicative)
            // et déléguer la validation du type à la stratégie
            strategy.validateParticipant(toParticipant(athlete));

            // L'athlète doit avoir une participation CONFIRMED pour cette compétition
            boolean hasConfirmedParticipation =
                participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                    trial.getCompetition().getId(),
                    athleteId,
                    CompetitorType.ATHLETE,
                    ParticipationStatus.CONFIRMED);

            if (!hasConfirmedParticipation) {
                throw new IllegalArgumentException(
                    "L'athlète " + athlete.getDisplayName()
                    + " n'a pas de participation confirmée pour cette compétition.");
            }

            if (trialParticipantRepository.existsByTrialIdAndAthleteId(trialId, athleteId)) {
                throw new IllegalArgumentException(
                    "L'athlète " + athlete.getDisplayName()
                    + " est déjà assigné(e) à cette série.");
            }

            if (trialParticipantRepository.existsByAthleteInQualificationHeat(
                    athleteId,
                    trial.getCompetition().getId(),
                    trial.getTrialName(),
                    trial.getCategoryGender())) {
                throw new IllegalArgumentException(
                    "L'athlète " + athlete.getDisplayName()
                    + " est déjà assigné(e) à une autre série de qualification pour cette épreuve.");
            }

            newParticipants.add(TrialParticipant.builder()
                    .trial(trial)
                    .athlete(athlete)
                    .build());
        }

        List<TrialParticipant> saved = trialParticipantRepository.saveAll(newParticipants);

        return saved.stream()
                .map(TrialParticipantResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public List<TrialParticipantResponse> getByTrialId(Long trialId) {
        if (!trialRepository.existsById(trialId)) {
            throw new RuntimeException("Épreuve introuvable avec l'ID: " + trialId);
        }
        return trialParticipantRepository.findByTrialId(trialId).stream()
                .map(TrialParticipantResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public void removeAthlete(Long trialId, Long athleteId) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new RuntimeException(
                    "Épreuve introuvable avec l'ID: " + trialId));

        if (trial.hasStarted()) {
            throw new IllegalStateException(
                "Impossible de retirer un athlète d'une série déjà commencée.");
        }

        TrialParticipant tp = trialParticipantRepository.findByTrialId(trialId).stream()
                .filter(p -> p.getAthlete().getId().equals(athleteId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                    "Cet athlète n'est pas assigné à cette série."));

        trialParticipantRepository.delete(tp);
    }

    @Transactional
    @Override
    public List<AthleteResponse> getEligibleAthletes(Long trialId) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new RuntimeException("Épreuve introuvable avec l'ID: " + trialId));

        RoundName roundName = trial.getRound().getName();

        if (roundName == RoundName.QUALIFICATION_HEAT) {
            return athleteService.getAthletesByCompetition(trial.getCompetition().getId());
        }

        RoundName previousRound = (roundName == RoundName.DEMI_FINALE)
                ? RoundName.QUALIFICATION_HEAT
                : RoundName.DEMI_FINALE;

        return trialParticipantRepository.findAthletesByPreviousRound(
                trial.getCompetition(),
                trial.getTrialName(),
                trial.getCategoryGender(),
                previousRound
        ).stream()
                .map(AthleteResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Adapte une entité {@link Athlete} vers l'interface {@link Participant} du domaine trial.
     * Ce mapping est la responsabilité de la couche applicative : il isole le domaine trial
     * de la structure concrète de l'entité Athlete.
     */
    private Participant toParticipant(Athlete athlete) {
        return new Participant() {
            @Override public Long getId() { return athlete.getId(); }
            @Override public String getDisplayName() { return athlete.getDisplayName(); }
            @Override public CompetitorType getCompetitorType() { return CompetitorType.ATHLETE; }
        };
    }
}
