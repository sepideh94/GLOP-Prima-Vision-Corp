package com.ciblorgasport.geolocation.api;

import com.ciblorgasport.config.SecurityDisabledConfig;
import com.ciblorgasport.geolocation.application.usecase.GetAthleteMeetingInfoUseCase;
import com.ciblorgasport.geolocation.application.usecase.UpdateAthleteLocationUseCase;
import com.ciblorgasport.geolocation.dto.AthleteMeetingInfoResponse;
import com.ciblorgasport.geolocation.dto.AthleteLocationResponse;
import com.ciblorgasport.geolocation.dto.AthleteLocationUpdateRequest;
import com.ciblorgasport.security.services.JwtService;
import com.ciblorgasport.user.application.UserAccountService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AthleteLocationController.class)
@Import(SecurityDisabledConfig.class)
@DisplayName("AthleteLocationController — Tests")
class AthleteLocationControllerTest {

    @Autowired MockMvc      mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean private UpdateAthleteLocationUseCase  updateAthleteLocationUseCase;
    @MockitoBean private GetAthleteMeetingInfoUseCase  getAthleteMeetingInfoUseCase;
    @MockitoBean private JwtService                    jwtService;
    @MockitoBean private UserAccountService            userAccountService;

    @Nested
    @DisplayName("PUT /api/athletes/{athleteId}/location")
    class UpdateLocation {

        @Test
        @DisplayName("200 — met à jour la position de l'athlète")
        void shouldUpdateAthleteLocation() throws Exception {
            AthleteLocationUpdateRequest req = buildUpdateRequest(48.85, 2.35);
            AthleteLocationResponse resp = buildLocationResponse(1L, 48.85, 2.35);
            given(updateAthleteLocationUseCase.execute(eq(1L), any())).willReturn(resp);

            mockMvc.perform(put("/api/athletes/{id}/location", 1L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.athleteId").value(1))
                    .andExpect(jsonPath("$.latitude").value(48.85))
                    .andExpect(jsonPath("$.longitude").value(2.35));
        }
    }

    @Nested
    @DisplayName("GET /api/athletes/{athleteId}/meeting-info")
    class GetMeetingInfo {

        @Test
        @DisplayName("200 — retourne les informations de rendez-vous de l'athlète")
        void shouldReturnMeetingInfo() throws Exception {
            List<AthleteMeetingInfoResponse> info = List.of(buildMeetingInfo(1L));
            given(getAthleteMeetingInfoUseCase.execute(1L)).willReturn(info);

            mockMvc.perform(get("/api/athletes/{id}/meeting-info", 1L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].trialName").value("100m nage libre"))
                    .andExpect(jsonPath("$[0].siteAddress").value("Piscine Olympique"))
                    .andExpect(jsonPath("$[0].latitude").value(48.85));
        }

        @Test
        @DisplayName("200 — liste vide si l'athlète n'a pas d'épreuves à venir")
        void shouldReturnEmptyListWhenNoUpcomingTrials() throws Exception {
            given(getAthleteMeetingInfoUseCase.execute(2L)).willReturn(List.of());

            mockMvc.perform(get("/api/athletes/{id}/meeting-info", 2L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static AthleteLocationUpdateRequest buildUpdateRequest(double lat, double lng) {
        AthleteLocationUpdateRequest r = new AthleteLocationUpdateRequest();
        r.setLatitude(lat);
        r.setLongitude(lng);
        return r;
    }

    private static AthleteLocationResponse buildLocationResponse(Long athleteId, double lat, double lng) {
        return AthleteLocationResponse.builder()
                .id(1L).athleteId(athleteId).latitude(lat).longitude(lng)
                .timestamp(LocalDateTime.now()).build();
    }

    private static AthleteMeetingInfoResponse buildMeetingInfo(Long trialId) {
        return AthleteMeetingInfoResponse.builder()
                .trialId(trialId)
                .trialName("100m nage libre")
                .startDate(LocalDate.now().plusDays(1))
                .startHour(LocalTime.of(10, 0))
                .siteId(1L)
                .siteAddress("Piscine Olympique")
                .latitude(48.85)
                .longitude(2.35)
                .build();
    }
}
