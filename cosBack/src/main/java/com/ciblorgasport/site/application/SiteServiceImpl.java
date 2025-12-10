package com.ciblorgasport.site.application;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

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
            throw new RuntimeException("Site introuvable avec l'ID: " + id);
        }
        siteRepository.deleteById(id);
    }

    private Site getSiteByIdOrThrow(Long id) {
        return siteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site introuvable avec l'ID: " + id));
    }
}
