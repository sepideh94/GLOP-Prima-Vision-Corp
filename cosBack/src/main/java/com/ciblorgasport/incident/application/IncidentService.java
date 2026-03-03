package com.ciblorgasport.incident.application;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ciblorgasport.common.model.Status;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.incident.domain.ImpactLevel;
import com.ciblorgasport.incident.domain.Incident;
import com.ciblorgasport.incident.domain.IncidentStatus;
import com.ciblorgasport.incident.dto.IncidentCreateRequest;
import com.ciblorgasport.incident.dto.IncidentResponse;
import com.ciblorgasport.incident.dto.IncidentUpdateRequest;
import com.ciblorgasport.incident.infrastructure.IncidentRepository;
import com.ciblorgasport.user.domain.UserAccount;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final CompetitionRepository competitionRepository;

    public IncidentResponse create(UserAccount actor, IncidentCreateRequest req) {
        assertAdmin(actor);

        Incident incident = Incident.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .impactLevel(req.getImpactLevel())
                .status(IncidentStatus.OUVERT)
                .competition(loadCompetitionOrNull(req.getCompetitionId()))
                .createdBy(actor)
                .build();

        return toResponse(incidentRepository.save(incident));
    }

    public IncidentResponse update(UserAccount actor, Long id, IncidentUpdateRequest req) {
        assertAdmin(actor);

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident introuvable."));

        incident.setTitle(req.getTitle());
        incident.setDescription(req.getDescription());
        incident.setImpactLevel(req.getImpactLevel());
        incident.setCompetition(loadCompetitionOrNull(req.getCompetitionId()));

        return toResponse(incidentRepository.save(incident));
    }

    public IncidentResponse changeStatus(UserAccount actor, Long id, IncidentStatus status) {
        assertAdmin(actor);

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident introuvable."));

        incident.setStatus(status);
        return toResponse(incidentRepository.save(incident));
    }

    public void delete(UserAccount actor, Long id) {
        assertAdmin(actor);

        if (!incidentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident introuvable.");
        }
        incidentRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public IncidentResponse getById(UserAccount actor, Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident introuvable."));

        if (!canView(actor, incident.getImpactLevel())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé.");
        }

        return toResponse(incident);
    }

    @Transactional(readOnly = true)
    public List<IncidentResponse> list(UserAccount actor, ImpactLevel impactLevel, Long competitionId) {
        List<Incident> incidents;

        if (impactLevel != null && competitionId != null) {
            incidents = incidentRepository.findByCompetition_IdAndImpactLevel(competitionId, impactLevel);
        } else if (impactLevel != null) {
            incidents = incidentRepository.findByImpactLevel(impactLevel);
        } else if (competitionId != null) {
            incidents = incidentRepository.findByCompetition_Id(competitionId);
        } else {
            incidents = incidentRepository.findAll();
        }

        return incidents.stream()
                .filter(i -> canView(actor, i.getImpactLevel()))
                .map(this::toResponse)
                .toList();
    }

    private void assertAdmin(UserAccount actor) {
        if (actor == null || !actor.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé (admin uniquement).");
        }
    }

    private boolean canView(UserAccount actor, ImpactLevel impact) {
        if (actor == null) return false;
        if (actor.isAdmin()) return true;

        if (actor.isCommissionner()) {
            return impact == ImpactLevel.COMMISSIONNERS
                    || impact == ImpactLevel.COMMISSIONNERS_ATHLETES
                    || impact == ImpactLevel.TOUS;
        }

        if (actor.isAthlete()) {
            return impact == ImpactLevel.COMMISSIONNERS_ATHLETES
                    || impact == ImpactLevel.TOUS;
        }

        if (actor.isVolonteer() || actor.isSpectator()) {
            return impact == ImpactLevel.TOUS;
        }

        return false;
    }

    private Competition loadCompetitionOrNull(Long competitionId) {
        if (competitionId == null) return null;

        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Competition inconnue."));

        Status status = competition.getStatus();
        if (status == Status.COMPLETED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Impossible de déclarer un incident sur une compétition terminée."
            );
        }

        return competition;
    }

    private IncidentResponse toResponse(Incident incident) {
        Long competitionId = incident.getCompetition() == null ? null : incident.getCompetition().getId();
        Long createdById = incident.getCreatedBy() == null ? null : incident.getCreatedBy().getId();

        return IncidentResponse.builder()
                .id(incident.getId())
                .title(incident.getTitle())
                .description(incident.getDescription())
                .impactLevel(incident.getImpactLevel())
                .status(incident.getStatus())
                .competitionId(competitionId)
                .createdBy(createdById)
                .createdAt(incident.getCreatedAt())
                .updatedAt(incident.getUpdatedAt())
                .build();
    }
}