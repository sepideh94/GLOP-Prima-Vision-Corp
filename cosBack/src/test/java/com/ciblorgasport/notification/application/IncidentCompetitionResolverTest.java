package com.ciblorgasport.notification.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.incident.domain.Incident;
import com.ciblorgasport.trial.domain.Trial;

class IncidentCompetitionResolverTest {

    @Test
    void returnsCompetitionIdFromIncidentDirectLink() {
        Competition c = new Competition();
        c.setId(10L);
        Incident incident = Incident.builder().competition(c).build();
        assertEquals(10L, IncidentCompetitionResolver.resolveCompetitionId(incident));
    }

    @Test
    void returnsCompetitionIdViaTrial() {
        Competition c = new Competition();
        c.setId(20L);
        Trial trial = new Trial();
        trial.setCompetition(c);
        Incident incident = Incident.builder().trial(trial).build();
        assertEquals(20L, IncidentCompetitionResolver.resolveCompetitionId(incident));
    }

    @Test
    void prefersDirectCompetitionOverTrial() {
        Competition direct = new Competition();
        direct.setId(1L);
        Competition viaTrial = new Competition();
        viaTrial.setId(2L);
        Trial trial = new Trial();
        trial.setCompetition(viaTrial);
        Incident incident = Incident.builder().competition(direct).trial(trial).build();
        assertEquals(1L, IncidentCompetitionResolver.resolveCompetitionId(incident));
    }

    @Test
    void returnsNullWhenNoLink() {
        assertNull(IncidentCompetitionResolver.resolveCompetitionId(Incident.builder().build()));
        assertNull(IncidentCompetitionResolver.resolveCompetitionId(null));
    }
}
