package com.ciblorgasport.geolocation.application.usecase;

import com.ciblorgasport.common.exception.BusinessValidationException;
import com.ciblorgasport.common.exception.ResourceNotFoundException;
import com.ciblorgasport.geolocation.application.port.GeoLocationService;
import com.ciblorgasport.geolocation.application.port.RouteInfo;
import com.ciblorgasport.geolocation.application.port.TravelMode;
import com.ciblorgasport.geolocation.domain.FanZone;
import com.ciblorgasport.geolocation.dto.DirectionsRequest;
import com.ciblorgasport.geolocation.dto.DirectionsResponse;
import com.ciblorgasport.geolocation.infrastructure.FanZoneRepository;
import com.ciblorgasport.site.infrastructure.SiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetDirectionsUseCase {

    private final GeoLocationService geoLocationService;
    private final SiteRepository siteRepository;
    private final FanZoneRepository fanZoneRepository;

    public DirectionsResponse execute(DirectionsRequest request) {
        double[] destination = resolveDestination(request);
        TravelMode mode = request.getTravelMode() != null ? request.getTravelMode() : TravelMode.DRIVING;

        RouteInfo route = geoLocationService.calculateRoute(
                request.getFromLatitude(),
                request.getFromLongitude(),
                destination[0],
                destination[1],
                mode
        );

        return DirectionsResponse.builder()
                .summary(route.getSummary())
                .distanceKm(route.getDistanceKm())
                .durationMinutes(route.getDurationMinutes())
                .polyline(route.getPolyline())
                .htmlInstructions(route.getHtmlInstructions())
                .destinationLatitude(destination[0])
                .destinationLongitude(destination[1])
                .build();
    }

    private double[] resolveDestination(DirectionsRequest request) {
        if (request.getSiteId() != null) {
            return siteRepository.findById(request.getSiteId())
                    .map(s -> new double[]{s.getLatitude(), s.getLongitude()})
                    .orElseThrow(() -> new ResourceNotFoundException("Site introuvable: " + request.getSiteId()));
        }
        if (request.getFanZoneId() != null) {
            return fanZoneRepository.findById(request.getFanZoneId())
                    .map(fz -> new double[]{fz.getLatitude(), fz.getLongitude()})
                    .orElseThrow(() -> new ResourceNotFoundException("Fan zone introuvable: " + request.getFanZoneId()));
        }
        if (request.getToLatitude() != null && request.getToLongitude() != null) {
            return new double[]{request.getToLatitude(), request.getToLongitude()};
        }
        throw new BusinessValidationException("Destination non spécifiée. Fournir siteId, fanZoneId ou coordonnées GPS.");
    }
}
