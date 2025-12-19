package com.ciblorgasport.event.api.dto;

import java.time.LocalDateTime;

import com.ciblorgasport.event.domain.Event;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EventListResponse {
  private Long id;
  private String name;
  private String description;
  private LocalDateTime startDate;
  private LocalDateTime endDate;

  public static EventListResponse fromEntity(Event e) {
    return EventListResponse.builder()
        .id(e.getId())
        .name(e.getName())
        .description(e.getDescription())
        .startDate(e.getStartDate())
        .endDate(e.getEndDate())
        .build();
  }
}
