package com.ciblorgasport.schedule.domain;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ScheduleCreateRequest {
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ScheduleType type;
    private Long siteId;
    private Long competitionId;
    private Long assignedUserId;
}