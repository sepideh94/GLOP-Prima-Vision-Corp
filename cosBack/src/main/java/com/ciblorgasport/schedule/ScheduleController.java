package com.ciblorgasport.schedule;

import com.ciblorgasport.schedule.application.ScheduleService;
import com.ciblorgasport.schedule.domain.ScheduleItem;
import com.ciblorgasport.schedule.dto.ScheduleCreateRequest;
import com.ciblorgasport.user.domain.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping
    public ResponseEntity<ScheduleItem> create(
            @RequestBody ScheduleCreateRequest request,
            @AuthenticationPrincipal UserAccount currentUser) {
        
        if (!currentUser.isAdmin() && !currentUser.isCommissionner()) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(scheduleService.createSchedule(request, currentUser));
    }
}