package com.ciblorgasport.notification.application;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.incident.domain.Incident;
import com.ciblorgasport.notification.dto.NotificationRecipient;
import com.ciblorgasport.volonteer.domain.Volonteer;
import com.ciblorgasport.volonteer.domain.VolonteerAssignment;
import com.ciblorgasport.volonteer.infrastructure.VolonteerAssignmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VolonteerIncidentRecipientResolver {

    private final VolonteerAssignmentRepository volonteerAssignmentRepository;
    private final CompetitionRepository competitionRepository;

    public List<NotificationRecipient> resolve(Incident incident) {
        Map<Long, NotificationRecipient> recipientsByUserId = new LinkedHashMap<>();

        if (incident == null) {
            return new ArrayList<>();
        }

        if (incident.getCompetition() != null) {
            addCompetitionVolonteers(recipientsByUserId, incident.getCompetition().getId());
            return new ArrayList<>(recipientsByUserId.values());
        }

        if (incident.getEvent() != null) {
            List<Competition> competitions = competitionRepository.findByParentEventId(incident.getEvent().getId());

            for (Competition competition : competitions) {
                if (competition != null && competition.getId() != null) {
                    addCompetitionVolonteers(recipientsByUserId, competition.getId());
                }
            }
        }

        return new ArrayList<>(recipientsByUserId.values());
    }

    private void addCompetitionVolonteers(Map<Long, NotificationRecipient> recipientsByUserId, Long competitionId) {
        List<VolonteerAssignment> assignments = volonteerAssignmentRepository.findByCompetitionId(competitionId);

        assignments.stream()
                .filter(a -> a.getStatus() == ParticipationStatus.CONFIRMED)
                .map(VolonteerAssignment::getVolonteer)
                .filter(volonteer -> volonteer != null && volonteer.getId() != null)
                .forEach(volonteer -> addVolonteer(recipientsByUserId, volonteer));
    }

    private void addVolonteer(Map<Long, NotificationRecipient> recipientsByUserId, Volonteer volonteer) {
        String email = volonteer.getEmail();
        if (email == null || email.isBlank()) {
            return;
        }

        recipientsByUserId.putIfAbsent(
                volonteer.getId(),
                new NotificationRecipient(
                        volonteer,
                        email,
                        buildDisplayName(volonteer.getFirstName(), volonteer.getLastName())
                )
        );
    }

    private String buildDisplayName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String full = (first + " " + last).trim();
        return full.isBlank() ? "volontaire" : full;
    }
}