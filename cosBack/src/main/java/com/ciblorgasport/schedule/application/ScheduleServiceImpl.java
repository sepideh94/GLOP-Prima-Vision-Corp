package com.ciblorgasport.schedule.application;

import com.ciblorgasport.schedule.ScheduleRepository;
import com.ciblorgasport.schedule.domain.ScheduleItem;
import com.ciblorgasport.schedule.domain.ScheduleType;
import com.ciblorgasport.schedule.dto.ScheduleCreateRequest;
import com.ciblorgasport.schedule.dto.ScheduleResponse;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.site.dto.SiteResponse;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    public ScheduleResponse createSchedule(ScheduleCreateRequest request, UserAccount currentUser) {
        
        if (currentUser.isCommissionner() && request.getType() != ScheduleType.ATHLETE) {
            throw new AccessDeniedException("Un commissaire ne peut créer que des plannings pour athlètes."); 
        }

        ScheduleItem item = new ScheduleItem();
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setStartTime(request.getStartTime());
        item.setEndTime(request.getEndTime());
        item.setType(request.getType());
        item.setCreatedBy(currentUser);

        if (request.getSiteId() != null) {
            item.setSite(siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new RuntimeException("Site non trouvé")));
        }
        
        if (request.getCompetitionId() != null) {
            item.setCompetition(competitionRepository.findById(request.getCompetitionId())
                .orElseThrow(() -> new RuntimeException("Compétition non trouvée")));
        }
        
        if (request.getAssignedUserId() != null) {
            item.setAssignedUser(userRepository.findById(request.getAssignedUserId())
                .orElseThrow(() -> new RuntimeException("Utilisateur assigné non trouvé")));
        }

        ScheduleItem savedItem = scheduleRepository.save(item);

        return convertToResponse(savedItem);
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
                .build();
    }
}
    
   
