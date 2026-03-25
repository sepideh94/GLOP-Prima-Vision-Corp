package com.ciblorgasport.trial.application;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.dto.AthleteResponse;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.common.exception.BusinessValidationException;
import com.ciblorgasport.common.exception.ResourceNotFoundException;
import com.ciblorgasport.commissionner.CommissionerRepository;
import com.ciblorgasport.commissionner.Commissionner;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.notification.application.NotificationService;
import com.ciblorgasport.notification.domain.NotificationType;
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
    private final CommissionerRepository commissionerRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    private boolean isAthleteEligible(Athlete athlete) {
        return athlete != null && athlete.isActive() && athlete.isProfileComplete();
    }

    private boolean isTeamEligible(Team team) {
        if (team == null || team.getMembers() == null || team.getMembers().isEmpty()) {
            return false;
        }
        return team.getMembers().stream().allMatch(this::isAthleteEligible);
    }

    @Transactional
    @Override
    public List<TrialParticipantResponse> assignAthletes(Long trialId, List<Long> athleteIds) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new ResourceNotFoundException("Épreuve introuvable avec l'ID: " + trialId));

        validateTrialStateForAssignment(trial);

        TrialModeStrategy strategy = trial.getModeStrategy();
        List<Long> uniqueAthleteIds = athleteIds.stream().distinct().toList();

        long currentCount = trialParticipantRepository.countByTrialId(trialId);
        int maxPerHeat = strategy.getMaxParticipantsPerHeat();

        if (currentCount + uniqueAthleteIds.size() > maxPerHeat) {
            throw new BusinessValidationException(
                    "Le nombre maximum de " + strategy.getParticipantTypeLabel()
                            + "s par série est de " + maxPerHeat
                            + ". Actuellement " + currentCount
                            + " " + strategy.getParticipantTypeLabel() + "(s) assigné(s), impossible d'en ajouter "
                            + uniqueAthleteIds.size() + ".");
        }

        RoundName currentRound = trial.getRound().getName();
        List<Long> qualifiedCompetitorIds = null;
        if (currentRound == RoundName.DEMI_FINALE || currentRound == RoundName.FINALE) {
            RoundName previousRound = (currentRound == RoundName.FINALE)
                    ? RoundName.DEMI_FINALE
                    : RoundName.QUALIFICATION_HEAT;
            qualifiedCompetitorIds = trialParticipantRepository.findQualifiedCompetitorIds(
                    trial.getCompetition(), trial.getTrialName(), trial.getCategoryGender(), previousRound);
        }

        List<TrialParticipant> newParticipants = new ArrayList<>();

        for (Long athleteId : uniqueAthleteIds) {
            Athlete athlete = athleteRepository.findById(athleteId)
                    .orElseThrow(() -> new ResourceNotFoundException("Athlète introuvable: " + athleteId));

            if (!isAthleteEligible(athlete)) {
                throw new BusinessValidationException(
                        "L'athlète " + athlete.getDisplayName()
                                + " n'est pas éligible : compte non activé, profil incomplet ou charte non acceptée.");
            }

            strategy.validateParticipant(toParticipant(athlete));

            boolean hasConfirmedParticipation =
                    participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                            trial.getCompetition().getId(),
                            athleteId,
                            CompetitorType.ATHLETE,
                            ParticipationStatus.CONFIRMED);

            if (!hasConfirmedParticipation) {
                throw new BusinessValidationException(
                        "L'athlète " + athlete.getDisplayName()
                                + " n'a pas de participation CONFIRMED à la compétition.");
            }

            if (qualifiedCompetitorIds != null && !qualifiedCompetitorIds.contains(athleteId)) {
                throw new BusinessValidationException(
                        "L'athlète " + athlete.getDisplayName() + " n'est pas qualifié pour cette phase.");
            }

            if (trialParticipantRepository.existsByTrialIdAndCompetitorIdAndCompetitorType(
                    trialId, athleteId, CompetitorType.ATHLETE)) {
                throw new BusinessValidationException(
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

    @Transactional(readOnly = true)
    @Override
    public List<TrialParticipantResponse> getByTrialId(Long trialId) {
        if (!trialRepository.existsById(trialId)) {
            throw new ResourceNotFoundException("Épreuve introuvable avec l'ID: " + trialId);
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
                .orElseThrow(() -> new ResourceNotFoundException("Épreuve introuvable"));

        if (trial.hasStarted()) {
            throw new BusinessValidationException("Série déjà commencée.");
        }

        TrialParticipant tp = trialParticipantRepository.findByTrialId(trialId).stream()
                .filter(p -> p.getCompetitorId().equals(athleteId) && p.getCompetitorType() == CompetitorType.ATHLETE)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Participant non trouvé."));

        trialParticipantRepository.delete(tp);
    }

    @Transactional
    @Override
    public void declareForfeit(Long trialParticipantId, Long athleteId) {
        TrialParticipant participant = trialParticipantRepository
                .findAccessibleByIdForAthlete(trialParticipantId, athleteId)
                .orElseThrow(() -> new EntityNotFoundException("Participation à l'épreuve introuvable"));

        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new EntityNotFoundException("Athlète introuvable"));

        participant.declareForfeit();
        trialParticipantRepository.save(participant);

        List<Commissionner> commissionners = commissionerRepository.findAll();
        String athleteName = athlete.getFirstName() + " " + athlete.getLastName();

        for (Commissionner c : commissionners) {
            emailService.sendCommissionerForfeitDeclaredEmail(
                    c.getEmail(),
                    c.getFirstName(),
                    athleteName
            );

            notificationService.createSystemNotification(
                    c,
                    NotificationType.ATHLETE_FORFEIT_DECLARED,
                    "Forfait déclaré",
                    "L'athlète " + athleteName + " a déclaré forfait pour une épreuve.",
                    "/commissioner/competitions"
            );
        }
    }

    @Transactional(readOnly = true)
    @Override
    public List<AthleteResponse> getEligibleAthletes(Long trialId) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new ResourceNotFoundException("Épreuve introuvable"));

        RoundName currentRound = trial.getRound().getName();

        if (currentRound == RoundName.DEMI_FINALE || currentRound == RoundName.FINALE) {
            RoundName previousRound = (currentRound == RoundName.FINALE)
                    ? RoundName.DEMI_FINALE
                    : RoundName.QUALIFICATION_HEAT;
            List<Long> qualifiedIds = new ArrayList<>(trialParticipantRepository.findQualifiedCompetitorIds(
                    trial.getCompetition(), trial.getTrialName(), trial.getCategoryGender(), previousRound));

            List<Long> alreadyAssignedIds = trialParticipantRepository.findByTrialId(trialId).stream()
                    .filter(tp -> tp.getCompetitorType() == CompetitorType.ATHLETE)
                    .map(TrialParticipant::getCompetitorId)
                    .collect(Collectors.toList());

            qualifiedIds.removeAll(alreadyAssignedIds);

            if (qualifiedIds.isEmpty()) {
                return new ArrayList<>();
            }

            return athleteRepository.findAllById(qualifiedIds).stream()
                    .filter(this::isAthleteEligible)
                    .map(AthleteResponse::fromEntity)
                    .collect(Collectors.toList());
        }

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

        if (eligibleIds.isEmpty()) {
            return new ArrayList<>();
        }

        return athleteRepository.findAllById(eligibleIds).stream()
                .filter(this::isAthleteEligible)
                .map(AthleteResponse::fromEntity)
                .sorted((a, b) -> a.getLastName().compareToIgnoreCase(b.getLastName()))
                .collect(Collectors.toList());
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
            throw new BusinessValidationException(
                    "Impossible d'assigner des participants à une série déjà commencée.");
        }

        if (trial.isCancelled()) {
            throw new BusinessValidationException("État de l'épreuve invalide pour l'assignation.");
        }

        RoundName roundName = trial.getRound().getName();

        if (roundName == RoundName.DEMI_FINALE) {
            throw new BusinessValidationException(
                    "Les participants seront automatiquement déterminés après les résultats des qualifications.");
        }

        if (roundName == RoundName.FINALE) {
            throw new BusinessValidationException(
                    "Les participants seront automatiquement déterminés après les résultats des demi-finales.");
        }

        if (roundName != RoundName.QUALIFICATION_HEAT) {
            throw new BusinessValidationException(
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
                .orElseThrow(() -> new ResourceNotFoundException("Épreuve introuvable"));

        validateTrialStateForAssignment(trial);

        TrialModeStrategy strategy = trial.getModeStrategy();
        List<Long> uniqueTeamIds = teamIds.stream().distinct().toList();

        long currentCount = trialParticipantRepository.countByTrialId(trialId);
        int maxPerHeat = strategy.getMaxParticipantsPerHeat();

        if (currentCount + uniqueTeamIds.size() > maxPerHeat) {
            throw new BusinessValidationException("Nombre maximum d'équipes par série dépassé.");
        }

        RoundName currentRound = trial.getRound().getName();
        List<Long> qualifiedCompetitorIds = null;
        if (currentRound == RoundName.DEMI_FINALE || currentRound == RoundName.FINALE) {
            RoundName previousRound = (currentRound == RoundName.FINALE)
                    ? RoundName.DEMI_FINALE
                    : RoundName.QUALIFICATION_HEAT;
            qualifiedCompetitorIds = trialParticipantRepository.findQualifiedCompetitorIds(
                    trial.getCompetition(), trial.getTrialName(), trial.getCategoryGender(), previousRound);
        }

        List<TrialParticipant> newParticipants = new ArrayList<>();

        for (Long teamId : uniqueTeamIds) {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new ResourceNotFoundException("Équipe introuvable avec l'ID: " + teamId));

            if (!isTeamEligible(team)) {
                throw new BusinessValidationException(
                        "L'équipe " + team.getName()
                                + " n'est pas éligible : tous les membres doivent avoir un compte activé, un profil complété et la charte acceptée.");
            }

            strategy.validateParticipant(toParticipant(team));

            boolean hasConfirmedParticipation =
                    participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                            trial.getCompetition().getId(),
                            teamId,
                            CompetitorType.TEAM,
                            ParticipationStatus.CONFIRMED);

            if (!hasConfirmedParticipation) {
                throw new BusinessValidationException(
                        "L'équipe " + team.getName() + " n'est pas confirmée pour cette compétition.");
            }

            if (qualifiedCompetitorIds != null && !qualifiedCompetitorIds.contains(teamId)) {
                throw new BusinessValidationException(
                        "L'équipe " + team.getName() + " n'est pas qualifiée pour cette phase.");
            }

            if (trialParticipantRepository.existsByTrialIdAndCompetitorIdAndCompetitorType(
                    trialId, teamId, CompetitorType.TEAM)) {
                throw new BusinessValidationException(
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
                .orElseThrow(() -> new ResourceNotFoundException("Épreuve introuvable"));

        if (trial.hasStarted()) {
            throw new BusinessValidationException("Série déjà commencée.");
        }

        TrialParticipant tp = trialParticipantRepository.findByTrialId(trialId).stream()
                .filter(p -> p.getCompetitorId().equals(teamId) && p.getCompetitorType() == CompetitorType.TEAM)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Équipe non trouvée dans cette épreuve."));

        trialParticipantRepository.delete(tp);
    }

    @Transactional(readOnly = true)
    @Override
    public List<TeamResponse> getEligibleTeams(Long trialId) {
        Trial trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new ResourceNotFoundException("Épreuve introuvable"));

        RoundName currentRound = trial.getRound().getName();

        List<Long> confirmedTeamIds;
        if (currentRound == RoundName.DEMI_FINALE || currentRound == RoundName.FINALE) {
            RoundName previousRound = (currentRound == RoundName.FINALE)
                    ? RoundName.DEMI_FINALE
                    : RoundName.QUALIFICATION_HEAT;
            confirmedTeamIds = new ArrayList<>(trialParticipantRepository.findQualifiedCompetitorIds(
                    trial.getCompetition(), trial.getTrialName(), trial.getCategoryGender(), previousRound));
        } else {
            confirmedTeamIds = participationRepository
                    .findByCompetition_Id(trial.getCompetition().getId())
                    .stream()
                    .filter(p -> p.getCompetitorType() == CompetitorType.TEAM
                            && p.getStatus() == ParticipationStatus.CONFIRMED)
                    .map(p -> p.getCompetitorId())
                    .collect(Collectors.toList());
        }

        List<Long> alreadyAssignedIds = trialParticipantRepository.findByTrialId(trialId).stream()
                .filter(tp -> tp.getCompetitorType() == CompetitorType.TEAM)
                .map(TrialParticipant::getCompetitorId)
                .collect(Collectors.toList());

        confirmedTeamIds.removeAll(alreadyAssignedIds);

        if (confirmedTeamIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<Team> eligibleTeams = teamRepository.findAllById(confirmedTeamIds).stream()
                .filter(this::isTeamEligible)
                .collect(Collectors.toList());

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