package com.ciblorgasport.schedule.application;

import java.util.List;

import com.ciblorgasport.schedule.dto.AthleteTrialScheduleResponse;
import com.ciblorgasport.schedule.dto.ScheduleCreateRequest;
import com.ciblorgasport.schedule.dto.ScheduleResponse;
import com.ciblorgasport.schedule.dto.VolunteerScheduleSummary;
import com.ciblorgasport.user.domain.UserAccount;

public interface ScheduleService {
	
	public List<ScheduleResponse> createSchedules(ScheduleCreateRequest request, UserAccount currentUser);
	public List<ScheduleResponse> getSchedulesForUser(UserAccount currentUser);
    public List<VolunteerScheduleSummary> getVolunteerSchedule(Long volunteerId) ;
    public List<AthleteTrialScheduleResponse> getAthleteScheduleByCompetition(Long athleteId, Long competitionId);
}
