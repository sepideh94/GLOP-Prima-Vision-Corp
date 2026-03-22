package com.ciblorgasport.geolocation.api;

import com.ciblorgasport.geolocation.application.usecase.ListAdminAthleteLocationsUseCase;
import com.ciblorgasport.geolocation.dto.AthleteLocationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/map")
@RequiredArgsConstructor
public class AdminMapController {

    private final ListAdminAthleteLocationsUseCase listAdminAthleteLocationsUseCase;

    /**
     * Positions de suivi avec identité (réservé admin).
     */
    @GetMapping("/athlete-locations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AthleteLocationResponse>> listAthleteLocations() {
        return ResponseEntity.ok(listAdminAthleteLocationsUseCase.execute());
    }
}
