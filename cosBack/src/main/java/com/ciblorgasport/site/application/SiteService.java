package com.ciblorgasport.site.application;

import java.util.List;

import com.ciblorgasport.site.dto.SiteCreateRequest;
import com.ciblorgasport.site.dto.SiteResponse;
import com.ciblorgasport.site.dto.SiteUpdateRequest;

public interface SiteService {

    SiteResponse create(SiteCreateRequest request);

    SiteResponse update(Long id, SiteUpdateRequest request);

    SiteResponse getById(Long id);

    List<SiteResponse> getAll();

    void delete(Long id);
}
