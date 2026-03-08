package com.ciblorgasport.schedule.dto;

import java.time.LocalDateTime;

import com.ciblorgasport.schedule.domain.ScheduleType;
import com.ciblorgasport.site.dto.SiteResponse;
import com.ciblorgasport.common.model.Status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {
	private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ScheduleType type;
    private Status status;
    private SiteResponse site;
    private Long competitionId;
    private String competitionName;
}
