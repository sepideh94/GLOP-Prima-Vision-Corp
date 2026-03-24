package com.ciblorgasport.admin.api;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.ciblorgasport.analytics.application.AnalyticsService;
import com.ciblorgasport.analytics.dto.SectionVisitCount;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminControllerStatsTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalyticsService analyticsService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void getMostConsultedSections_AsAdmin_ShouldReturnMetrics() throws Exception {
        SectionVisitCount mockMetric = new SectionVisitCount() {
            @Override
            public String getSection() { return "Calendrier"; }
            @Override
            public Long getVisitCount() { return 150L; }
        };

        when(analyticsService.getMostConsultedSections()).thenReturn(List.of(mockMetric));

        mockMvc.perform(get("/api/admin/stats/consultations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].section", is("Calendrier")))
                .andExpect(jsonPath("$[0].visitCount", is(150)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getMostConsultedSectionsByRole_AsAdmin_ShouldReturnMetrics() throws Exception {
        SectionVisitCount mockMetric = new SectionVisitCount() {
            @Override
            public String getSection() { return "Espace_Athlete"; }
            @Override
            public Long getVisitCount() { return 45L; }
        };

        when(analyticsService.getMostConsultedSectionsByRole("ATHLETE")).thenReturn(List.of(mockMetric));

        mockMvc.perform(get("/api/admin/stats/consultations-by-role").param("role", "ATHLETE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].section", is("Espace_Athlete")))
                .andExpect(jsonPath("$[0].visitCount", is(45)));
    }

    @Test
    @WithMockUser(roles = "ATHLETE")
    void getMostConsultedSections_AsAthlete_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/stats/consultations"))
                .andExpect(status().isForbidden());
    }
}
