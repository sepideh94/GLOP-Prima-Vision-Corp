package com.ciblorgasport.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsResponse {
    private long totalLoginsWeek;    
    private long totalIncidentsWeek; 
    private long totalVolonteers;    
}