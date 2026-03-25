package com.ciblorgasport.site.application;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ciblorgasport.common.exception.BusinessValidationException;
import com.ciblorgasport.common.exception.ResourceNotFoundException;
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.site.dto.SiteCreateRequest;
import com.ciblorgasport.site.dto.SiteResponse;
import com.ciblorgasport.site.dto.SiteUpdateRequest;
import com.ciblorgasport.site.infrastructure.SiteRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SiteServiceImpl implements SiteService {
    private final SiteRepository siteRepository;

    /** Tolérance ~22 m pour considérer deux points comme le même lieu (Places / géocode). */
    private static final double COORD_TOLERANCE = 0.0002;

    @Transactional
    @Override
    public SiteResponse resolveOrCreate(SiteCreateRequest request) {
        String addr = request.getAdress() == null ? "" : request.getAdress().trim();
        if (addr.isEmpty()) {
            throw new BusinessValidationException("L'adresse du lieu est obligatoire.");
        }
        double lat = request.getLatitude();
        double lng = request.getLongitude();
        if (!Double.isFinite(lat) || !Double.isFinite(lng)) {
            throw new BusinessValidationException("Coordonnées GPS invalides.");
        }

        double latMin = lat - COORD_TOLERANCE;
        double latMax = lat + COORD_TOLERANCE;
        double lngMin = lng - COORD_TOLERANCE;
        double lngMax = lng + COORD_TOLERANCE;

        List<Site> candidates = siteRepository.findInBoundingBox(latMin, latMax, lngMin, lngMax);
        for (Site s : candidates) {
            if (Math.abs(s.getLatitude() - lat) < COORD_TOLERANCE
                    && Math.abs(s.getLongitude() - lng) < COORD_TOLERANCE) {
                return SiteResponse.fromEntity(s);
            }
        }

        Optional<Site> sameAddress = siteRepository.findFirstByAdressIgnoreCase(addr);
        if (sameAddress.isPresent()) {
            return SiteResponse.fromEntity(sameAddress.get());
        }

        Site newSite = new Site();
        newSite.setAdress(addr);
        newSite.setLatitude(lat);
        newSite.setLongitude(lng);
        Site saved = siteRepository.save(newSite);
        return SiteResponse.fromEntity(saved);
    }

    @Transactional
    @Override
    public SiteResponse create(SiteCreateRequest request) {
        Site newSite = new Site();
        newSite.setAdress(request.getAdress());
        newSite.setLatitude(request.getLatitude());
        newSite.setLongitude(request.getLongitude());

        Site savedSite = siteRepository.save(newSite);
        return SiteResponse.fromEntity(savedSite);
    }

    @Transactional
    @Override
    public SiteResponse update(Long id, SiteUpdateRequest request) {
        Site existingSite = getSiteByIdOrThrow(id);

        existingSite.setAdress(request.getAdress());
        existingSite.setLatitude(request.getLatitude());
        existingSite.setLongitude(request.getLongitude());

        Site updatedSite = siteRepository.save(existingSite);
        return SiteResponse.fromEntity(updatedSite);
    }

    @Override
    public SiteResponse getById(Long id) {
        return SiteResponse.fromEntity(getSiteByIdOrThrow(id));
    }

    @Override
    public List<SiteResponse> getAll() {
        return siteRepository.findAll().stream()
                .map(SiteResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        if (!siteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Site introuvable avec l'ID: " + id);
        }
        siteRepository.deleteById(id);
    }

    private Site getSiteByIdOrThrow(Long id) {
        return siteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Site introuvable avec l'ID: " + id));
    }
}
