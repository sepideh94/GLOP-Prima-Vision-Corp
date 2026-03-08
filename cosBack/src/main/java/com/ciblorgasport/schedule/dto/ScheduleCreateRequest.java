package com.ciblorgasport.schedule.dto;

import lombok.Data;
import java.time.LocalDateTime;

import com.ciblorgasport.schedule.domain.ScheduleType;
import com.ciblorgasport.site.dto.SiteResponse;

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