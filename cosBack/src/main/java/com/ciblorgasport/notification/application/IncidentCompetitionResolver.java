package com.ciblorgasport.notification.application;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.incident.domain.Incident;

/**
 * Déduit la compétition concernée par un incident (liaison directe ou via l'épreuve).
 */
public final class IncidentCompetitionResolver {

    private IncidentCompetitionResolver() {
    }

    public static Long resolveCompetitionId(Incident incident) {
        if (incident == null) {
            return null;
        }
        if (incident.getCompetition() != null) {
            return incident.getCompetition().getId();
        }
        if (incident.getTrial() != null && incident.getTrial().getCompetition() != null) {
            Competition c = incident.getTrial().getCompetition();
            return c.getId();
        }
        return null;
    }
}
