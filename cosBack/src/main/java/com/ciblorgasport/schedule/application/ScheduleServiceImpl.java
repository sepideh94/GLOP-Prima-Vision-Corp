package com.ciblorgasport.schedule.application;

import com.ciblorgasport.schedule.ScheduleRepository;
import com.ciblorgasport.schedule.domain.ScheduleItem;
import com.ciblorgasport.schedule.domain.ScheduleType;
import com.ciblorgasport.schedule.domain.VolunteerTask;
import com.ciblorgasport.schedule.dto.AthleteTrialScheduleResponse;
import com.ciblorgasport.schedule.dto.ScheduleCreateRequest;
import com.ciblorgasport.schedule.dto.ScheduleResponse;
import com.ciblorgasport.schedule.dto.VolunteerScheduleSummary;
import com.ciblorgasport.common.exception.BusinessValidationException;
import com.ciblorgasport.common.exception.ResourceNotFoundException;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.site.dto.SiteResponse;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import com.ciblorgasport.trial.application.TrialService;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.dto.TrialResponse;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import com.ciblorgasport.common.model.Status;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;
import com.ciblorgasport.volonteer.domain.Volonteer;
import com.ciblorgasport.volonteer.domain.VolonteerAssignment;
import com.ciblorgasport.volonteer.infrastructure.VolonteerAssignmentRepository;
import com.ciblorgasport.volonteer.infrastructure.VolonteerRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final SiteRepository siteRepository;
    private final CompetitionRepository competitionRepository;
    private final UserAccountRepository userRepository;
    private final VolonteerAssignmentRepository volonteerAssignmentRepository;
    private final TrialRepository trialRepository;
    private final VolonteerRepository volonteerRepository;
    private final TrialParticipantRepository trialParticipantRepository;
    
    @Override
    @Transactional
    public List<ScheduleResponse> createSchedules(ScheduleCreateRequest request, UserAccount currentUser) {
        
    	
       
        if (currentUser.isCommissionner() && request.getType() != ScheduleType.ATHLETE) {
            throw new AccessDeniedException("Un commissaire ne peut créer que des plannings pour athlètes."); 
        }

     
        Competition comp = competitionRepository.findById(request.getCompetitionId())
                .orElseThrow(() -> new ResourceNotFoundException("Compétition non trouvée"));

        if (request.getStartTime().isBefore(comp.getStartDate()) || request.getEndTime().isAfter(comp.getEndDate())) {
            throw new BusinessValidationException("Les horaires du planning doivent être compris dans les dates de la compétition ("
                + comp.getStartDate() + " au " + comp.getEndDate() + ")");
        }

    
        if (request.getAssignedUserIds() == null || request.getAssignedUserIds().isEmpty()) {
            ScheduleItem generalItem = createSingleItem(request, null, comp, currentUser);
            return List.of(convertToResponse(scheduleRepository.save(generalItem)));
        }

        return request.getAssignedUserIds().stream()
                .map(userId -> {
                    UserAccount assignedUser = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur " + userId + " non trouvé"));
                    
                    ScheduleItem item = createSingleItem(request, assignedUser, comp, currentUser);
                    ScheduleItem savedItem = scheduleRepository.save(item);

                    VolonteerAssignment assignment = new VolonteerAssignment();
                    
                    Volonteer volonteer = volonteerRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("Profil volontaire introuvable"));

                    assignment.setVolonteer(volonteer);
                    assignment.setTitle(savedItem.getTitle());
                    assignment.setCompetition(comp);
                    assignment.setStartTime(request.getStartTime());
                    assignment.setEndTime(request.getEndTime());
                    assignment.setSite(savedItem.getSite());
                    assignment.setStatus(com.ciblorgasport.competition.domain.ParticipationStatus.CONFIRMED);
                    
                    volonteerAssignmentRepository.save(assignment);

                    return convertToResponse(savedItem);
                })
                .collect(Collectors.toList());
    }
    
    private ScheduleItem createSingleItem(ScheduleCreateRequest request, UserAccount assignedUser, Competition comp, UserAccount creator) {
        ScheduleItem item = new ScheduleItem();
        item.setTitle(request.getTask() != null ? request.getTask().getLabel() : request.getTitle());
        item.setDescription(request.getDescription());
        item.setStartTime(request.getStartTime());
        item.setEndTime(request.getEndTime());
        item.setType(request.getType());
        item.setStatus(Status.UPCOMING);
        item.setCreatedBy(creator);
        item.setCompetition(comp);
        item.setAssignedUser(assignedUser);

        if (request.getSiteId() != null) {
            item.setSite(siteRepository.findById(request.getSiteId()).orElse(null));
        }
        
        return item;
    }
	
    private ScheduleResponse convertToResponse(ScheduleItem item) {
        SiteResponse siteDto = null;
        if (item.getSite() != null) {
            siteDto = SiteResponse.builder()
                    .id(item.getSite().getId())
                    .adress(item.getSite().getAdress())
                    .latitude(item.getSite().getLatitude())
                    .longitude(item.getSite().getLongitude())
                    .build();
        }

        Status dynamicStatus = calculateStatus(item);

        return ScheduleResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .startTime(item.getStartTime())
                .endTime(item.getEndTime())
                .type(item.getType())
                .status(dynamicStatus) 
                .site(siteDto)
                .competitionId(item.getCompetition() != null ? item.getCompetition().getId() : null)
                .competitionName(item.getCompetition() != null ? item.getCompetition().getName() : null)
                .assignedUserName(item.getAssignedUser() != null ? 
                    item.getAssignedUser().getFirstName() + " " + item.getAssignedUser().getLastName() : "Général")
                .build();
    }

    @Scheduled(cron = "0 0/15 * * * *") 
    @Transactional
    public void updateAllSchedulesStatus() {
    	
        List<ScheduleItem> activeItems = scheduleRepository.findAll().stream()
                .filter(item -> item.getStatus() != Status.COMPLETED && item.getStatus() != Status.CANCELED)
                .toList();

        activeItems.forEach(this::updateStatusIfNecessary);
    }

    /**
     * Logique de mise à jour si le statut calculé diffère du statut en base.
     */
    private void updateStatusIfNecessary(ScheduleItem item) {
        Status calculatedStatus = calculateStatus(item);
        if (item.getStatus() != calculatedStatus) {
            item.setStatus(calculatedStatus);
            scheduleRepository.save(item);
        }
    }

    /**
     * Calcul du statut basé sur le temps (Complexité cyclomatique O(1)).
     */
    private Status calculateStatus(ScheduleItem item) {
        LocalDateTime now = LocalDateTime.now();

        if (item.getStatus() == Status.CANCELED) {
            return Status.CANCELED;
        }
        if (now.isBefore(item.getStartTime())) {
            return Status.UPCOMING;
        }
        if (now.isAfter(item.getEndTime())) {
            return Status.COMPLETED;
        }
        return Status.IN_PROGRESS;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getSchedulesForUser(UserAccount currentUser) {
        List<ScheduleItem> items = scheduleRepository.findByAssignedUserId(currentUser.getId());

        items.forEach(this::updateStatusIfNecessary);

        return items.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private VolunteerScheduleSummary createEmptySummary(VolonteerAssignment va) {
        return VolunteerScheduleSummary.builder()
            .title(va.getTitle() != null ? va.getTitle() : "Sans titre")
            .competitionName(va.getCompetition() != null ? va.getCompetition().getName() : "Inconnue")
            .siteAddress("Lieu non défini")
            .assignmentStatus(va.getStatus() != null ? va.getStatus().name() : "PENDING")
            .occurringTrialNames(List.of())
            .build();
    }
    
    @Override
    public List<VolunteerScheduleSummary> getVolunteerSchedule(Long volunteerId) {
        List<VolonteerAssignment> assignments = volonteerAssignmentRepository.findByVolonteerId(volunteerId);

        return assignments.stream()
            .filter(va -> va.getStartTime() != null) 
            .map(va -> {
                Site missionSite = va.getSite(); 
                if (missionSite == null || va.getEndTime() == null) {
                    return createEmptySummary(va);
                }

                List<Trial> trials = trialRepository.findBySiteAndPeriod(
                    missionSite.getId(),
                    va.getStartTime().toLocalDate(),
                    va.getStartTime().toLocalTime(),
                    va.getEndTime().toLocalDate(),
                    va.getEndTime().toLocalTime()
                );

                return VolunteerScheduleSummary.builder()
                    .title(va.getTitle()) 
                    .competitionName(va.getCompetition().getName())
                    .missionStart(va.getStartTime())
                    .missionEnd(va.getEndTime())
                    .siteAddress(missionSite.getAdress())
                    .assignmentStatus(va.getStatus().name())
                    .occurringTrialNames(trials.stream().map(Trial::getName).toList())
                    .build();
            })
            .toList();
    }

    @Override
public List<AthleteTrialScheduleResponse> getAthleteScheduleByCompetition(Long athleteId, Long competitionId) {
    List<TrialParticipant> participations =
            trialParticipantRepository.findAllDirectAndTeamTrialParticipations(athleteId);

    return participations.stream()
            .filter(tp -> tp.getTrial() != null)
            .filter(tp -> tp.getTrial().getCompetition() != null)
            .filter(tp -> tp.getTrial().getCompetition().getId().equals(competitionId))
            .map(tp -> {
                Trial trial = tp.getTrial();

                return new AthleteTrialScheduleResponse(
                        trial.getId(),
                        tp.getId(),
                        trial.getName(),
                        trial.getRound() != null ? trial.getRound().getName().name() : "N/A",
                        LocalDateTime.of(trial.getStartDate(), trial.getStartHour()),
                        LocalDateTime.of(trial.getEndDate(), trial.getEndHour()),
                        trial.getSite() != null ? trial.getSite().getAdress() : "Non assigné",
                        trial.getStatus() != null ? trial.getStatus().name() : null,
                        tp.getStatus() != null ? tp.getStatus().name() : null,
                        trial.getCompetition() != null ? trial.getCompetition().getName() : null
                );
            })
            .sorted(Comparator.comparing(AthleteTrialScheduleResponse::startTime))
            .toList();
}
}
    
   
