package com.ciblorgasport.team.dto;

import java.util.List;
import com.ciblorgasport.trial.dto.AthleteSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamResponse {
    private Long id;
    private String name;
    private List<AthleteSummary> members;
}