package com.ciblorgasport.admin;

import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsResponse {
    private long totalLoginsWeek;    
    private long totalIncidentsWeek; 
    private long totalVolonteers;    
    private List<ChartPointResponse> loginHistory;
    private Map<String, Long> loginsByRole;       // Pie Chart : Répartition acteurs
    private Map<String, Long> topViewedSections;  // Bar Chart : Éco-conception (sections les plus lues)
    private Map<String, Double> averageSessionByRole;
    private double incidentResolutionRate; // % d'incidents traités
    private List<ChartPointResponse> hourlyTraffic;

}