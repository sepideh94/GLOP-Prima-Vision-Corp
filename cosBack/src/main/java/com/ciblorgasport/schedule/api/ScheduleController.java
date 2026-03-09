package com.ciblorgasport.schedule.api;

import com.ciblorgasport.schedule.domain.VolunteerTask;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    /**
     * Expose la liste des tâches officielles définies par le backend pour le front-end.
     * Utile pour remplir la liste déroulante lors de la création.
     */
    @GetMapping("/volunteer-tasks")
    public ResponseEntity<VolunteerTask[]> getVolunteerTasks() {
        return ResponseEntity.ok(VolunteerTask.values());
    }
}