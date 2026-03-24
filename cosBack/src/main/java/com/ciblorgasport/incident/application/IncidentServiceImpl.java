package com.ciblorgasport.incident.application;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ciblorgasport.analytics.application.AnalyticsService;
import com.ciblorgasport.common.model.Status;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.event.domain.Event;
import com.ciblorgasport.event.infrastructure.EventRepository;
import com.ciblorgasport.incident.domain.ImpactLevel;
import com.ciblorgasport.incident.domain.Incident;
import com.ciblorgasport.incident.domain.IncidentStatus;
import com.ciblorgasport.incident.dto.IncidentCreateRequest;
import com.ciblorgasport.incident.dto.IncidentResponse;
import com.ciblorgasport.incident.dto.IncidentUpdateRequest;
import com.ciblorgasport.incident.infrastructure.IncidentRepository;
import com.ciblorgasport.notification.application.IncidentNotificationService;
import com.ciblorgasport.notification.application.NotificationService;
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import com.ciblorgasport.user.domain.UserAccount;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;
    private final EventRepository eventRepository;
    private final CompetitionRepository competitionRepository;
    private final SiteRepository siteRepository;
    private final TrialRepository trialRepository;
    private final AnalyticsService analyticsService;
    private final IncidentNotificationService incidentNotificationService;
    private final NotificationService notificationService;

    @Override
    public IncidentResponse create(UserAccount actor, IncidentCreateRequest req) {
        assertAdmin(actor);

        Event event = loadEventRequired(req.getEventId());
        Competition competition = loadCompetitionOrNull(req.getCompetitionId());
        Site site = loadSiteOrNull(req.getSiteId());
        Trial trial = loadTrialOrNull(req.getTrialId());
        Set<ImpactLevel> impacts = normalizeImpactLevels(req.getImpactLevels());

        validateLinks(event, competition, trial);

        Incident incident = Incident.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .impactLevels(impacts)
                .status(IncidentStatus.EN_COURS)
                .event(event)
                .competition(competition)
                .site(site)
                .trial(trial)
                .createdBy(actor)
                .build();

        Incident saved = incidentRepository.saveAndFlush(incident);
        System.out.println("=== TRACKING INCIDENT ===");
        analyticsService.logAction(actor.getEmail(), "INCIDENT_CREATED", "Titre: " + req.getTitle());
        incidentNotificationService.notifyIncidentCreated(saved);
        return toResponse(saved);
    }

    @Override
    public IncidentResponse update(UserAccount actor, Long id, IncidentUpdateRequest req) {
        assertAdmin(actor);

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident introuvable."));

        Event event = loadEventRequired(req.getEventId());
        Competition competition = loadCompetitionOrNull(req.getCompetitionId());
        Site site = loadSiteOrNull(req.getSiteId());
        Trial trial = loadTrialOrNull(req.getTrialId());
        Set<ImpactLevel> impacts = normalizeImpactLevels(req.getImpactLevels());

        validateLinks(event, competition, trial);

        incident.setTitle(req.getTitle());
        incident.setDescription(req.getDescription());
        incident.setImpactLevels(impacts);
        incident.setEvent(event);
        incident.setCompetition(competition);
        incident.setSite(site);
        incident.setTrial(trial);

        Incident saved = incidentRepository.saveAndFlush(incident);
        incidentNotificationService.notifyIncidentUpdated(saved);
        return toResponse(saved);
    }

    @Override
    public IncidentResponse changeStatus(UserAccount actor, Long id, IncidentStatus status) {
        assertAdmin(actor);

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident introuvable."));

        incident.setStatus(status);
        Incident saved = incidentRepository.saveAndFlush(incident);

        if (status == IncidentStatus.RESOLU) {
            incidentNotificationService.notifyIncidentResolved(saved);
        }

        return toResponse(saved);
    }

    @Override
    public void delete(UserAccount actor, Long id) {
        assertAdmin(actor);

        if (!incidentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident introuvable.");
        }

        // Suppression des notifications liées avant de supprimer l'incident
        // pour éviter les violations de clé étrangère (notification.incident_id -> incident.id).
        notificationService.deleteByIncidentId(id);
        incidentRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public IncidentResponse getById(UserAccount actor, Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident introuvable."));

        if (!canView(actor, incident.getImpactLevels())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé.");
        }

        return toResponse(incident);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentResponse> list(
            UserAccount actor,
            Long eventId,
            Set<ImpactLevel> impactLevels,
            Long competitionId,
            Long siteId,
            Long trialId
    ) {
        if (eventId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "eventId est obligatoire.");
        }

        List<Incident> incidents = incidentRepository.findByEvent_Id(eventId);

        return incidents.stream()
                .filter(i -> impactLevels == null || impactLevels.isEmpty()
                        || (i.getImpactLevels() != null && i.getImpactLevels().stream().anyMatch(impactLevels::contains)))
                .filter(i -> competitionId == null || (i.getCompetition() != null && Objects.equals(i.getCompetition().getId(), competitionId)))
                .filter(i -> siteId == null || (i.getSite() != null && Objects.equals(i.getSite().getId(), siteId)))
                .filter(i -> trialId == null || (i.getTrial() != null && Objects.equals(i.getTrial().getId(), trialId)))
                .filter(i -> canView(actor, i.getImpactLevels()))
                .map(this::toResponse)
                .toList();
    }

    private void assertAdmin(UserAccount actor) {
        if (actor == null || !actor.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé (admin uniquement).");
        }
    }

    private Set<ImpactLevel> normalizeImpactLevels(Set<ImpactLevel> impactLevels) {
        if (impactLevels == null || impactLevels.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "impactLevels est obligatoire.");
        }

        Set<ImpactLevel> normalized = new HashSet<>(impactLevels);

        if (normalized.contains(ImpactLevel.TOUS) && normalized.size() > 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "TOUS ne peut pas être combiné avec d'autres impactLevels."
            );
        }

        return normalized;
    }

    private boolean canView(UserAccount actor, Set<ImpactLevel> impacts) {
        if (actor == null) return false;
        if (actor.isAdmin()) return true;
        if (impacts == null || impacts.isEmpty()) return false;

        if (impacts.contains(ImpactLevel.TOUS)) return true;

        return (impacts.contains(ImpactLevel.COMMISSIONNER) && actor.isCommissionner())
                || (impacts.contains(ImpactLevel.ATHLETE) && actor.isAthlete())
                || (impacts.contains(ImpactLevel.VOLONTEER) && actor.isVolonteer())
                || (impacts.contains(ImpactLevel.SPECTATOR) && actor.isSpectator());
    }

    private Event loadEventRequired(Long eventId) {
        if (eventId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "eventId est obligatoire.");
        }
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event inconnu."));
    }

    private Competition loadCompetitionOrNull(Long competitionId) {
        if (competitionId == null) return null;

        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Competition inconnue."));

        if (competition.getStatus() == Status.COMPLETED) {
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

    private Trial loadTrialOrNull(Long trialId) {
        if (trialId == null) return null;

        return trialRepository.findById(trialId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Epreuve (trial) inconnue."));
    }

    private void validateLinks(Event event, Competition competition, Trial trial) {
        if (competition != null && competition.getParentEvent() != null
                && !Objects.equals(competition.getParentEvent().getId(), event.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La compétition ne correspond pas à l'event.");
        }

        if (trial != null && trial.getCompetition() != null) {
            Competition trialCompetition = trial.getCompetition();

            if (trialCompetition.getParentEvent() != null
                    && !Objects.equals(trialCompetition.getParentEvent().getId(), event.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'épreuve ne correspond pas à l'event.");
            }

            if (competition != null && !Objects.equals(trialCompetition.getId(), competition.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'épreuve ne correspond pas à la compétition.");
            }
        }
    }

    private IncidentResponse toResponse(Incident incident) {
        return IncidentResponse.builder()
                .id(incident.getId())
                .title(incident.getTitle())
                .description(incident.getDescription())
                .impactLevels(incident.getImpactLevels() == null ? Set.of() : Set.copyOf(incident.getImpactLevels()))
                .status(incident.getStatus())
                .eventId(incident.getEvent() == null ? null : incident.getEvent().getId())
                .competitionId(incident.getCompetition() == null ? null : incident.getCompetition().getId())
                .siteId(incident.getSite() == null ? null : incident.getSite().getId())
                .trialId(incident.getTrial() == null ? null : incident.getTrial().getId())
                .createdBy(incident.getCreatedBy() == null ? null : incident.getCreatedBy().getId())
                .createdAt(incident.getCreatedAt())
                .updatedAt(incident.getUpdatedAt())
                .build();
    }
}