package com.ciblorgasport.competition.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CompetitionCreateRequest {
 
 private String name;
 private String description;
 private LocalDate startDate;
 private LocalDate endDate;
 private Long parentEventId; 
 

}