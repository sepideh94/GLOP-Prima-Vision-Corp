package com.ciblorgasport.site.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.site.application.SiteService;
import com.ciblorgasport.site.dto.SiteCreateRequest;
import com.ciblorgasport.site.dto.SiteResponse;
import com.ciblorgasport.site.dto.SiteUpdateRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/sites")
@RequiredArgsConstructor
public class SiteController {

    private final SiteService siteService;

    @PostMapping
    public ResponseEntity<SiteResponse> createSite(@Valid @RequestBody SiteCreateRequest request) {
        SiteResponse newSite = siteService.create(request);
        return new ResponseEntity<>(newSite, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SiteResponse> updateSite(@PathVariable("id") Long id,
                                                    @Valid @RequestBody SiteUpdateRequest request) {
        SiteResponse updatedSite = siteService.update(id, request);
        return ResponseEntity.ok(updatedSite);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SiteResponse> getSiteById(@PathVariable("id") Long id) {
        SiteResponse site = siteService.getById(id);
        return ResponseEntity.ok(site);
    }

    @GetMapping
    public ResponseEntity<List<SiteResponse>> getAllSites() {
        List<SiteResponse> sites = siteService.getAll();
        return ResponseEntity.ok(sites);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSite(@PathVariable("id") Long id) {
        siteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
