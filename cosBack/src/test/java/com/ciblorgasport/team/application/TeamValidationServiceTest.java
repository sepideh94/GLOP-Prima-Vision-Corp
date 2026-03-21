package com.ciblorgasport.team.application;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.team.domain.Team;
import com.ciblorgasport.team.infrastructure.TeamRepository;

@ExtendWith(MockitoExtension.class)
class TeamValidationServiceTest {

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private ParticipationRepository participationRepository;

    @InjectMocks
    private TeamValidationService teamValidationService;

    private Athlete athlete1;
    private Athlete athlete2;
    private Team team;
    private Participation teamParticipation;

    @BeforeEach
    void setUp() {
        athlete1 = mock(Athlete.class);
        athlete2 = mock(Athlete.class);

        when(athlete1.getId()).thenReturn(10L);
        when(athlete2.getId()).thenReturn(11L);

        team = Team.builder()
                .id(5L)
                .name("Team Alpha")
                .members(List.of(athlete1, athlete2))
                .build();

        teamParticipation = Participation.builder()
                .competitorId(5L)
                .competitorType(CompetitorType.TEAM)
                .status(ParticipationStatus.INVITED)
                .charterAccepted(false)
                .build();
    }

    @Test
    @DisplayName("validateTeamStatus should confirm team when all members are confirmed")
    void shouldConfirmTeamWhenAllMembersAreConfirmed() {
        Long athleteId = 10L;
        Long competitionId = 100L;

        when(teamRepository.findAllByMemberId(athleteId)).thenReturn(List.of(team));
        when(participationRepository.findByCompetition_IdAndCompetitorIdAndCompetitorType(
                competitionId, 5L, CompetitorType.TEAM))
                .thenReturn(Optional.of(teamParticipation));

        when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                competitionId, 10L, CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED))
                .thenReturn(true);

        when(participationRepository.existsByCompetition_IdAndCompetitorIdAndCompetitorTypeAndStatus(
                competitionId, 11L, CompetitorType.ATHLETE, ParticipationStatus.CONFIRMED))
                .thenReturn(true);

        teamValidationService.validateTeamStatus(athleteId, competitionId);

        verify(participationRepository).save(teamParticipation);
    }
    
}