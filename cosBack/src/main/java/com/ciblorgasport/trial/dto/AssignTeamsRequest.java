package com.ciblorgasport.trial.dto;

import java.util.List;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignTeamsRequest {
    
    @NotEmpty(message = "La liste des équipes ne peut pas être vide")
    private List<Long> teamIds;
}