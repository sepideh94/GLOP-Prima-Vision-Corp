package com.ciblorgasport.notification.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.incident.domain.Incident;
import com.ciblorgasport.notification.dto.NotificationRecipient;
import com.ciblorgasport.volonteer.domain.Volonteer;
import com.ciblorgasport.volonteer.domain.VolonteerAssignment;
import com.ciblorgasport.volonteer.infrastructure.VolonteerAssignmentRepository;

@ExtendWith(MockitoExtension.class)
class VolonteerIncidentRecipientResolverTest {

    @Mock private VolonteerAssignmentRepository volonteerAssignmentRepository;
    @Mock private CompetitionRepository competitionRepository;

    @InjectMocks
    private VolonteerIncidentRecipientResolver resolver;

    @Test
    void resolve_returnsEmptyList_whenIncidentIsNull() {
        List<NotificationRecipient> recipients = resolver.resolve(null);
        assertThat(recipients).isEmpty();
    }

    @Test
    void resolve_returnsCompetitionVolonteers_whenIncidentHasCompetition() {
        Competition comp = new Competition();
        comp.setId(2L);
        Incident incident = new Incident();
        incident.setCompetition(comp);

        VolonteerAssignment va = new VolonteerAssignment();
        va.setStatus(ParticipationStatus.CONFIRMED);
        Volonteer v = new Volonteer(); v.setId(5L); v.setEmail("v@test.com"); v.setFirstName("Vol");
        va.setVolonteer(v);

        when(volonteerAssignmentRepository.findByCompetitionId(2L)).thenReturn(List.of(va));

        List<NotificationRecipient> recipients = resolver.resolve(incident);

        assertThat(recipients).hasSize(1);
        assertThat(recipients.get(0).email()).isEqualTo("v@test.com");
    }

    @Test
    void resolve_returnsEventVolonteers_whenIncidentHasEvent() {
        Event event = new Event();
        event.setId(3L);
        Incident incident = new Incident();
        incident.setEvent(event);

        Competition comp = new Competition();
        comp.setId(2L);

        when(competitionRepository.findByParentEventId(3L)).thenReturn(List.of(comp));

        VolonteerAssignment va = new VolonteerAssignment();
        va.setStatus(ParticipationStatus.CONFIRMED);
        Volonteer v = new Volonteer(); v.setId(5L); v.setEmail("v@test.com"); v.setFirstName("Vol");
        va.setVolonteer(v);

        when(volonteerAssignmentRepository.findByCompetitionId(2L)).thenReturn(List.of(va));

        List<NotificationRecipient> recipients = resolver.resolve(incident);

        assertThat(recipients).hasSize(1);
        assertThat(recipients.get(0).email()).isEqualTo("v@test.com");
    }
}
