package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.geolocation.dto.TrialWithLocationDto;
import com.ciblorgasport.site.domain.Site;
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
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FindNearbyTrialsUseCase — Tests unitaires")
class FindNearbyTrialsUseCaseTest {

    @Mock private TrialRepository trialRepository;
    @InjectMocks private FindNearbyTrialsUseCase useCase;

    // Paris : 48.8566, 2.3522
    private static final double USER_LAT = 48.8566;
    private static final double USER_LNG = 2.3522;

    @Nested
    @DisplayName("execute()")
    class Execute {

        @Test
        @DisplayName("Retourne les épreuves dont le site est dans le rayon")
        void shouldReturnTrialsWithinRadius() {
            Trial nearby = buildTrial(1L, "100m nage libre", 48.860, 2.360, false); // ~500m
            Trial far    = buildTrial(2L, "200m dos",        45.764, 4.836, false); // Lyon
            when(trialRepository.findAllWithAssociations()).thenReturn(List.of(nearby, far));

            List<TrialWithLocationDto> results = useCase.execute(USER_LAT, USER_LNG, 5.0);

            assertEquals(1, results.size());
            assertEquals("100m nage libre", results.get(0).getTrialName());
        }

        @Test
        @DisplayName("Exclut les épreuves annulées même dans le rayon")
        void shouldExcludeCancelledTrials() {
            Trial cancelled = buildTrial(1L, "50m brasse", 48.860, 2.360, true);
            when(trialRepository.findAllWithAssociations()).thenReturn(List.of(cancelled));

            List<TrialWithLocationDto> results = useCase.execute(USER_LAT, USER_LNG, 5.0);

            assertTrue(results.isEmpty());
        }

        @Test
        @DisplayName("Exclut les épreuves sans site associé")
        void shouldExcludeTrialsWithoutSite() {
            Trial noSite = new Trial();
            noSite.setId(1L);
            noSite.setName("Sans site");
            when(trialRepository.findAllWithAssociations()).thenReturn(List.of(noSite));

            List<TrialWithLocationDto> results = useCase.execute(USER_LAT, USER_LNG, 10.0);

            assertTrue(results.isEmpty());
        }

        @Test
        @DisplayName("Résultats triés par distance croissante")
        void shouldSortByDistanceAscending() {
            Trial t1 = buildTrial(1L, "T1", 48.870, 2.360, false); // ~1.5km
            Trial t2 = buildTrial(2L, "T2", 48.858, 2.354, false); // ~200m
            when(trialRepository.findAllWithAssociations()).thenReturn(List.of(t1, t2));

            List<TrialWithLocationDto> results = useCase.execute(USER_LAT, USER_LNG, 10.0);

            assertEquals("T2", results.get(0).getTrialName());
            assertTrue(results.get(0).getDistanceKm() < results.get(1).getDistanceKm());
        }

        @Test
        @DisplayName("Liste vide si aucune épreuve dans le rayon")
        void shouldReturnEmptyWhenNoTrialsInRadius() {
            Trial far = buildTrial(1L, "Loin", 45.764, 4.836, false);
            when(trialRepository.findAllWithAssociations()).thenReturn(List.of(far));

            List<TrialWithLocationDto> results = useCase.execute(USER_LAT, USER_LNG, 5.0);

            assertTrue(results.isEmpty());
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static Trial buildTrial(Long id, String name, double lat, double lng, boolean cancelled) {
        Site site = new Site();
        site.setId(10L + id);
        site.setAdress("Adresse site " + id);
        site.setLatitude(lat);
        site.setLongitude(lng);

        Trial trial = new Trial();
        trial.setId(id);
        trial.setName(name);
        trial.setSite(site);
        trial.setCancelled(cancelled);
        trial.setStartDate(LocalDate.now().plusDays(1));
        trial.setStartHour(LocalTime.of(9, 0));
        return trial;
    }
}
