package com.ciblorgasport.schedule.application;

import com.ciblorgasport.schedule.ScheduleRepository;
import com.ciblorgasport.schedule.domain.ScheduleCreateRequest;
import com.ciblorgasport.schedule.domain.ScheduleItem;
import com.ciblorgasport.schedule.domain.ScheduleType;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import com.ciblorgasport.competition.infrastructure.CompetitionRepository;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final SiteRepository siteRepository;
    private final CompetitionRepository competitionRepository;
    private final UserAccountRepository userRepository;
    
	@Override
	public ScheduleItem createSchedule(ScheduleCreateRequest request, UserAccount currentUser) {
		if (currentUser.isCommissionner() && request.getType() != ScheduleType.ATHLETE) {
            throw new AccessDeniedException("Un commissaire ne peut créer que des plannings pour athlètes."); 
        }

        ScheduleItem item = new ScheduleItem();
        item.setTitle(request.getTitle());
        item.setStartTime(request.getStartTime());
        item.setEndTime(request.getEndTime());
        item.setType(request.getType());
        item.setCreatedBy(currentUser);

        item.setSite(siteRepository.findById(request.getSiteId()).orElse(null));
        item.setCompetition(competitionRepository.findById(request.getCompetitionId()).orElse(null));
        
        if (request.getAssignedUserId() != null) {
            item.setAssignedUser(userRepository.findById(request.getAssignedUserId()).orElse(null));
        }

        return scheduleRepository.save(item);
    }
}
    
   
