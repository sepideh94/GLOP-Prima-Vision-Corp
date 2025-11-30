package com.ciblorgasport.competitions.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CompetitionUpdateRequest {
    
    private String name;
    private String description;
    private LocalDate startDate;
    

}