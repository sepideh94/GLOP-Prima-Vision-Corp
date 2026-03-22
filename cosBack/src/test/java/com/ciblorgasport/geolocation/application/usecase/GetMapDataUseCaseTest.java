package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.geolocation.domain.AthleteLocation;
import com.ciblorgasport.geolocation.domain.FanZone;
import com.ciblorgasport.geolocation.domain.FanZoneType;
import com.ciblorgasport.geolocation.dto.MapDataResponse;
import com.ciblorgasport.geolocation.infrastructure.AthleteLocationRepository;
import com.ciblorgasport.geolocation.infrastructure.FanZoneRepository;
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GetMapDataUseCase — Tests unitaires")
class GetMapDataUseCaseTest {

    @Mock private SiteRepository            siteRepository;
    @Mock private TrialRepository           trialRepository;
    @Mock private FanZoneRepository         fanZoneRepository;
    @Mock private AthleteLocationRepository athleteLocationRepository;
    @InjectMocks private GetMapDataUseCase  useCase;

    @Nested
    @DisplayName("execute()")
    class Execute {

        @Test
        @DisplayName("Agrège sites, épreuves et fan zones pour la carte")
        void shouldAggregateAllMapData() {
            Site site = buildSite(1L, 48.85, 2.35);
            Trial trial = buildTrial(1L, site);
            FanZone fz = buildFanZone(1L, 48.86, 2.36);

            when(siteRepository.findAll()).thenReturn(List.of(site));
            when(trialRepository.findAll()).thenReturn(List.of(trial));
            when(fanZoneRepository.findAll()).thenReturn(List.of(fz));

            MapDataResponse response = useCase.execute(false);

            assertEquals(1, response.getSites().size());
            assertEquals(1, response.getEvents().size());
            assertEquals(1, response.getFanZones().size());
            assertNull(response.getAthleteLocations());
        }

        @Test
        @DisplayName("Inclut les positions des athlètes si includeAthletes=true")
        void shouldIncludeAthleteLocationsWhenRequested() {
            when(siteRepository.findAll()).thenReturn(List.of());
            when(trialRepository.findAll()).thenReturn(List.of());
            when(fanZoneRepository.findAll()).thenReturn(List.of());
            when(athleteLocationRepository.findAll()).thenReturn(List.of(
                    AthleteLocation.builder().id(1L).athleteId(10L).latitude(48.85).longitude(2.35)
                            .timestamp(LocalDateTime.now()).build()
            ));

            MapDataResponse response = useCase.execute(true);

            assertNotNull(response.getAthleteLocations());
            assertEquals(1, response.getAthleteLocations().size());
            assertEquals(10L, response.getAthleteLocations().get(0).getAthleteId());
        }

        @Test
        @DisplayName("Exclut les épreuves annulées des événements carte")
        void shouldExcludeCancelledTrials() {
            Site site = buildSite(1L, 48.85, 2.35);
            Trial cancelled = buildTrial(1L, site);
            cancelled.setCancelled(true);

            when(siteRepository.findAll()).thenReturn(List.of(site));
            when(trialRepository.findAll()).thenReturn(List.of(cancelled));
            when(fanZoneRepository.findAll()).thenReturn(List.of());

            MapDataResponse response = useCase.execute(false);
            assertTrue(response.getEvents().isEmpty());
        }

        @Test
        @DisplayName("Le marker de site a le type 'SITE'")
        void siteMarker_shouldHaveCorrectType() {
            Site site = buildSite(1L, 48.85, 2.35);
            when(siteRepository.findAll()).thenReturn(List.of(site));
            when(trialRepository.findAll()).thenReturn(List.of());
            when(fanZoneRepository.findAll()).thenReturn(List.of());

            MapDataResponse response = useCase.execute(false);
            assertEquals("SITE", response.getSites().get(0).getType());
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static Site buildSite(Long id, double lat, double lng) {
        Site s = new Site();
        s.setId(id);
        s.setAdress("Piscine " + id);
        s.setLatitude(lat);
        s.setLongitude(lng);
        return s;
    }

    private static Trial buildTrial(Long id, Site site) {
        Trial t = new Trial();
        t.setId(id);
        t.setName("Épreuve " + id);
        t.setSite(site);
        t.setCancelled(false);
        t.setStartDate(LocalDate.now().plusDays(1));
        t.setStartHour(LocalTime.of(10, 0));
        return t;
    }

    private static FanZone buildFanZone(Long id, double lat, double lng) {
        return FanZone.builder().id(id).name("FZ " + id).address("addr").latitude(lat).longitude(lng)
                .type(FanZoneType.BAR).build();
    }
}
