package com.ciblorgasport.site.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.site.application.SiteService;
import com.ciblorgasport.site.dto.SiteResponse;

import lombok.RequiredArgsConstructor;

/**
 * Endpoints en lecture seule accessibles à tous les utilisateurs authentifiés.
 * Le CRUD admin reste sur /api/admin/sites (SiteController).
 */
@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SitePublicController {

    private final SiteService siteService;

    @GetMapping
    public ResponseEntity<List<SiteResponse>> getAllSites() {
        return ResponseEntity.ok(siteService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SiteResponse> getSiteById(@PathVariable Long id) {
        return ResponseEntity.ok(siteService.getById(id));
    }
}
