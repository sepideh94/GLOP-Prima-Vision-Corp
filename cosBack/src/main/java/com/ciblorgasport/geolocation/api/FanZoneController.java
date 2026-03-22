package com.ciblorgasport.geolocation.api;

import com.ciblorgasport.geolocation.application.usecase.*;
import com.ciblorgasport.geolocation.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FanZoneController {

    private final CreateFanZoneUseCase createFanZoneUseCase;
    private final CreateFanZoneFromGooglePlaceUseCase createFromGooglePlaceUseCase;
    private final FindNearbyFanZonesUseCase findNearbyFanZonesUseCase;
    private final FindNearbyTrialsUseCase findNearbyTrialsUseCase;
    private final GetDirectionsUseCase getDirectionsUseCase;

    // ── Admin ────────────────────────────────────────────────────────────────

    @PostMapping("/api/admin/fan-zones")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FanZoneResponse> create(@Valid @RequestBody FanZoneCreateRequest request) {
        return ResponseEntity.ok(createFanZoneUseCase.execute(request));
    }

    @PostMapping("/api/admin/fan-zones/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FanZoneResponse> importFromGoogleMaps(@Valid @RequestBody GooglePlaceImportRequest request) {
        return ResponseEntity.ok(createFromGooglePlaceUseCase.execute(request));
    }

    @GetMapping("/api/admin/fan-zones")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FanZoneResponse>> getAll() {
        return ResponseEntity.ok(createFanZoneUseCase.findAll());
    }

    @DeleteMapping("/api/admin/fan-zones/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        createFanZoneUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Spectateur ───────────────────────────────────────────────────────────

    @GetMapping("/api/fan-zones/nearby")
    public ResponseEntity<NearbyFanZonesResponse> findNearbyFanZones(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "5.0") double radiusKm
    ) {
        return ResponseEntity.ok(findNearbyFanZonesUseCase.execute(latitude, longitude, radiusKm));
    }

    @GetMapping("/api/trials/nearby")
    public ResponseEntity<List<TrialWithLocationDto>> findNearbyTrials(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "10.0") double radiusKm
    ) {
        return ResponseEntity.ok(findNearbyTrialsUseCase.execute(latitude, longitude, radiusKm));
    }

    @PostMapping("/api/directions")
    public ResponseEntity<DirectionsResponse> getDirections(@Valid @RequestBody DirectionsRequest request) {
        return ResponseEntity.ok(getDirectionsUseCase.execute(request));
    }
}
