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

    public List<NotificationRecipient> resolve(Incident incident) {
        Map<Long, NotificationRecipient> recipientsByUserId = new LinkedHashMap<>();

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
                addCompetitionAthletes(recipientsByUserId, competition.getId());
            }
        }

        return new ArrayList<>(recipientsByUserId.values());
    }

    private void addTrialAthletes(Map<Long, NotificationRecipient> recipientsByUserId, Long trialId) {
        List<TrialParticipant> trialParticipants = trialParticipantRepository.findByTrialId(trialId);

        trialParticipants.stream()
                .filter(tp -> tp.getCompetitorType() == CompetitorType.ATHLETE)
                .map(TrialParticipant::getCompetitorId)
                .distinct()
                .map(athleteRepository::findById)
                .filter(java.util.Optional::isPresent)
                .map(java.util.Optional::get)
                .forEach(athlete -> addAthlete(recipientsByUserId, athlete));
    }

    private void addCompetitionAthletes(Map<Long, NotificationRecipient> recipientsByUserId, Long competitionId) {
        List<Participation> participations = participationRepository.findByCompetition_Id(competitionId);

        participations.stream()
                .filter(p -> p.getCompetitorType() == CompetitorType.ATHLETE)
                .filter(p -> p.getStatus() == ParticipationStatus.CONFIRMED)
                .map(Participation::getCompetitorId)
                .distinct()
                .map(athleteRepository::findById)
                .filter(java.util.Optional::isPresent)
                .map(java.util.Optional::get)
                .forEach(athlete -> addAthlete(recipientsByUserId, athlete));
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
                    (athlete.getFirstName() == null ? "" : athlete.getFirstName()) +
                    ((athlete.getLastName() == null || athlete.getLastName().isBlank()) ? "" : " " + athlete.getLastName())
                    )
        );
    }
}