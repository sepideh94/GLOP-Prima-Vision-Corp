package com.ciblorgasport.schedule.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

import com.ciblorgasport.schedule.domain.ScheduleType;
import com.ciblorgasport.schedule.domain.VolunteerTask;
import com.ciblorgasport.site.dto.SiteResponse;

@Data
public class ScheduleCreateRequest {
    private VolunteerTask task;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ScheduleType type;
    private Long siteId;
    private Long competitionId;
    private List<Long> assignedUserIds;
}