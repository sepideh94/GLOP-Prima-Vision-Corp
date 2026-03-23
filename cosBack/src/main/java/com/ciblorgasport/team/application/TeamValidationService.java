package com.ciblorgasport.team.application;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.notification.application.NotificationService;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.team.domain.Team;
import com.ciblorgasport.team.infrastructure.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamValidationService {

    private final TeamRepository teamRepository;
    private final ParticipationRepository participationRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Transactional
    public void validateTeamStatus(Long athleteId, Long competitionId) {
        List<Team> teams = teamRepository.findAllByMemberId(athleteId);

        for (Team team : teams) {
            participationRepository.findByCompetition_IdAndCompetitorIdAndCompetitorType(
                    competitionId, team.getId(), CompetitorType.TEAM)
            .ifPresent(teamPart -> {
                boolean allMembersConfirmed = team.getMembers().stream().allMatch(member -> 
                    participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                        competitionId, member.getId(), CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED)
                );

                if (allMembersConfirmed && teamPart.getStatus() != ParticipationStatus.CONFIRMED) {
                    teamPart.setStatus(ParticipationStatus.CONFIRMED);
                    teamPart.setCharterAccepted(true);
                    teamPart.setCharterAcceptedAt(LocalDateTime.now()); 
                    participationRepository.save(teamPart);

                    // Notify all members
                    for (Athlete member : team.getMembers()) {
                        emailService.sendTeamParticipationValidatedEmail(
                            member.getEmail(),
                            member.getFirstName(),
                            team.getName()
                        );
                        
                        notificationService.createSystemNotification(
                            member,
                            NotificationType.TEAM_PARTICIPATION_VALIDATED,
                            "Participation de l'équipe confirmée",
                            "Le dossier de votre équipe " + team.getName() + " a été validé. Vous avez désormais accès au planning de la compétition.",
                            "/athlete/schedule/" + competitionId
                        );
                    }
                }
            });
        }
    }
}