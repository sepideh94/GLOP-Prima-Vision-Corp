package com.ciblorgasport.site.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.site.application.SiteService;
import com.ciblorgasport.site.dto.SiteCreateRequest;
import com.ciblorgasport.site.dto.SiteResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Lecture pour tout utilisateur authentifié ; création réservée aux rôles qui gèrent les épreuves
 * (commissionnaire ou admin), afin de ne pas dépendre de {@code /api/admin/sites} pour enregistrer un lieu.
 * Le CRUD complet admin reste sur /api/admin/sites (SiteController).
 */
@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SitePublicController {

    private final SiteService siteService;

    /**
     * Idempotent : réutilise un site déjà connu (mêmes coordonnées à ~20 m ou même adresse),
     * sinon en crée un. À utiliser depuis la sélection Google Places (épreuves, cartes).
     */
    @PostMapping("/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMMISSIONNER')")
    public ResponseEntity<SiteResponse> resolveSite(@Valid @RequestBody SiteCreateRequest request) {
        SiteResponse site = siteService.resolveOrCreate(request);
        return ResponseEntity.ok(site);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COMMISSIONNER')")
    public ResponseEntity<SiteResponse> createSite(@Valid @RequestBody SiteCreateRequest request) {
        SiteResponse created = siteService.create(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SiteResponse>> getAllSites() {
        return ResponseEntity.ok(siteService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SiteResponse> getSiteById(@PathVariable Long id) {
        return ResponseEntity.ok(siteService.getById(id));
    }
}
