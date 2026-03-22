package com.ciblorgasport.competition.application;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.dto.AthleteCompetitionDetailsResponse;
import com.ciblorgasport.competition.dto.ParticipantResponse;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.team.application.TeamValidationService;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;
import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.notification.application.NotificationService;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.storage.application.StorageService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ParticipationService {

    private final ParticipationRepository participationRepository;
    private final AthleteRepository athleteRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final TeamValidationService teamValidationService;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final StorageService storageService;

    @Transactional
    public List<ParticipantResponse> getParticipantsByCompetition(Long competitionId) {
        List<Participation> participations = participationRepository.findByCompetition_Id(competitionId);
        return buildParticipantResponses(participations);
    }

    @Transactional
    public List<ParticipantResponse> getParticipationsByAthlete(Long athleteId) {
        List<Participation> participations = participationRepository
                .findByCompetitorIdAndCompetitorType(athleteId, CompetitorType.ATHLETE);
        return buildParticipantResponses(participations);
    }

    private List<ParticipantResponse> buildParticipantResponses(List<Participation> participations) {
        List<ParticipantResponse> responses = new ArrayList<>();

        for (Participation participation : participations) {
            ParticipantResponse.ParticipantResponseBuilder builder = ParticipantResponse.builder()
                    .participationId(participation.getId())
                    .competitorId(participation.getCompetitorId())
                    .competitorType(participation.getCompetitorType())
                    .status(participation.getStatus())
                    .competitionId(participation.getCompetition().getId())
                    .competitionName(participation.getCompetition().getName());

            if (participation.getCompetitorType() == CompetitorType.ATHLETE) {
                athleteRepository.findById(participation.getCompetitorId())
                        .ifPresent(athlete -> {
                            builder.firstName(athlete.getFirstName());
                            builder.lastName(athlete.getLastName());
                            builder.email(athlete.getEmail());
                        });
            }

            responses.add(builder.build());
        }

        return responses;
    }

    @Transactional
    public List<AthleteCompetitionDetailsResponse> getAthleteDashboardCards(Long athleteId) {
        List<Participation> participations = participationRepository.findAllDirectAndTeamParticipations(athleteId);

        java.util.Map<Long, List<Participation>> partsByComp = participations.stream()
                .collect(java.util.stream.Collectors.groupingBy(p -> p.getCompetition().getId()));

        List<AthleteCompetitionDetailsResponse> results = new ArrayList<>();

        for (List<Participation> parts : partsByComp.values()) {
            Participation individualPart = parts.stream()
                    .filter(p -> p.getCompetitorType() == CompetitorType.ATHLETE)
                    .findFirst()
                    .orElse(null);

            Participation teamPart = parts.stream()
                    .filter(p -> p.getCompetitorType() == CompetitorType.TEAM)
                    .findFirst()
                    .orElse(null);

            Participation primaryPart = individualPart != null ? individualPart : teamPart;
            if (primaryPart == null) continue;

            AthleteCompetitionDetailsResponse response = AthleteCompetitionDetailsResponse.fromEntity(primaryPart);

            if (teamPart != null) {
                response.setTeamStatus(teamPart.getStatus());
                response.setIsTeamParticipation(true);
            }

            results.add(response);
        }

        return results;
    }

    @Transactional
    public void confirmAllParticipationsForAthlete(Long athleteId) {
        List<Participation> participations = participationRepository
                .findByCompetitorIdAndCompetitorType(athleteId, CompetitorType.ATHLETE);

        for (Participation p : participations) {
            p.setStatus(ParticipationStatus.PENDING_VALIDATION);
        }
        participationRepository.saveAll(participations);
    }

    @Transactional
    public void confirmParticipation(Long participationId, Long athleteId) {
        Participation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new EntityNotFoundException("Participation non trouvée"));

        if (participation.getCompetitorType() != CompetitorType.ATHLETE) {
            throw new IllegalStateException("Seul un athlète peut confirmer sa participation.");
        }

        if (!participation.getCompetitorId().equals(athleteId)) {
            throw new IllegalStateException("Accès non autorisé à cette participation.");
        }

        Athlete athlete = athleteRepository.findById(participation.getCompetitorId())
                .orElseThrow(() -> new EntityNotFoundException("Athlète non trouvé"));

        if (!athlete.isProfileComplete()) {
            throw new IllegalStateException(
                    "Impossible de confirmer la participation : votre profil est incomplet (documents manquants)."
            );
        }

        participation.setCharterAccepted(true);
        participation.setCharterAcceptedAt(LocalDateTime.now());
        participation.setStatus(ParticipationStatus.PENDING_VALIDATION);

        participationRepository.saveAndFlush(participation);

        teamValidationService.validateTeamStatus(
                participation.getCompetitorId(),
                participation.getCompetition().getId()
        );
    }

    @Transactional
    public void acceptCharter(Long participationId) {
        Participation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new EntityNotFoundException("Participation non trouvée"));

        if (participation.getCompetitorType() == CompetitorType.ATHLETE) {
            Athlete athlete = athleteRepository.findById(participation.getCompetitorId())
                    .orElseThrow(() -> new EntityNotFoundException("Athlète non trouvé"));

            if (!athlete.isProfileComplete()) {
                throw new IllegalStateException(
                        "Impossible d'accepter la charte : votre profil est incomplet (documents manquants)."
                );
            }
        }

        participation.setCharterAccepted(true);
        participation.setCharterAcceptedAt(LocalDateTime.now());
        participation.setStatus(ParticipationStatus.PENDING_VALIDATION);

        participationRepository.saveAndFlush(participation);

        if (participation.getCompetitorType() == CompetitorType.ATHLETE) {
            teamValidationService.validateTeamStatus(
                    participation.getCompetitorId(),
                    participation.getCompetition().getId()
            );
        }
    }

    @Transactional
    public void validateParticipation(Long participationId, boolean isValid) {
        validateParticipation(participationId, isValid, null, null);
    }

    @Transactional
    public void validateParticipation(Long participationId, boolean isValid, String rejectedDocument, String reason) {
        Participation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new EntityNotFoundException("Participation non trouvée"));

        if (isValid) {
            participation.setStatus(ParticipationStatus.CONFIRMED);
            participationRepository.saveAndFlush(participation);
            if (participation.getCompetitorType() == CompetitorType.ATHLETE) {
                teamValidationService.validateTeamStatus(participation.getCompetitorId(), participation.getCompetition().getId());
                
                athleteRepository.findById(participation.getCompetitorId()).ifPresent(athlete -> {
                    userAccountRepository.findByEmail(athlete.getEmail()).ifPresent(user -> {
                        emailService.sendAthleteParticipationValidatedEmail(user.getEmail(), user.getFirstName());
                        notificationService.createSystemNotification(
                            user, NotificationType.PARTICIPATION_VALIDATED,
                            "Documents validés",
                            "Vos documents ont été validés par le commissaire.",
                            "/athlete/competitions"
                        );
                    });
                });
            }
        } else {
            participation.setStatus(ParticipationStatus.PENDING);
            participation.setCharterAccepted(false);
            participation.setCharterAcceptedAt(null);
            participationRepository.saveAndFlush(participation);
            
            if (participation.getCompetitorType() == CompetitorType.ATHLETE) {
                athleteRepository.findById(participation.getCompetitorId()).ifPresent(athlete -> {
                    
                    if ("PASSPORT".equalsIgnoreCase(rejectedDocument) || "BOTH".equalsIgnoreCase(rejectedDocument)) {
                        if (athlete.getPassportDocument() != null) {
                            storageService.deleteFile(athlete.getPassportDocument());
                        }
                        athlete.setPassportDocument(null);
                    }
                    if ("MEDICAL_CERTIFICATE".equalsIgnoreCase(rejectedDocument) || "BOTH".equalsIgnoreCase(rejectedDocument)) {
                        if (athlete.getMedicalCertificate() != null) {
                            storageService.deleteFile(athlete.getMedicalCertificate());
                        }
                        athlete.setMedicalCertificate(null);
                    }
                    athleteRepository.save(athlete);

                    userAccountRepository.findByEmail(athlete.getEmail()).ifPresent(user -> {
                        emailService.sendAthleteParticipationRefusedEmail(user.getEmail(), user.getFirstName(), rejectedDocument, reason);
                        
                        String message = "Vos documents justifications ont été refusés. Document refusé : " + (rejectedDocument != null ? rejectedDocument : "Inconnu") + ". Motif : " + (reason != null ? reason : "Veuillez vérifier votre profil.");
                        
                        notificationService.createSystemNotification(
                            user, NotificationType.PARTICIPATION_REFUSED,
                            "Documents refusés",
                            message,
                            "/athlete/profile"
                        );
                    });
                });
            }
        }
    }

    public boolean isConfirmed(Long athleteId, Long competitionId) {
        boolean individualConfirmed = participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                competitionId, athleteId, CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED);

        List<Participation> teamParticipations = participationRepository.findTeamParticipationsByAthleteAndCompetition(athleteId, competitionId);

        if (!teamParticipations.isEmpty()) {
            return teamParticipations.stream().anyMatch(p -> p.getStatus() == ParticipationStatus.CONFIRMED);
        }

        return individualConfirmed;
    }
}
