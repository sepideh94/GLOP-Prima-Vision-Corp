package com.ciblorgasport.geolocation.api;

import com.ciblorgasport.geolocation.application.usecase.GetMapDataUseCase;
import com.ciblorgasport.geolocation.dto.MapDataResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/map")
@RequiredArgsConstructor
public class MapController {

    private final GetMapDataUseCase getMapDataUseCase;

    /**
     * GET /map/data
     * Retourne toutes les données nécessaires pour alimenter la carte interactive.
     */
    @GetMapping("/data")
    public ResponseEntity<MapDataResponse> getMapData(
            @RequestParam(defaultValue = "false") boolean includeAthletes
    ) {
        return ResponseEntity.ok(getMapDataUseCase.execute(includeAthletes));
    }
}
