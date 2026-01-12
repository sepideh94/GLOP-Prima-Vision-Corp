package com.ciblorgasport.trial.round.dto;

import com.ciblorgasport.trial.round.domain.Round;
import com.ciblorgasport.trial.round.domain.RoundName;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoundResponse {
    private Long id;
    private RoundName name;
    private Integer orderNumber;
    private String displayName;

    public static RoundResponse fromEntity(Round round) {
        return RoundResponse.builder()
                .id(round.getId())
                .name(round.getName())
                .orderNumber(round.getOrderNumber())
                .displayName(round.getDisplayName())
                .build();
    }
}
