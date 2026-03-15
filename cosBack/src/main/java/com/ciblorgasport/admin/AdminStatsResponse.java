package com.ciblorgasport.admin;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsResponse {
    private long totalLoginsWeek;    
    private long totalIncidentsWeek; 
    private long totalVolonteers;    
    private List<ChartPointResponse> loginHistory;
}