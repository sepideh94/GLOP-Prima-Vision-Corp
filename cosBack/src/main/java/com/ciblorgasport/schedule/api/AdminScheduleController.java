package com.ciblorgasport.schedule.api;

import com.ciblorgasport.schedule.application.ScheduleService;
import com.ciblorgasport.schedule.domain.ScheduleType;
import com.ciblorgasport.schedule.domain.VolunteerTask;
import com.ciblorgasport.schedule.dto.ScheduleCreateRequest;
import com.ciblorgasport.schedule.dto.ScheduleResponse;
import com.ciblorgasport.schedule.dto.VolunteerScheduleSummary;
import com.ciblorgasport.user.domain.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/schedules")
@RequiredArgsConstructor
public class AdminScheduleController {

    private final ScheduleService scheduleService;

    /**
     * Endpoint pour la création de plannings par l'Admin.
     * Permet la création groupée pour les volontaires ou individuelle.
     */
    @PostMapping("/create-schedule")
    public ResponseEntity<List<ScheduleResponse>> createSchedules( @RequestBody ScheduleCreateRequest request,@AuthenticationPrincipal UserAccount currentUser) {
    	request.setType(ScheduleType.VOLONTEER); 
        
        List<ScheduleResponse> responses = scheduleService.createSchedules(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }
    
    /**
     * Expose la liste des tâches officielles définies par le backend pour le front-end.
     * Utile pour remplir la liste déroulante lors de la création.
     */
    @GetMapping("/volunteer-tasks")
    public ResponseEntity<VolunteerTask[]> getVolunteerTasks() {
        return ResponseEntity.ok(VolunteerTask.values());
    }
    

    @GetMapping("/volunteer/{volunteerId}")
    public ResponseEntity<List<VolunteerScheduleSummary>> getVolunteerSchedule(
            @PathVariable Long volunteerId) {
        
        List<VolunteerScheduleSummary> schedule = scheduleService.getVolunteerSchedule(volunteerId);
        
        return ResponseEntity.ok(schedule);
    }
}