package com.ciblorgasport.notification.application;

import com.ciblorgasport.incident.domain.Incident;

public interface IncidentNotificationService {
    void notifyIncidentCreated(Incident incident);
    void notifyIncidentUpdated(Incident incident);
    void notifyIncidentResolved(Incident incident);
}