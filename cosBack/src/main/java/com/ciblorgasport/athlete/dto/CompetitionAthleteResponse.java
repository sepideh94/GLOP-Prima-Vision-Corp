package com.ciblorgasport.athlete.dto;

import com.ciblorgasport.competition.domain.ParticipationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompetitionAthleteResponse {
    private AthleteResponse athlete;
    private ParticipationStatus status;
}
