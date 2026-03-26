package com.ciblorgasport.analytics.application;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import com.ciblorgasport.admin.dto.AdminStatsResponse;
import com.ciblorgasport.admin.dto.ChartPointResponse;

class PdfGeneratorServiceTest {

    private final PdfGeneratorService pdfGeneratorService = new PdfGeneratorService();

    @Test
    void shouldGeneratePdfWithoutCharts() {
        AdminStatsResponse stats = sampleStats();

        byte[] pdf = pdfGeneratorService.generatePdfReport(stats, List.of());

        assertThat(pdf).isNotEmpty();
        assertThat(new String(pdf, 0, Math.min(pdf.length, 5))).startsWith("%PDF-");
    }

    @Test
    void shouldGeneratePdfAndHandleInvalidChartGracefully() {
        AdminStatsResponse stats = sampleStats();
        byte[] badImage = new byte[] {0x01, 0x02, 0x03};

        byte[] pdf = pdfGeneratorService.generatePdfReport(stats, List.of(badImage));

        assertThat(pdf).isNotEmpty();
        assertThat(new String(pdf, 0, Math.min(pdf.length, 5))).startsWith("%PDF-");
    }

    private AdminStatsResponse sampleStats() {
        return AdminStatsResponse.builder()
                .totalLoginsWeek(120L)
                .totalIncidentsWeek(2L)
                .totalVolonteers(90L)
                .loginHistory(List.of(new ChartPointResponse("01/01", 10L)))
                .loginsByRole(Map.of("ATHLETE", 10L))
                .topViewedSections(Map.of("Statistiques", 5L))
                .averageSessionByRole(Map.of("ATHLETE", 12.5))
                .incidentResolutionRate(80.0)
                .hourlyTraffic(List.of(new ChartPointResponse("10h", 3L)))
                .build();
    }
}
