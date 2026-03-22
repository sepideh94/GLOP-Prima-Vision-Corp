package com.ciblorgasport.schedule.api;

import com.ciblorgasport.schedule.application.ScheduleService;
import com.ciblorgasport.schedule.domain.VolunteerTask;
import com.ciblorgasport.schedule.dto.AthleteTrialScheduleResponse;
import com.ciblorgasport.schedule.dto.ScheduleResponse;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.competition.application.ParticipationService;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final ParticipationService participationService;

    @GetMapping("volunteer/mon-planning")
    public ResponseEntity<List<ScheduleResponse>> getMySchedule(@AuthenticationPrincipal UserAccount currentUser) {

        List<ScheduleResponse> mySchedules = scheduleService.getSchedulesForUser(currentUser);
        return ResponseEntity.ok(mySchedules);
    }

    @GetMapping("/athlete/competition/{competitionId}")
    public ResponseEntity<?> getAthleteSchedule(@PathVariable Long competitionId,
            @AuthenticationPrincipal UserAccount currentUser) {

        if (!participationService.isConfirmed(currentUser.getId(), competitionId)) {
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(Map.of("message",
                            "Votre participation est en attente de validation par le commissaire. Vous ne pouvez pas encore consulter votre planning."));
        }

        return ResponseEntity.ok(scheduleService.getAthleteScheduleByCompetition(
                currentUser.getId(),
                competitionId));
    }
}