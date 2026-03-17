package com.ciblorgasport.notification.application;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.incident.domain.Incident;
import com.ciblorgasport.notification.dto.NotificationRecipient;
import com.ciblorgasport.team.domain.Team;
import com.ciblorgasport.team.infrastructure.TeamRepository;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AthleteIncidentRecipientResolver {

    private final ParticipationRepository participationRepository;
    private final TrialParticipantRepository trialParticipantRepository;
    private final AthleteRepository athleteRepository;
    private final CompetitionRepository competitionRepository;
    private final TeamRepository teamRepository;

    public List<NotificationRecipient> resolve(Incident incident) {
        Map<Long, NotificationRecipient> recipientsByUserId = new LinkedHashMap<>();

        if (incident == null) {
            return new ArrayList<>();
        }

        if (incident.getTrial() != null) {
            addTrialAthletes(recipientsByUserId, incident.getTrial().getId());
            return new ArrayList<>(recipientsByUserId.values());
        }

        if (incident.getCompetition() != null) {
            addCompetitionAthletes(recipientsByUserId, incident.getCompetition().getId());
            return new ArrayList<>(recipientsByUserId.values());
        }

        if (incident.getEvent() != null) {
            List<Competition> competitions = competitionRepository.findByParentEventId(incident.getEvent().getId());
            for (Competition competition : competitions) {
                if (competition != null && competition.getId() != null) {
                    addCompetitionAthletes(recipientsByUserId, competition.getId());
                }
            }
        }

        return new ArrayList<>(recipientsByUserId.values());
    }

    private void addTrialAthletes(Map<Long, NotificationRecipient> recipientsByUserId, Long trialId) {
        List<TrialParticipant> trialParticipants = trialParticipantRepository.findByTrialId(trialId);

        for (TrialParticipant tp : trialParticipants) {
            if (tp.getCompetitorType() == CompetitorType.ATHLETE) {
                athleteRepository.findById(tp.getCompetitorId())
                        .ifPresent(athlete -> addAthlete(recipientsByUserId, athlete));
            } else if (tp.getCompetitorType() == CompetitorType.TEAM) {
                teamRepository.findById(tp.getCompetitorId())
                        .ifPresent(team -> addTeamMembers(recipientsByUserId, team));
            }
        }
    }

    private void addCompetitionAthletes(Map<Long, NotificationRecipient> recipientsByUserId, Long competitionId) {
        List<Participation> participations = participationRepository.findByCompetition_Id(competitionId);

        for (Participation participation : participations) {
            if (participation.getStatus() != ParticipationStatus.CONFIRMED) {
                continue;
            }

            if (participation.getCompetitorType() == CompetitorType.ATHLETE) {
                athleteRepository.findById(participation.getCompetitorId())
                        .ifPresent(athlete -> addAthlete(recipientsByUserId, athlete));
            } else if (participation.getCompetitorType() == CompetitorType.TEAM) {
                teamRepository.findById(participation.getCompetitorId())
                        .ifPresent(team -> addTeamMembers(recipientsByUserId, team));
            }
        }
    }

    private void addTeamMembers(Map<Long, NotificationRecipient> recipientsByUserId, Team team) {
        if (team == null || team.getMembers() == null) {
            return;
        }

        for (Athlete athlete : team.getMembers()) {
            addAthlete(recipientsByUserId, athlete);
        }
    }

    private void addAthlete(Map<Long, NotificationRecipient> recipientsByUserId, Athlete athlete) {
        if (athlete == null || athlete.getId() == null) {
            return;
        }

        String email = athlete.getEmail();
        if (email == null || email.isBlank()) {
            return;
        }

        recipientsByUserId.putIfAbsent(
                athlete.getId(),
                new NotificationRecipient(
                        athlete,
                        email,
                        buildDisplayName(athlete.getFirstName(), athlete.getLastName())
                )
        );
    }

    private String buildDisplayName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String full = (first + " " + last).trim();
        return full.isBlank() ? "athlète" : full;
    }
}