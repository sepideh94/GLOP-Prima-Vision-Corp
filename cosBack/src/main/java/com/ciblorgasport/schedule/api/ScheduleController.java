package com.ciblorgasport.schedule.api;

import com.ciblorgasport.schedule.application.ScheduleService;
import com.ciblorgasport.schedule.domain.VolunteerTask;
import com.ciblorgasport.schedule.dto.ScheduleResponse;
import com.ciblorgasport.user.domain.UserAccount;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {
	
	private final ScheduleService scheduleService;

    
    @GetMapping("/mon-planning")
    public ResponseEntity<List<ScheduleResponse>> getMySchedule(@AuthenticationPrincipal UserAccount currentUser) {

    	List<ScheduleResponse> mySchedules = scheduleService.getSchedulesForUser(currentUser);
        return ResponseEntity.ok(mySchedules);
    }
    
}