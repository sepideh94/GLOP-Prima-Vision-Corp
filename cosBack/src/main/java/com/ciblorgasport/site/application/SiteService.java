package com.ciblorgasport.site.application;

import java.util.List;

import com.ciblorgasport.site.dto.SiteCreateRequest;
import com.ciblorgasport.site.dto.SiteResponse;
import com.ciblorgasport.site.dto.SiteUpdateRequest;

public interface SiteService {

    /**
     * Retrouve un site proche des coordonnées ou avec la même adresse (insensible à la casse),
     * sinon le crée. Évite au client de charger toute la liste des sites.
     */
    SiteResponse resolveOrCreate(SiteCreateRequest request);

    SiteResponse create(SiteCreateRequest request);

    SiteResponse update(Long id, SiteUpdateRequest request);

    SiteResponse getById(Long id);

    List<SiteResponse> getAll();

    void delete(Long id);
}
