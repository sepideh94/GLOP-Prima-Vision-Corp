package com.ciblorgasport.competition.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CompetitionCreateRequest {
 
 private String name;
 private String description;
 private LocalDateTime startDate;
 private LocalDateTime endDate;
 private Long parentEventId; 
 

}