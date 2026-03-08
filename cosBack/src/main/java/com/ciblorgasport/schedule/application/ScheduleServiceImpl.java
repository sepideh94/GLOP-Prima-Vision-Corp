package com.ciblorgasport.schedule.application;

import com.ciblorgasport.schedule.ScheduleRepository;
import com.ciblorgasport.schedule.domain.ScheduleItem;
import com.ciblorgasport.schedule.domain.ScheduleType;
import com.ciblorgasport.schedule.dto.ScheduleCreateRequest;
import com.ciblorgasport.schedule.dto.ScheduleResponse;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.site.dto.SiteResponse;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import com.ciblorgasport.common.model.Status;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final SiteRepository siteRepository;
    private final CompetitionRepository competitionRepository;
    private final UserAccountRepository userRepository;
    
    @Override
    @Transactional
    public List<ScheduleResponse> createSchedules(ScheduleCreateRequest request, UserAccount currentUser) {
        
       
        if (currentUser.isCommissionner() && request.getType() != ScheduleType.ATHLETE) {
            throw new AccessDeniedException("Un commissaire ne peut créer que des plannings pour athlètes."); 
        }

     
        Competition comp = competitionRepository.findById(request.getCompetitionId())
                .orElseThrow(() -> new RuntimeException("Compétition non trouvée"));

        if (request.getStartTime().isBefore(comp.getStartDate()) || request.getEndTime().isAfter(comp.getEndDate())) {
            throw new RuntimeException("Les horaires du planning doivent être compris dans les dates de la compétition (" 
                + comp.getStartDate() + " au " + comp.getEndDate() + ")");
        }

    
        if (request.getAssignedUserIds() == null || request.getAssignedUserIds().isEmpty()) {
            ScheduleItem generalItem = createSingleItem(request, null, comp, currentUser);
            return List.of(convertToResponse(scheduleRepository.save(generalItem)));
        }

        return request.getAssignedUserIds().stream()
                .map(userId -> {
                    UserAccount assignedUser = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("Utilisateur " + userId + " non trouvé"));
                    
                    ScheduleItem item = createSingleItem(request, assignedUser, comp, currentUser);
                    return convertToResponse(scheduleRepository.save(item));
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

        return ScheduleResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .startTime(item.getStartTime())
                .endTime(item.getEndTime())
                .type(item.getType())
                .status(item.getStatus())
                .site(siteDto)
                .competitionId(item.getCompetition() != null ? item.getCompetition().getId() : null)
                .competitionName(item.getCompetition() != null ? item.getCompetition().getName() : null)
                .assignedUserName(item.getAssignedUser() != null ? 
                    item.getAssignedUser().getFirstName() + " " + item.getAssignedUser().getLastName() : "Général")
                .build();
    }
}
    
   
