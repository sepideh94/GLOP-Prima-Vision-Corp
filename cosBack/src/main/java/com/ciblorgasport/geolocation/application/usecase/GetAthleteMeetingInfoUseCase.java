package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.geolocation.dto.AthleteMeetingInfoResponse;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class GetAthleteMeetingInfoUseCase {

    private final TrialParticipantRepository trialParticipantRepository;
    private final TrialRepository trialRepository;

    public List<AthleteMeetingInfoResponse> execute(Long athleteId, Long competitionId) {
        return trialParticipantRepository.findByCompetitorId(athleteId).stream()
                .map(tp -> trialRepository.findById(tp.getTrial().getId()).orElse(null))
                .filter(Objects::nonNull)
                .filter(trial -> !trial.isCancelled())
                .filter(trial -> trial.getSite() != null)
                .filter(trial -> trial.getStartDate() != null && !trial.getStartDate().isBefore(LocalDate.now()))
                .filter(trial -> competitionId == null || trial.getCompetition().getId().equals(competitionId))
                .sorted(Comparator.comparing(
                        t -> java.time.LocalDateTime.of(t.getStartDate(), t.getStartHour() != null ? t.getStartHour() : java.time.LocalTime.MIDNIGHT)
                ))
                .map(trial -> AthleteMeetingInfoResponse.builder()
                        .trialId(trial.getId())
                        .trialName(trial.getName())
                        .startDate(trial.getStartDate())
                        .startHour(trial.getStartHour())
                        .competitionId(trial.getCompetition().getId())
                        .siteId(trial.getSite().getId())
                        .siteAddress(trial.getSite().getAdress())
                        .latitude(trial.getSite().getLatitude())
                        .longitude(trial.getSite().getLongitude())
                        .build())
                .toList();
    }
}
