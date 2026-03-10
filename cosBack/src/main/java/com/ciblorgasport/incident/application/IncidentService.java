package com.ciblorgasport.incident.application;

import java.util.List;

import com.ciblorgasport.incident.domain.ImpactLevel;
import com.ciblorgasport.incident.domain.IncidentStatus;
import com.ciblorgasport.incident.dto.IncidentCreateRequest;
import com.ciblorgasport.incident.dto.IncidentResponse;
import com.ciblorgasport.incident.dto.IncidentUpdateRequest;
import com.ciblorgasport.user.domain.UserAccount;

public interface IncidentService {

    IncidentResponse create(UserAccount actor, IncidentCreateRequest req);

    IncidentResponse update(UserAccount actor, Long id, IncidentUpdateRequest req);

    IncidentResponse changeStatus(UserAccount actor, Long id, IncidentStatus status);

    void delete(UserAccount actor, Long id);

    IncidentResponse getById(UserAccount actor, Long id);

    List<IncidentResponse> list(UserAccount actor, ImpactLevel impactLevel, Long competitionId, Long siteId);
}