package com.ciblorgasport.notification.application;

import com.ciblorgasport.incident.domain.Incident;

public interface IncidentNotificationService {
    void notifyIncidentCreated(Incident incident);
}