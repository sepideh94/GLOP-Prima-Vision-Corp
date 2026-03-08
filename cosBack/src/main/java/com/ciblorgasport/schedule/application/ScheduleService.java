package com.ciblorgasport.schedule.application;

import com.ciblorgasport.schedule.dto.ScheduleCreateRequest;
import com.ciblorgasport.schedule.dto.ScheduleResponse;
import com.ciblorgasport.user.domain.UserAccount;

public interface ScheduleService {
	
	public ScheduleResponse createSchedule(ScheduleCreateRequest request, UserAccount currentUser);

}
