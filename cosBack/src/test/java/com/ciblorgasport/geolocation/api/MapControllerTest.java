package com.ciblorgasport.geolocation.api;

import com.ciblorgasport.config.SecurityDisabledConfig;
import com.ciblorgasport.geolocation.application.usecase.GetMapDataUseCase;
import com.ciblorgasport.geolocation.dto.*;
import com.ciblorgasport.security.services.JwtService;
import com.ciblorgasport.user.application.UserAccountService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MapController.class)
@org.springframework.test.context.ActiveProfiles("test")
@Import(SecurityDisabledConfig.class)
@DisplayName("MapController — GET /map/data")
class MapControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean private GetMapDataUseCase  getMapDataUseCase;
    @MockitoBean private JwtService         jwtService;
    @MockitoBean private UserAccountService userAccountService;

    @Nested
    @DisplayName("GET /map/data")
    class GetMapData {

        @Test
        @DisplayName("200 — retourne les données carte avec sites, fan zones et événements")
        void shouldReturn200WithMapData() throws Exception {
            MapDataResponse data = buildMapData();
            given(getMapDataUseCase.execute(false)).willReturn(data);

            mockMvc.perform(get("/map/data"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.sites.length()").value(1))
                    .andExpect(jsonPath("$.sites[0].type").value("SITE"))
                    .andExpect(jsonPath("$.fanZones.length()").value(1))
                    .andExpect(jsonPath("$.fanZones[0].type").value("FAN_ZONE"))
                    .andExpect(jsonPath("$.events.length()").value(1));

            verify(getMapDataUseCase).execute(false);
        }

        @Test
        @DisplayName("200 — liste vide si aucune donnée")
        void shouldReturn200WithEmptyData() throws Exception {
            given(getMapDataUseCase.execute(false)).willReturn(
                    MapDataResponse.builder().sites(List.of()).fanZones(List.of()).events(List.of()).build()
            );

            mockMvc.perform(get("/map/data"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.sites.length()").value(0))
                    .andExpect(jsonPath("$.events.length()").value(0));
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static MapDataResponse buildMapData() {
        return MapDataResponse.builder()
                .sites(List.of(MarkerDto.builder().id(1L).type("SITE").name("Piscine").latitude(48.85).longitude(2.35).build()))
                .fanZones(List.of(MarkerDto.builder().id(1L).type("FAN_ZONE").name("Bar Olympique").latitude(48.86).longitude(2.36).metadata("BAR").build()))
                .events(List.of(TrialEventDto.builder().trialId(1L).trialName("100m nage libre").siteId(1L).latitude(48.85).longitude(2.35).build()))
                .build();
    }
}
