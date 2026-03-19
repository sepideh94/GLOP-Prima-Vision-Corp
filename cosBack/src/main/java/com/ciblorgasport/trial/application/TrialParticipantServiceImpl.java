package com.ciblorgasport.trial.application;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private boolean isAthleteEligible(Athlete athlete) {
        // Règles métier : compte activé + profil complété + charte acceptée.
        // Note: `isProfileComplete()` inclut déjà `hasAcceptedCharte`.
        return athlete != null && athlete.isActive() && athlete.isProfileComplete();
    }

    private boolean isTeamEligible(Team team) {
        // Règles métier : chaque athlète membre doit satisfaire les mêmes conditions.
        if (team == null || team.getMembers() == null || team.getMembers().isEmpty()) {
            return false;
        }
        return team.getMembers().stream().allMatch(this::isAthleteEligible);
    }

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

        // Pour DEMI_FINALE/FINALE : préparer la liste des qualifiés du tour précédent
        RoundName currentRound = trial.getRound().getName();
        List<Long> qualifiedCompetitorIds = null;
        if (currentRound == RoundName.DEMI_FINALE || currentRound == RoundName.FINALE) {
            RoundName previousRound = (currentRound == RoundName.FINALE)
                    ? RoundName.DEMI_FINALE : RoundName.QUALIFICATION_HEAT;
            qualifiedCompetitorIds = trialParticipantRepository.findQualifiedCompetitorIds(
                    trial.getCompetition(), trial.getTrialName(), trial.getCategoryGender(), previousRound);
        }

        List<TrialParticipant> newParticipants = new ArrayList<>();

        for (Long athleteId : uniqueAthleteIds) {
            Athlete athlete = athleteRepository.findById(athleteId)
                    .orElseThrow(() -> new RuntimeException("Athlète introuvable: " + athleteId));

            if (!isAthleteEligible(athlete)) {
                throw new IllegalArgumentException(
                        "L'athlète " + athlete.getDisplayName()
                                + " n'est pas éligible : compte non activé, profil incomplet ou charte non acceptée.");
            }

            strategy.validateParticipant(toParticipant(athlete));

<<<<<<< feature/forfait
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
=======
            // Vérification participation active (INVITED ou CONFIRMED)
            boolean hasActiveParticipation = participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatusIn(
                    trial.getCompetition().getId(), athleteId, CompetitorType.ATHLETE,
                    List.of(ParticipationStatus.CONFIRMED));

            if (!hasActiveParticipation) {
                throw new IllegalArgumentException("Participation non confirmée pour l'athlète: " + athlete.getDisplayName());
            }

            // Vérification qualification pour DEMI_FINALE/FINALE
            if (qualifiedCompetitorIds != null && !qualifiedCompetitorIds.contains(athleteId)) {
                throw new IllegalArgumentException(
                        "L'athlète " + athlete.getDisplayName() + " n'est pas qualifié pour cette phase.");
            }

            // Vérification doublon
            if (trialParticipantRepository.existsByTrialIdAndCompetitorIdAndCompetitorType(trialId, athleteId, CompetitorType.ATHLETE)) {
                throw new IllegalArgumentException("L'athlète est déjà assigné à cette série.");
>>>>>>> develop
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

    @Transactional(readOnly = true)
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
        return trialParticipantRepository.findAllDirectAndTeamTrialParticipations(athleteId).stream()
                .map(this::mapToResponse)
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

    @Transactional(readOnly = true)
    @Override
    @Transactional
    public void declareForfeit(Long trialParticipantId, Long athleteId) {
        TrialParticipant participant = trialParticipantRepository
                .findAccessibleByIdForAthlete(trialParticipantId, athleteId)
                .orElseThrow(() -> new EntityNotFoundException("Participation à l'épreuve introuvable"));

        participant.declareForfeit();
        trialParticipantRepository.save(participant);
    }

    @Transactional
    @Override
    public List<AthleteResponse> getEligibleAthletes(Long trialId) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new RuntimeException("Épreuve introuvable"));

<<<<<<< feature/forfait
        return athleteService.getAthletesByCompetition(trial.getCompetition().getId());
=======
        RoundName currentRound = trial.getRound().getName();

        if (currentRound == RoundName.DEMI_FINALE || currentRound == RoundName.FINALE) {
            RoundName previousRound = (currentRound == RoundName.FINALE)
                    ? RoundName.DEMI_FINALE : RoundName.QUALIFICATION_HEAT;
            List<Long> qualifiedIds = new ArrayList<>(trialParticipantRepository.findQualifiedCompetitorIds(
                    trial.getCompetition(), trial.getTrialName(), trial.getCategoryGender(), previousRound));

            List<Long> alreadyAssignedIds = trialParticipantRepository.findByTrialId(trialId).stream()
                    .filter(tp -> tp.getCompetitorType() == CompetitorType.ATHLETE)
                    .map(TrialParticipant::getCompetitorId)
                    .collect(Collectors.toList());

            qualifiedIds.removeAll(alreadyAssignedIds);

            if (qualifiedIds.isEmpty()) return new ArrayList<>();

            return athleteRepository.findAllById(qualifiedIds).stream()
                    .filter(this::isAthleteEligible)
                    .map(AthleteResponse::fromEntity)
                    .collect(Collectors.toList());
        }

        // QUALIFICATION_HEAT : athlètes INVITED ou CONFIRMED, non encore assignés à cette épreuve
        List<Long> alreadyAssignedIds = trialParticipantRepository.findByTrialId(trialId).stream()
                .filter(tp -> tp.getCompetitorType() == CompetitorType.ATHLETE)
                .map(TrialParticipant::getCompetitorId)
                .collect(Collectors.toList());

        List<Long> eligibleIds = participationRepository.findByCompetition_Id(trial.getCompetition().getId())
                .stream()
                .filter(p -> p.getCompetitorType() == CompetitorType.ATHLETE)
                .filter(p -> p.getStatus() == ParticipationStatus.CONFIRMED)
                .map(p -> p.getCompetitorId())
                .filter(id -> !alreadyAssignedIds.contains(id))
                .distinct()
                .collect(Collectors.toList());

        if (eligibleIds.isEmpty()) return new ArrayList<>();

        return athleteRepository.findAllById(eligibleIds).stream()
                .filter(this::isAthleteEligible)
                .map(AthleteResponse::fromEntity)
                .sorted((a, b) -> a.getLastName().compareToIgnoreCase(b.getLastName()))
                .collect(Collectors.toList());
>>>>>>> develop
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
<<<<<<< feature/forfait

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
=======
>>>>>>> develop
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

        // Pour DEMI_FINALE/FINALE : préparer la liste des qualifiés du tour précédent
        RoundName currentRound = trial.getRound().getName();
        List<Long> qualifiedCompetitorIds = null;
        if (currentRound == RoundName.DEMI_FINALE || currentRound == RoundName.FINALE) {
            RoundName previousRound = (currentRound == RoundName.FINALE)
                    ? RoundName.DEMI_FINALE : RoundName.QUALIFICATION_HEAT;
            qualifiedCompetitorIds = trialParticipantRepository.findQualifiedCompetitorIds(
                    trial.getCompetition(), trial.getTrialName(), trial.getCategoryGender(), previousRound);
        }

        List<TrialParticipant> newParticipants = new ArrayList<>();

        for (Long teamId : uniqueTeamIds) {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new RuntimeException("Équipe introuvable avec l'ID: " + teamId));

<<<<<<< feature/forfait
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
=======
            if (!isTeamEligible(team)) {
                throw new IllegalArgumentException(
                        "L'équipe " + team.getName()
                                + " n'est pas éligible : tous les membres doivent avoir un compte activé, un profil complété et la charte acceptée.");
            }

            // Validation par la stratégie (vérifie que l'épreuve accepte bien des équipes)
            strategy.validateParticipant(toParticipant(team));

            // Vérification que l'équipe a une participation active (INVITED ou CONFIRMED)
            boolean hasActiveParticipation =
                participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatusIn(
                    trial.getCompetition().getId(),
                    teamId,
                    CompetitorType.TEAM,
                    List.of(ParticipationStatus.CONFIRMED));

            if (!hasActiveParticipation) {
                throw new IllegalArgumentException("L'équipe " + team.getName() + " n'est pas inscrite à cette compétition.");
            }

            // Vérification qualification pour DEMI_FINALE/FINALE
            if (qualifiedCompetitorIds != null && !qualifiedCompetitorIds.contains(teamId)) {
                throw new IllegalArgumentException(
                        "L'équipe " + team.getName() + " n'est pas qualifiée pour cette phase.");
>>>>>>> develop
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

<<<<<<< feature/forfait
        List<Long> confirmedTeamIds = participationRepository
                .findByCompetition_Id(trial.getCompetition().getId())
                .stream()
                .filter(p -> p.getCompetitorType() == CompetitorType.TEAM && p.getStatus() == ParticipationStatus.CONFIRMED)
                .map(p -> p.getCompetitorId())
                .collect(Collectors.toList());
=======
        RoundName currentRound = trial.getRound().getName();

        List<Long> confirmedTeamIds;
        if (currentRound == RoundName.DEMI_FINALE || currentRound == RoundName.FINALE) {
            RoundName previousRound = (currentRound == RoundName.FINALE)
                    ? RoundName.DEMI_FINALE : RoundName.QUALIFICATION_HEAT;
            confirmedTeamIds = new ArrayList<>(trialParticipantRepository.findQualifiedCompetitorIds(
                    trial.getCompetition(), trial.getTrialName(), trial.getCategoryGender(), previousRound));
        } else {
            confirmedTeamIds = participationRepository
                    .findByCompetition_Id(trial.getCompetition().getId())
                    .stream()
                    .filter(p -> p.getCompetitorType() == CompetitorType.TEAM && (p.getStatus() == ParticipationStatus.CONFIRMED))
                    .map(p -> p.getCompetitorId())
                    .collect(Collectors.toList());
        }
>>>>>>> develop

        List<Long> alreadyAssignedIds = trialParticipantRepository
                .findByTrialId(trialId)
                .stream()
                .filter(tp -> tp.getCompetitorType() == CompetitorType.TEAM)
                .map(TrialParticipant::getCompetitorId)
                .collect(Collectors.toList());

        confirmedTeamIds.removeAll(alreadyAssignedIds);
<<<<<<< feature/forfait

        if (confirmedTeamIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<Team> eligibleTeams = teamRepository.findAllById(confirmedTeamIds);

=======
        
        if (confirmedTeamIds.isEmpty()) return new ArrayList<>();
        
        List<Team> eligibleTeams = teamRepository.findAllById(confirmedTeamIds).stream()
                .filter(this::isTeamEligible)
                .collect(Collectors.toList());
        
>>>>>>> develop
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

    @Override
    public TrialParticipantResponse toResponse(TrialParticipant tp) {
        return mapToResponse(tp);
    }
}