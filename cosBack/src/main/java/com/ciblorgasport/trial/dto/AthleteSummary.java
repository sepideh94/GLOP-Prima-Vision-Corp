package com.ciblorgasport.trial.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AthleteSummary {
    private Long id;
    private String firstName;
    private String lastName;
}