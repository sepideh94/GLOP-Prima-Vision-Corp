package com.ciblorgasport.schedule.application;

import com.ciblorgasport.schedule.domain.ScheduleCreateRequest;
import com.ciblorgasport.schedule.domain.ScheduleItem;
import com.ciblorgasport.user.domain.UserAccount;

public interface ScheduleService {
	
	public ScheduleItem createSchedule(ScheduleCreateRequest request, UserAccount currentUser);

}
