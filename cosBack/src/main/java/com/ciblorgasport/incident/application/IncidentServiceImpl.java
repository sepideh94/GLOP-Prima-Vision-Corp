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
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import com.ciblorgasport.user.domain.UserAccount;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;
    private final CompetitionRepository competitionRepository;
    private final SiteRepository siteRepository;

    @Override
    public IncidentResponse create(UserAccount actor, IncidentCreateRequest req) {
        assertAdmin(actor);

        Incident incident = Incident.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .impactLevel(req.getImpactLevel())
                .status(IncidentStatus.EN_COURS)
                .competition(loadCompetitionOrNull(req.getCompetitionId()))
                .site(loadSiteOrNull(req.getSiteId()))
                .createdBy(actor)
                .build();

        return toResponse(incidentRepository.save(incident));
    }

    @Override
    public IncidentResponse update(UserAccount actor, Long id, IncidentUpdateRequest req) {
        assertAdmin(actor);

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident introuvable."));

        incident.setTitle(req.getTitle());
        incident.setDescription(req.getDescription());
        incident.setImpactLevel(req.getImpactLevel());
        incident.setCompetition(loadCompetitionOrNull(req.getCompetitionId()));
        incident.setSite(loadSiteOrNull(req.getSiteId()));

        return toResponse(incidentRepository.save(incident));
    }

    @Override
    public IncidentResponse changeStatus(UserAccount actor, Long id, IncidentStatus status) {
        assertAdmin(actor);

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident introuvable."));

        incident.setStatus(status);
        return toResponse(incidentRepository.save(incident));
    }

    @Override
    public void delete(UserAccount actor, Long id) {
        assertAdmin(actor);

        if (!incidentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident introuvable.");
        }
        incidentRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public IncidentResponse getById(UserAccount actor, Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident introuvable."));

        if (!canView(actor, incident.getImpactLevel())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé.");
        }

        return toResponse(incident);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentResponse> list(UserAccount actor, ImpactLevel impactLevel, Long competitionId, Long siteId) {
        List<Incident> incidents;

        boolean hasImpact = impactLevel != null;
        boolean hasCompetition = competitionId != null;
        boolean hasSite = siteId != null;

        if (hasCompetition && hasSite && hasImpact) {
            incidents = incidentRepository.findByCompetition_IdAndSite_IdAndImpactLevel(competitionId, siteId, impactLevel);
        } else if (hasCompetition && hasSite) {
            incidents = incidentRepository.findByCompetition_IdAndSite_Id(competitionId, siteId);
        } else if (hasCompetition && hasImpact) {
            incidents = incidentRepository.findByCompetition_IdAndImpactLevel(competitionId, impactLevel);
        } else if (hasSite && hasImpact) {
            incidents = incidentRepository.findBySite_IdAndImpactLevel(siteId, impactLevel);
        } else if (hasCompetition) {
            incidents = incidentRepository.findByCompetition_Id(competitionId);
        } else if (hasSite) {
            incidents = incidentRepository.findBySite_Id(siteId);
        } else if (hasImpact) {
            incidents = incidentRepository.findByImpactLevel(impactLevel);
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

        if (impact == ImpactLevel.TOUS) return true;

        if (impact == ImpactLevel.COMMISSIONNER) return actor.isCommissionner();
        if (impact == ImpactLevel.ATHLETE) return actor.isAthlete();
        if (impact == ImpactLevel.VOLONTEER) return actor.isVolonteer();
        if (impact == ImpactLevel.SPECTATOR) return actor.isSpectator();

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

    private Site loadSiteOrNull(Long siteId) {
        if (siteId == null) return null;

        return siteRepository.findById(siteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Site inconnu."));
    }

    private IncidentResponse toResponse(Incident incident) {
        Long competitionId = incident.getCompetition() == null ? null : incident.getCompetition().getId();
        Long siteId = incident.getSite() == null ? null : incident.getSite().getId();
        Long createdById = incident.getCreatedBy() == null ? null : incident.getCreatedBy().getId();

        return IncidentResponse.builder()
                .id(incident.getId())
                .title(incident.getTitle())
                .description(incident.getDescription())
                .impactLevel(incident.getImpactLevel())
                .status(incident.getStatus())
                .competitionId(competitionId)
                .siteId(siteId)
                .createdBy(createdById)
                .createdAt(incident.getCreatedAt())
                .updatedAt(incident.getUpdatedAt())
                .build();
    }
}