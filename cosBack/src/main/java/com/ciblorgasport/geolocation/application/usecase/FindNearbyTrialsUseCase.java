package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.geolocation.domain.GeoPoint;
import com.ciblorgasport.geolocation.dto.TrialWithLocationDto;
import com.ciblorgasport.trial.infrastructure.TrialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FindNearbyTrialsUseCase {

    private final TrialRepository trialRepository;

    @Transactional(readOnly = true)
    public List<TrialWithLocationDto> execute(double latitude, double longitude, double radiusKm) {
        GeoPoint userPoint = new GeoPoint(latitude, longitude);

        return trialRepository.findAllWithAssociations().stream()
                .filter(trial -> !trial.isCancelled())
                .filter(trial -> trial.getEndDate() == null || !trial.getEndDate().isBefore(LocalDate.now()))
                .filter(trial -> trial.getSite() != null)
                .filter(trial -> {
                    GeoPoint sitePoint = new GeoPoint(
                            trial.getSite().getLatitude(),
                            trial.getSite().getLongitude()
                    );
                    return userPoint.distanceTo(sitePoint) <= radiusKm;
                })
                .map(trial -> TrialWithLocationDto.builder()
                        .trialId(trial.getId())
                        .trialName(trial.getName())
                        .startDate(trial.getStartDate())
                        .startHour(trial.getStartHour())
                        .endDate(trial.getEndDate())
                        .endHour(trial.getEndHour())
                        .siteId(trial.getSite().getId())
                        .siteAddress(trial.getSite().getAdress())
                        .latitude(trial.getSite().getLatitude())
                        .longitude(trial.getSite().getLongitude())
                        .distanceKm(userPoint.distanceTo(new GeoPoint(
                                trial.getSite().getLatitude(),
                                trial.getSite().getLongitude()
                        )))
                        .build())
                .sorted(java.util.Comparator.comparingDouble(TrialWithLocationDto::getDistanceKm))
                .toList();
    }
}
