package com.ciblorgasport.schedule.application;

import java.util.List;

import com.ciblorgasport.schedule.dto.ScheduleCreateRequest;
import com.ciblorgasport.schedule.dto.ScheduleResponse;
import com.ciblorgasport.user.domain.UserAccount;

public interface ScheduleService {
	
	public List<ScheduleResponse> createSchedules(ScheduleCreateRequest request, UserAccount currentUser);
}
