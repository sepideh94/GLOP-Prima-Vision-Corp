package com.ciblorgasport.spectator.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class CompetitionFollowResponse {
    Long competitionId;
    String competitionName;
    Long eventId;
    String eventName;
    LocalDateTime followedAt;
}
