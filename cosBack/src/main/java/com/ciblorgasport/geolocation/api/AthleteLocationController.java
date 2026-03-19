package com.ciblorgasport.geolocation.api;

import com.ciblorgasport.geolocation.application.usecase.GetAthleteMeetingInfoUseCase;
import com.ciblorgasport.geolocation.application.usecase.UpdateAthleteLocationUseCase;
import com.ciblorgasport.geolocation.dto.AthleteMeetingInfoResponse;
import com.ciblorgasport.geolocation.dto.AthleteLocationResponse;
import com.ciblorgasport.geolocation.dto.AthleteLocationUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/athletes")
@RequiredArgsConstructor
public class AthleteLocationController {

    private final UpdateAthleteLocationUseCase updateAthleteLocationUseCase;
    private final GetAthleteMeetingInfoUseCase getAthleteMeetingInfoUseCase;

    @PutMapping("/{athleteId}/location")
    @PreAuthorize("hasRole('ATHLETE') or hasRole('ADMIN')")
    public ResponseEntity<AthleteLocationResponse> updateLocation(
            @PathVariable Long athleteId,
            @Valid @RequestBody AthleteLocationUpdateRequest request
    ) {
        return ResponseEntity.ok(updateAthleteLocationUseCase.execute(athleteId, request));
    }

    @GetMapping("/{athleteId}/meeting-info")
    @PreAuthorize("hasRole('ATHLETE') or hasRole('ADMIN')")
    public ResponseEntity<List<AthleteMeetingInfoResponse>> getMeetingInfo(@PathVariable Long athleteId) {
        return ResponseEntity.ok(getAthleteMeetingInfoUseCase.execute(athleteId));
    }
}
