package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.geolocation.domain.AthleteLocation;
import com.ciblorgasport.geolocation.dto.AthleteLocationResponse;
import com.ciblorgasport.geolocation.infrastructure.AthleteLocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ListAdminAthleteLocationsUseCase {

    private final AthleteLocationRepository athleteLocationRepository;
    private final AthleteRepository athleteRepository;

    @Transactional(readOnly = true)
    public List<AthleteLocationResponse> execute() {
        return athleteLocationRepository.findAll().stream()
                .map(this::toResponseWithName)
                .collect(Collectors.toList());
    }

    private AthleteLocationResponse toResponseWithName(AthleteLocation loc) {
        AthleteLocationResponse r = AthleteLocationResponse.fromEntity(loc);
        athleteRepository.findById(loc.getAthleteId()).ifPresent(a -> applyAthleteNames(r, a));
        return r;
    }

    private void applyAthleteNames(AthleteLocationResponse r, Athlete athlete) {
        r.setFirstName(athlete.getFirstName());
        r.setLastName(athlete.getLastName());
    }
}
