package com.ciblorgasport.geolocation.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.geolocation.dto.AthleteMeetingInfoResponse;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;
import com.ciblorgasport.trial.infrastructure.TrialRepository;

@ExtendWith(MockitoExtension.class)
class GetAthleteMeetingInfoUseCaseTest {

    @Mock
    private TrialParticipantRepository trialParticipantRepository;
    @Mock
    private TrialRepository trialRepository;
    @InjectMocks
    private GetAthleteMeetingInfoUseCase useCase;

    @Test
    void shouldFilterAndSortUpcomingTrialsWithSites() {
        TrialParticipant tp1 = mock(TrialParticipant.class);
        TrialParticipant tp2 = mock(TrialParticipant.class);
        when(tp1.getTrial()).thenReturn(mock(Trial.class));
        when(tp2.getTrial()).thenReturn(mock(Trial.class));
        when(tp1.getTrial().getId()).thenReturn(100L);
        when(tp2.getTrial().getId()).thenReturn(200L);

        Trial kept = mock(Trial.class, org.mockito.Answers.RETURNS_DEEP_STUBS);
        when(kept.getId()).thenReturn(100L);
        when(kept.getName()).thenReturn("Series A");
        when(kept.isCancelled()).thenReturn(false);
        when(kept.getStartDate()).thenReturn(LocalDate.now().plusDays(2));
        when(kept.getStartHour()).thenReturn(LocalTime.of(10, 0));
        when(kept.getCompetition().getId()).thenReturn(10L);
        when(kept.getSite().getId()).thenReturn(901L);
        when(kept.getSite().getAdress()).thenReturn("Paris");
        when(kept.getSite().getLatitude()).thenReturn(48.8);
        when(kept.getSite().getLongitude()).thenReturn(2.3);

        Trial filteredPast = mock(Trial.class, org.mockito.Answers.RETURNS_DEEP_STUBS);
        when(filteredPast.isCancelled()).thenReturn(false);
        when(filteredPast.getSite()).thenReturn(mock(com.ciblorgasport.site.domain.Site.class));
        when(filteredPast.getStartDate()).thenReturn(LocalDate.now().minusDays(1));

        when(trialParticipantRepository.findByCompetitorId(44L)).thenReturn(List.of(tp1, tp2));
        when(trialRepository.findById(100L)).thenReturn(Optional.of(kept));
        when(trialRepository.findById(200L)).thenReturn(Optional.of(filteredPast));

        List<AthleteMeetingInfoResponse> result = useCase.execute(44L, null);

        assertThat(result).hasSize(1);
        AthleteMeetingInfoResponse meeting = result.get(0);
        assertThat(meeting.getTrialId()).isEqualTo(100L);
        assertThat(meeting.getCompetitionId()).isEqualTo(10L);
        assertThat(meeting.getSiteAddress()).isEqualTo("Paris");
    }

    @Test
    void shouldKeepOnlyRequestedCompetition() {
        TrialParticipant tp1 = mock(TrialParticipant.class);
        TrialParticipant tp2 = mock(TrialParticipant.class);
        when(tp1.getTrial()).thenReturn(mock(Trial.class));
        when(tp2.getTrial()).thenReturn(mock(Trial.class));
        when(tp1.getTrial().getId()).thenReturn(1L);
        when(tp2.getTrial().getId()).thenReturn(2L);

        Trial c10 = mock(Trial.class, org.mockito.Answers.RETURNS_DEEP_STUBS);
        when(c10.isCancelled()).thenReturn(false);
        when(c10.getStartDate()).thenReturn(LocalDate.now().plusDays(1));
        when(c10.getCompetition().getId()).thenReturn(10L);
        when(c10.getSite()).thenReturn(mock(com.ciblorgasport.site.domain.Site.class));

        Trial c11 = mock(Trial.class, org.mockito.Answers.RETURNS_DEEP_STUBS);
        when(c11.getId()).thenReturn(2L);
        when(c11.isCancelled()).thenReturn(false);
        when(c11.getStartDate()).thenReturn(LocalDate.now().plusDays(1));
        when(c11.getCompetition().getId()).thenReturn(11L);
        when(c11.getSite()).thenReturn(mock(com.ciblorgasport.site.domain.Site.class));

        when(trialParticipantRepository.findByCompetitorId(7L)).thenReturn(List.of(tp1, tp2));
        when(trialRepository.findById(1L)).thenReturn(Optional.of(c10));
        when(trialRepository.findById(2L)).thenReturn(Optional.of(c11));

        List<AthleteMeetingInfoResponse> result = useCase.execute(7L, 11L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCompetitionId()).isEqualTo(11L);
    }
}
