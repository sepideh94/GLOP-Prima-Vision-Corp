package com.ciblorgasport.incident.api;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.incident.application.IncidentService;
import com.ciblorgasport.incident.domain.ImpactLevel;
import com.ciblorgasport.incident.dto.IncidentCreateRequest;
import com.ciblorgasport.incident.dto.IncidentResponse;
import com.ciblorgasport.incident.dto.IncidentStatusUpdateRequest;
import com.ciblorgasport.incident.dto.IncidentUpdateRequest;
import com.ciblorgasport.user.domain.UserAccount;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@Validated
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping
    public IncidentResponse create(
            @AuthenticationPrincipal UserAccount user,
            @Valid @RequestBody IncidentCreateRequest request) {
        return incidentService.create(user, request);
    }

    @GetMapping
    public List<IncidentResponse> list(
            @AuthenticationPrincipal UserAccount user,
            @RequestParam(value = "eventId") @NotNull Long eventId,
            @RequestParam(value = "impact_level", required = false) ImpactLevel impactLevel,
            @RequestParam(value = "competitionId", required = false) Long competitionId,
            @RequestParam(value = "siteId", required = false) Long siteId,
            @RequestParam(value = "trialId", required = false) Long trialId) {
        return incidentService.list(user, eventId, impactLevel, competitionId, siteId, trialId);
    }

    @GetMapping("/{id}")
    public IncidentResponse getById(
            @AuthenticationPrincipal UserAccount user,
            @PathVariable Long id) {
        return incidentService.getById(user, id);
    }

    @PutMapping("/{id}")
    public IncidentResponse update(
            @AuthenticationPrincipal UserAccount user,
            @PathVariable Long id,
            @Valid @RequestBody IncidentUpdateRequest request) {
        return incidentService.update(user, id, request);
    }

    @PatchMapping("/{id}/status")
    public IncidentResponse changeStatus(
            @AuthenticationPrincipal UserAccount user,
            @PathVariable Long id,
            @Valid @RequestBody IncidentStatusUpdateRequest request) {
        return incidentService.changeStatus(user, id, request.getStatus());
    }

    @DeleteMapping("/{id}")
    public void delete(
            @AuthenticationPrincipal UserAccount user,
            @PathVariable Long id) {
        incidentService.delete(user, id);
    }
}