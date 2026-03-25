package com.ciblorgasport.analytics.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.analytics.domain.SystemLog;
import com.ciblorgasport.analytics.dto.SectionVisitCount;
import com.ciblorgasport.analytics.dto.SectionVisitCountView;
import com.ciblorgasport.analytics.infrastructure.PageVisitRepository;
import com.ciblorgasport.analytics.infrastructure.SystemLogRepository;
import com.ciblorgasport.incident.infrastructure.IncidentRepository;
import com.ciblorgasport.volonteer.infrastructure.VolonteerRepository;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private SystemLogRepository logRepository;
    @Mock
    private IncidentRepository incidentRepository;
    @Mock
    private VolonteerRepository volonteerRepository;
    @Mock
    private PageVisitRepository pageVisitRepository;
    @InjectMocks
    private AnalyticsService analyticsService;

    @Test
    void shouldPersistSystemLogWithProvidedValues() {
        analyticsService.logAction("admin@corp.test", "LOGIN", "ok");

        ArgumentCaptor<SystemLog> captor = ArgumentCaptor.forClass(SystemLog.class);
        verify(logRepository).save(captor.capture());
        assertThat(captor.getValue().getUsername()).isEqualTo("admin@corp.test");
        assertThat(captor.getValue().getActionType()).isEqualTo("LOGIN");
        assertThat(captor.getValue().getDetails()).isEqualTo("ok");
        assertThat(captor.getValue().getTimestamp()).isNotNull();
    }

    @Test
    void shouldNormalizeAndMergeSections() {
        List<SectionVisitCount> raw = List.of(
                new SectionVisitCountView("espace_volonteer", 2L),
                new SectionVisitCountView("Espace Volontaire", 3L),
                new SectionVisitCountView("   ", 1L),
                new SectionVisitCountView("gestion-epreuves", null)
        );
        when(pageVisitRepository.findMostConsultedSections()).thenReturn(raw);

        List<SectionVisitCount> result = analyticsService.getMostConsultedSections();

        assertThat(result).extracting(SectionVisitCount::getSection)
                .containsExactly("Espace Volontaire", "Section Inconnue", "Gestion Epreuves");
        assertThat(result).extracting(SectionVisitCount::getVisitCount)
                .containsExactly(5L, 1L, 0L);
    }

    @Test
    void shouldGenerateWeeklySummaryWithCriticalRecommendation() {
        when(logRepository.countByActionTypeAndTimestampAfter(eq("LOGIN"), any())).thenReturn(5L);
        when(logRepository.countByActionTypeAndTimestampAfter(eq("INCIDENT_CREATED"), any())).thenReturn(12L);
        when(volonteerRepository.count()).thenReturn(30L);

        String summary = analyticsService.generateWeeklyReportSummary();

        assertThat(summary).contains("fréquentation est faible");
        assertThat(summary).contains("CRITIQUE");
        assertThat(summary).contains("Action prioritaire requise");
    }

    @Test
    void shouldBuildDashboardStatsFromRepositories() {
        when(logRepository.countByActionTypeAndTimestampAfter(eq("LOGIN"), any())).thenReturn(20L);
        when(logRepository.countByActionTypeAndTimestampAfter(eq("INCIDENT_CREATED"), any())).thenReturn(3L);
        when(volonteerRepository.count()).thenReturn(70L);
        when(incidentRepository.count()).thenReturn(9L);

        when(logRepository.countActionsInRange(eq("LOGIN"), any(), any())).thenReturn(1L);
        when(logRepository.countLoginsByRole(any())).thenReturn(List.<Object[]>of(new Object[] {"ATHLETE", 12L}));
        when(logRepository.findMostViewedData(any())).thenReturn(List.<Object[]>of(new Object[] {"stats", 4L}));

        LocalDateTime start = LocalDateTime.now().minusHours(3);
        LocalDateTime end = LocalDateTime.now().minusHours(1);
        when(logRepository.findUserSessionsWithRole(any()))
                .thenReturn(List.<Object[]>of(new Object[] {"ATHLETE", "a@test.com", Timestamp.valueOf(start), Timestamp.valueOf(end)}));
        when(logRepository.findHourlyTraffic()).thenReturn(List.<Object[]>of(new Object[] {8, 15L}));

        var stats = analyticsService.getDashboardStats(7);

        assertThat(stats.getTotalLoginsWeek()).isEqualTo(20L);
        assertThat(stats.getTotalIncidentsWeek()).isEqualTo(3L);
        assertThat(stats.getTotalVolonteers()).isEqualTo(70L);
        assertThat(stats.getLoginsByRole()).isEqualTo(Map.of("ATHLETE", 12L));
        assertThat(stats.getTopViewedSections()).isEqualTo(Map.of("stats", 4L));
        assertThat(stats.getAverageSessionByRole()).containsKey("ATHLETE");
        assertThat(stats.getHourlyTraffic()).hasSize(1);
        assertThat(stats.getLoginHistory()).hasSize(7);
    }
}
