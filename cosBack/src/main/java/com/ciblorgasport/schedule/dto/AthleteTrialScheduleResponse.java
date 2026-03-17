package com.ciblorgasport.schedule.dto;

import java.time.LocalDateTime;

public record AthleteTrialScheduleResponse(
    Long trialId,
    String trialName,          
    String phase,              
    LocalDateTime startTime,
    LocalDateTime endTime,
    String siteAddress,           
    String trialStatus         
) {}