package com.ciblorgasport.notification.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.incident.domain.Incident;
import com.ciblorgasport.notification.dto.NotificationRecipient;
import com.ciblorgasport.team.domain.Team;
import com.ciblorgasport.team.infrastructure.TeamRepository;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;

@ExtendWith(MockitoExtension.class)
class AthleteIncidentRecipientResolverTest {

    @Mock private ParticipationRepository participationRepository;
    @Mock private TrialParticipantRepository trialParticipantRepository;
    @Mock private AthleteRepository athleteRepository;
    @Mock private CompetitionRepository competitionRepository;
    @Mock private TeamRepository teamRepository;

    @InjectMocks
    private AthleteIncidentRecipientResolver resolver;

    @Test
    void resolve_returnsEmptyList_whenIncidentIsNull() {
        List<NotificationRecipient> recipients = resolver.resolve(null);
        assertThat(recipients).isEmpty();
    }

    @Test
    void resolve_returnsTrialAthletes_whenIncidentHasTrial() {
        Trial trial = new Trial();
        trial.setId(1L);
        Incident incident = new Incident();
        incident.setTrial(trial);

        TrialParticipant tp1 = new TrialParticipant();
        tp1.setCompetitorType(CompetitorType.ATHLETE);
        tp1.setCompetitorId(10L);

        TrialParticipant tp2 = new TrialParticipant();
        tp2.setCompetitorType(CompetitorType.TEAM);
        tp2.setCompetitorId(20L);

        when(trialParticipantRepository.findByTrialId(1L)).thenReturn(List.of(tp1, tp2));

        Athlete a1 = new Athlete(); a1.setId(10L); a1.setEmail("a1@test.com"); a1.setFirstName("John");
        when(athleteRepository.findById(10L)).thenReturn(Optional.of(a1));

        Team team = new Team(); team.setId(20L);
        Athlete a2 = new Athlete(); a2.setId(11L); a2.setEmail("a2@test.com"); a2.setFirstName("Jane");
        team.setMembers(List.of(a2));
        when(teamRepository.findById(20L)).thenReturn(Optional.of(team));

        List<NotificationRecipient> recipients = resolver.resolve(incident);

        assertThat(recipients).hasSize(2);
        assertThat(recipients).extracting("email").containsExactlyInAnyOrder("a1@test.com", "a2@test.com");
    }

    @Test
    void resolve_returnsCompetitionAthletes_whenIncidentHasCompetition() {
        Competition comp = new Competition();
        comp.setId(2L);
        Incident incident = new Incident();
        incident.setCompetition(comp);

        Participation p = new Participation();
        p.setStatus(ParticipationStatus.CONFIRMED);
        p.setCompetitorType(CompetitorType.ATHLETE);
        p.setCompetitorId(10L);

        when(participationRepository.findByCompetition_Id(2L)).thenReturn(List.of(p));

        Athlete a1 = new Athlete(); a1.setId(10L); a1.setEmail("a1@test.com"); a1.setFirstName("John");
        when(athleteRepository.findById(10L)).thenReturn(Optional.of(a1));

        List<NotificationRecipient> recipients = resolver.resolve(incident);

        assertThat(recipients).hasSize(1);
        assertThat(recipients.get(0).email()).isEqualTo("a1@test.com");
    }

    @Test
    void resolve_returnsEventAthletes_whenIncidentHasEvent() {
        Event event = new Event();
        event.setId(3L);
        Incident incident = new Incident();
        incident.setEvent(event);

        Competition comp = new Competition();
        comp.setId(2L);

        when(competitionRepository.findByParentEventId(3L)).thenReturn(List.of(comp));

        Participation p = new Participation();
        p.setStatus(ParticipationStatus.CONFIRMED);
        p.setCompetitorType(CompetitorType.ATHLETE);
        p.setCompetitorId(10L);

        when(participationRepository.findByCompetition_Id(2L)).thenReturn(List.of(p));

        Athlete a1 = new Athlete(); a1.setId(10L); a1.setEmail("a1@test.com"); a1.setFirstName("John");
        when(athleteRepository.findById(10L)).thenReturn(Optional.of(a1));

        List<NotificationRecipient> recipients = resolver.resolve(incident);

        assertThat(recipients).hasSize(1);
        assertThat(recipients.get(0).email()).isEqualTo("a1@test.com");
    }
}
