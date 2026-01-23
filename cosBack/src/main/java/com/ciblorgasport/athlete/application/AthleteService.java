package com.ciblorgasport.athlete.application;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ciblorgasport.athlete.dto.AthleteResponse;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AthleteService {

    private final AthleteRepository athleteRepository;
    private final ParticipationRepository participationRepository;

    public List<AthleteResponse> getAllAthletes() {
        return athleteRepository.findAllByOrderByLastNameAsc().stream()
                .map(AthleteResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<AthleteResponse> getAthletesByCompetition(Long competitionId) {
        List<Long> athleteIds = participationRepository.findByCompetitionId(competitionId).stream()
                .filter(p -> p.getCompetitorType() == CompetitorType.ATHLETE)
                .map(p -> p.getCompetitorId())
                .distinct()
                .toList();

        return athleteRepository.findAllById(athleteIds).stream()
                .map(AthleteResponse::fromEntity)
                .sorted((a, b) -> a.getLastName().compareToIgnoreCase(b.getLastName()))
                .collect(Collectors.toList());
    }
}
