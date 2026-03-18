package com.ciblorgasport.trial.application;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.athlete.application.AthleteService;
import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.dto.AthleteResponse;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.team.domain.Team;
import com.ciblorgasport.team.dto.TeamResponse;
import com.ciblorgasport.team.infrastructure.TeamRepository;
import com.ciblorgasport.trial.domain.Participant;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialModeStrategy;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.dto.AthleteSummary;
import com.ciblorgasport.trial.dto.TrialParticipantResponse;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import com.ciblorgasport.trial.round.domain.RoundName;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TrialParticipantServiceImpl implements TrialParticipantService {

    private final TrialRepository trialRepository;
    private final TrialParticipantRepository trialParticipantRepository;
    private final AthleteRepository athleteRepository;
    private final TeamRepository teamRepository;
    private final ParticipationRepository participationRepository;
    private final AthleteService athleteService;

    @Transactional
    @Override
    public List<TrialParticipantResponse> assignAthletes(Long trialId, List<Long> athleteIds) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new RuntimeException("Épreuve introuvable avec l'ID: " + trialId));

        validateTrialStateForAssignment(trial);

        TrialModeStrategy strategy = trial.getModeStrategy();
        List<Long> uniqueAthleteIds = athleteIds.stream().distinct().toList();

        long currentCount = trialParticipantRepository.countByTrialId(trialId);
        int maxPerHeat = strategy.getMaxParticipantsPerHeat();

        if (currentCount + uniqueAthleteIds.size() > maxPerHeat) {
            throw new IllegalArgumentException(
                    "Le nombre maximum de " + strategy.getParticipantTypeLabel()
                            + "s par série est de " + maxPerHeat
                            + ". Actuellement " + currentCount
                            + " " + strategy.getParticipantTypeLabel() + "(s) assigné(s), impossible d'en ajouter "
                            + uniqueAthleteIds.size() + ".");
        }

        List<TrialParticipant> newParticipants = new ArrayList<>();

        for (Long athleteId : uniqueAthleteIds) {
            Athlete athlete = athleteRepository.findById(athleteId)
                    .orElseThrow(() -> new RuntimeException("Athlète introuvable: " + athleteId));

            strategy.validateParticipant(toParticipant(athlete));

            boolean hasConfirmedParticipation =
                    participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                            trial.getCompetition().getId(),
                            athleteId,
                            CompetitorType.ATHLETE,
                            ParticipationStatus.CONFIRMED);

            if (!hasConfirmedParticipation) {
                throw new IllegalStateException(
                        "L'athlète " + athlete.getDisplayName()
                                + " n'a pas de participation CONFIRMED à la compétition.");
            }

            if (trialParticipantRepository.existsByTrialIdAndCompetitorIdAndCompetitorType(
                    trialId, athleteId, CompetitorType.ATHLETE)) {
                throw new IllegalStateException(
                        "L'athlète " + athlete.getDisplayName()
                                + " est déjà assigné à cette épreuve.");
            }

            newParticipants.add(TrialParticipant.builder()
                    .trial(trial)
                    .competitorId(athleteId)
                    .competitorType(CompetitorType.ATHLETE)
                    .build());
        }

        List<TrialParticipant> saved = trialParticipantRepository.saveAll(newParticipants);
        return saved.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrialParticipantResponse> getByTrialId(Long trialId) {
        if (!trialRepository.existsById(trialId)) {
            throw new RuntimeException("Épreuve introuvable avec l'ID: " + trialId);
        }

        return trialParticipantRepository.findByTrialId(trialId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public List<TrialParticipantResponse> getByAthleteId(Long athleteId) {
        return trialParticipantRepository.findByAthleteId(athleteId).stream()
                .map(TrialParticipantResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public void removeAthlete(Long trialId, Long athleteId) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new RuntimeException("Épreuve introuvable"));

        if (trial.hasStarted()) {
            throw new IllegalStateException("Série déjà commencée.");
        }

        TrialParticipant tp = trialParticipantRepository.findByTrialId(trialId).stream()
                .filter(p -> p.getCompetitorId().equals(athleteId) && p.getCompetitorType() == CompetitorType.ATHLETE)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Participant non trouvé."));

        trialParticipantRepository.delete(tp);
    }

    @Transactional
    @Override
    public void declareForfeit(Long trialParticipantId, Long athleteId) {
        TrialParticipant trialParticipant = trialParticipantRepository
                .findByIdAndAthleteId(trialParticipantId, athleteId)
                .orElseThrow(() -> new EntityNotFoundException("Participation à l'épreuve introuvable"));

        trialParticipant.declareForfeit();
        trialParticipantRepository.save(trialParticipant);
    }

    @Transactional
    @Override
    public List<AthleteResponse> getEligibleAthletes(Long trialId) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new RuntimeException("Épreuve introuvable"));

        return athleteService.getAthletesByCompetition(trial.getCompetition().getId());
    }

    private TrialParticipantResponse mapToResponse(TrialParticipant tp) {
        if (tp.getCompetitorType() == CompetitorType.TEAM) {
            return teamRepository.findById(tp.getCompetitorId())
                    .map(team -> {
                        List<AthleteSummary> members = team.getMembers().stream()
                                .map(athlete -> AthleteSummary.builder()
                                        .id(athlete.getId())
                                        .firstName(athlete.getFirstName())
                                        .lastName(athlete.getLastName())
                                        .build())
                                .collect(Collectors.toList());

                        return TrialParticipantResponse.fromEntity(tp, team.getName(), members);
                    })
                    .orElse(TrialParticipantResponse.fromEntity(tp, "Équipe inconnue"));
        } else {
            String displayName = athleteRepository.findById(tp.getCompetitorId())
                    .map(a -> a.getFirstName() + " " + a.getLastName())
                    .orElse("Athlète inconnu");

            return TrialParticipantResponse.fromEntity(tp, displayName);
        }
    }

    private void validateTrialStateForAssignment(Trial trial) {
        if (trial.hasStarted()) {
            throw new IllegalStateException(
                    "Impossible d'assigner des participants à une série déjà commencée.");
        }

        if (trial.isCancelled()) {
            throw new IllegalStateException("État de l'épreuve invalide pour l'assignation.");
        }

        RoundName roundName = trial.getRound().getName();

        if (roundName == RoundName.DEMI_FINALE) {
            throw new IllegalStateException(
                    "Les participants seront automatiquement déterminés après les résultats des qualifications.");
        }

        if (roundName == RoundName.FINALE) {
            throw new IllegalStateException(
                    "Les participants seront automatiquement déterminés après les résultats des demi-finales.");
        }

        if (roundName != RoundName.QUALIFICATION_HEAT) {
            throw new IllegalStateException(
                    "L'assignation manuelle de participants n'est autorisée que pour les séries de qualification.");
        }
    }

    private Participant toParticipant(Athlete athlete) {
        return new Participant() {
            @Override
            public Long getId() {
                return athlete.getId();
            }

            @Override
            public String getDisplayName() {
                return athlete.getDisplayName();
            }

            @Override
            public CompetitorType getCompetitorType() {
                return CompetitorType.ATHLETE;
            }
        };
    }

    @Transactional
    @Override
    public List<TrialParticipantResponse> assignTeams(Long trialId, List<Long> teamIds) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new RuntimeException("Épreuve introuvable"));

        validateTrialStateForAssignment(trial);

        TrialModeStrategy strategy = trial.getModeStrategy();
        List<Long> uniqueTeamIds = teamIds.stream().distinct().toList();

        long currentCount = trialParticipantRepository.countByTrialId(trialId);
        int maxPerHeat = strategy.getMaxParticipantsPerHeat();

        if (currentCount + uniqueTeamIds.size() > maxPerHeat) {
            throw new IllegalArgumentException("Nombre maximum d'équipes par série dépassé.");
        }

        List<TrialParticipant> newParticipants = new ArrayList<>();

        for (Long teamId : uniqueTeamIds) {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new RuntimeException("Équipe introuvable avec l'ID: " + teamId));

            strategy.validateParticipant(toParticipant(team));

            boolean hasConfirmedParticipation =
                    participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                            trial.getCompetition().getId(),
                            teamId,
                            CompetitorType.TEAM,
                            ParticipationStatus.CONFIRMED);

            if (!hasConfirmedParticipation) {
                throw new IllegalArgumentException(
                        "L'équipe " + team.getName() + " n'est pas confirmée pour cette compétition.");
            }

            if (trialParticipantRepository.existsByTrialIdAndCompetitorIdAndCompetitorType(
                    trialId, teamId, CompetitorType.TEAM)) {
                throw new IllegalArgumentException(
                        "L'équipe " + team.getName() + " est déjà assignée à cette série.");
            }

            newParticipants.add(TrialParticipant.builder()
                    .trial(trial)
                    .competitorId(teamId)
                    .competitorType(CompetitorType.TEAM)
                    .build());
        }

        List<TrialParticipant> saved = trialParticipantRepository.saveAll(newParticipants);
        return saved.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public void removeTeam(Long trialId, Long teamId) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new RuntimeException("Épreuve introuvable"));

        if (trial.hasStarted()) {
            throw new IllegalStateException("Série déjà commencée.");
        }

        TrialParticipant tp = trialParticipantRepository.findByTrialId(trialId).stream()
                .filter(p -> p.getCompetitorId().equals(teamId) && p.getCompetitorType() == CompetitorType.TEAM)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Équipe non trouvée dans cette épreuve."));

        trialParticipantRepository.delete(tp);
    }

    @Transactional(readOnly = true)
    @Override
    public List<TeamResponse> getEligibleTeams(Long trialId) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new RuntimeException("Épreuve introuvable"));

        List<Long> confirmedTeamIds = participationRepository
                .findByCompetition_Id(trial.getCompetition().getId())
                .stream()
                .filter(p -> p.getCompetitorType() == CompetitorType.TEAM && p.getStatus() == ParticipationStatus.CONFIRMED)
                .map(p -> p.getCompetitorId())
                .collect(Collectors.toList());

        List<Long> alreadyAssignedIds = trialParticipantRepository
                .findByTrialId(trialId)
                .stream()
                .filter(tp -> tp.getCompetitorType() == CompetitorType.TEAM)
                .map(TrialParticipant::getCompetitorId)
                .collect(Collectors.toList());

        confirmedTeamIds.removeAll(alreadyAssignedIds);

        if (confirmedTeamIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<Team> eligibleTeams = teamRepository.findAllById(confirmedTeamIds);

        return eligibleTeams.stream().map(team -> {
            List<AthleteSummary> members = team.getMembers().stream()
                    .map(athlete -> AthleteSummary.builder()
                            .id(athlete.getId())
                            .firstName(athlete.getFirstName())
                            .lastName(athlete.getLastName())
                            .build())
                    .collect(Collectors.toList());

            return TeamResponse.builder()
                    .id(team.getId())
                    .name(team.getName())
                    .members(members)
                    .build();
        }).collect(Collectors.toList());
    }

    private Participant toParticipant(Team team) {
        return new Participant() {
            @Override
            public Long getId() {
                return team.getId();
            }

            @Override
            public String getDisplayName() {
                return team.getName();
            }

            @Override
            public CompetitorType getCompetitorType() {
                return CompetitorType.TEAM;
            }
        };
    }
}