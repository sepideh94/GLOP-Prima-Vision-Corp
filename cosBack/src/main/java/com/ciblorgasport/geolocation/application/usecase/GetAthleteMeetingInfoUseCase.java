package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.geolocation.dto.AthleteMeetingInfoResponse;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetAthleteMeetingInfoUseCase {

    private final TrialParticipantRepository trialParticipantRepository;
    private final TrialRepository trialRepository;

    public List<AthleteMeetingInfoResponse> execute(Long athleteId) {
        return trialParticipantRepository.findByCompetitorId(athleteId).stream()
                .map(tp -> trialRepository.findById(tp.getTrial().getId()).orElse(null))
                .filter(trial -> trial != null)
                .filter(trial -> !trial.isCancelled())
                .filter(trial -> trial.getSite() != null)
                .filter(trial -> trial.getStartDate() != null && !trial.getStartDate().isBefore(LocalDate.now()))
                .sorted(Comparator.comparing(
                        t -> java.time.LocalDateTime.of(t.getStartDate(), t.getStartHour() != null ? t.getStartHour() : java.time.LocalTime.MIDNIGHT)
                ))
                .map(trial -> AthleteMeetingInfoResponse.builder()
                        .trialId(trial.getId())
                        .trialName(trial.getName())
                        .startDate(trial.getStartDate())
                        .startHour(trial.getStartHour())
                        .siteId(trial.getSite().getId())
                        .siteAddress(trial.getSite().getAdress())
                        .latitude(trial.getSite().getLatitude())
                        .longitude(trial.getSite().getLongitude())
                        .build())
                .collect(Collectors.toList());
    }
}
