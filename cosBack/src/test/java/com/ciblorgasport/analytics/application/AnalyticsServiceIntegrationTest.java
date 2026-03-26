package com.ciblorgasport.analytics.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import com.ciblorgasport.analytics.dto.SectionVisitCount;
import com.ciblorgasport.analytics.dto.SectionVisitCountView;
import com.ciblorgasport.analytics.infrastructure.PageVisitRepository;
import com.ciblorgasport.analytics.infrastructure.SystemLogRepository;
import com.ciblorgasport.incident.infrastructure.IncidentRepository;
import com.ciblorgasport.volonteer.infrastructure.VolonteerRepository;

@SpringBootTest
@ActiveProfiles("test")
class AnalyticsServiceIntegrationTest {

    @Autowired
    private AnalyticsService analyticsService;

    @MockBean
    private SystemLogRepository logRepository;
    @MockBean
    private IncidentRepository incidentRepository;
    @MockBean
    private VolonteerRepository volonteerRepository;
    @MockBean
    private PageVisitRepository pageVisitRepository;

    @Test
    void shouldExposeNormalizedSectionsThroughSpringBean() {
        List<SectionVisitCount> rows = List.of(
                new SectionVisitCountView("espace_commissionner", 4L),
                new SectionVisitCountView("espace commissaire", 1L)
        );
        when(pageVisitRepository.findMostConsultedSectionsByRole("ADMIN")).thenReturn(rows);

        List<SectionVisitCount> result = analyticsService.getMostConsultedSectionsByRole("ADMIN");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSection()).isEqualTo("Espace Commissaire");
        assertThat(result.get(0).getVisitCount()).isEqualTo(5L);
    }

    @Test
    void shouldUseMockedRepositoriesInSummaryFlow() {
        when(logRepository.countByActionTypeAndTimestampAfter(eq("LOGIN"), any())).thenReturn(50L);
        when(logRepository.countByActionTypeAndTimestampAfter(eq("INCIDENT_CREATED"), any())).thenReturn(0L);
        when(volonteerRepository.count()).thenReturn(75L);

        String summary = analyticsService.generateWeeklyReportSummary();

        assertThat(summary).contains("fréquentation est satisfaisante");
        assertThat(summary).contains("Aucun incident");
    }
}
