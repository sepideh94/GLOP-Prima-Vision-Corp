package com.ciblorgasport.geolocation.api;

import com.ciblorgasport.config.SecurityDisabledConfig;
import com.ciblorgasport.geolocation.application.usecase.*;
import com.ciblorgasport.geolocation.domain.FanZoneType;
import com.ciblorgasport.geolocation.dto.*;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FanZoneController.class)
@org.springframework.test.context.ActiveProfiles("test")
@Import(SecurityDisabledConfig.class)
@DisplayName("FanZoneController — Tests")
class FanZoneControllerTest {

    @Autowired MockMvc       mockMvc;
    @Autowired ObjectMapper  objectMapper;

    @MockitoBean private CreateFanZoneUseCase                  createFanZoneUseCase;
    @MockitoBean private CreateFanZoneFromGooglePlaceUseCase   createFromGooglePlaceUseCase;
    @MockitoBean private FindNearbyFanZonesUseCase             findNearbyFanZonesUseCase;
    @MockitoBean private FindNearbyTrialsUseCase               findNearbyTrialsUseCase;
    @MockitoBean private GetDirectionsUseCase                  getDirectionsUseCase;
    @MockitoBean private JwtService                            jwtService;
    @MockitoBean private UserAccountService                    userAccountService;

    @Nested
    @DisplayName("POST /api/admin/fan-zones")
    class CreateFanZone {

        @Test
        @DisplayName("200 — crée une fan zone et retourne la réponse")
        void shouldCreateFanZone() throws Exception {
            FanZoneCreateRequest req = buildCreateRequest();
            FanZoneResponse resp = buildFanZoneResponse(1L, "Bar Olympique");
            given(createFanZoneUseCase.execute(any())).willReturn(resp);

            mockMvc.perform(post("/api/admin/fan-zones")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.name").value("Bar Olympique"))
                    .andExpect(jsonPath("$.type").value("BAR"));
        }
    }

    @Nested
    @DisplayName("POST /api/admin/fan-zones/import")
    class ImportFromGoogleMaps {

        @Test
        @DisplayName("200 — importe une fan zone depuis un Place ID Google")
        void shouldImportFromGoogleMaps() throws Exception {
            GooglePlaceImportRequest req = buildImportRequest("ChIJplace123");
            FanZoneResponse resp = buildFanZoneResponse(2L, "Café des Sports");
            given(createFromGooglePlaceUseCase.execute(any())).willReturn(resp);

            mockMvc.perform(post("/api/admin/fan-zones/import")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(2))
                    .andExpect(jsonPath("$.name").value("Café des Sports"));
        }
    }

    @Nested
    @DisplayName("GET /api/fan-zones/nearby")
    class NearbyFanZones {

        @Test
        @DisplayName("200 — retourne les fan zones proches avec suggestions Google")
        void shouldReturnNearbyFanZones() throws Exception {
            NearbyFanZonesResponse resp = NearbyFanZonesResponse.builder()
                    .savedFanZones(List.of(buildFanZoneResponse(1L, "Bar proche")))
                    .googleSuggestions(List.of())
                    .build();
            given(findNearbyFanZonesUseCase.execute(48.85, 2.35, 5.0)).willReturn(resp);

            mockMvc.perform(get("/api/fan-zones/nearby")
                            .param("latitude", "48.85")
                            .param("longitude", "2.35")
                            .param("radiusKm", "5.0"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.savedFanZones.length()").value(1))
                    .andExpect(jsonPath("$.savedFanZones[0].name").value("Bar proche"));
        }
    }

    @Nested
    @DisplayName("GET /api/trials/nearby")
    class NearbyTrials {

        @Test
        @DisplayName("200 — retourne les épreuves proches triées par distance")
        void shouldReturnNearbyTrials() throws Exception {
            List<TrialWithLocationDto> trials = List.of(
                    TrialWithLocationDto.builder().trialId(1L).trialName("100m nage libre")
                            .latitude(48.86).longitude(2.36).distanceKm(1.2).build()
            );
            given(findNearbyTrialsUseCase.execute(48.85, 2.35, 10.0)).willReturn(trials);

            mockMvc.perform(get("/api/trials/nearby")
                            .param("latitude", "48.85")
                            .param("longitude", "2.35")
                            .param("radiusKm", "10.0"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].trialName").value("100m nage libre"))
                    .andExpect(jsonPath("$[0].distanceKm").value(1.2));
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static FanZoneCreateRequest buildCreateRequest() {
        FanZoneCreateRequest r = new FanZoneCreateRequest();
        r.setName("Bar Olympique");
        r.setAddress("1 avenue des Jeux");
        r.setLatitude(48.85);
        r.setLongitude(2.35);
        r.setType(FanZoneType.BAR);
        return r;
    }

    private static GooglePlaceImportRequest buildImportRequest(String placeId) {
        GooglePlaceImportRequest r = new GooglePlaceImportRequest();
        r.setPlaceId(placeId);
        return r;
    }

    private static FanZoneResponse buildFanZoneResponse(Long id, String name) {
        return FanZoneResponse.builder().id(id).name(name).address("1 rue du Sport")
                .latitude(48.85).longitude(2.35).type(FanZoneType.BAR).build();
    }
}
